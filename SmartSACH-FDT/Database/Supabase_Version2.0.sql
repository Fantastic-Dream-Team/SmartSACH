-- ==========================================
-- SCRIPT LIMPIO Y OPTIMIZADO PARA SMARTSACH DAVID
-- INTEGRADO CON SUPABASE AUTH DIRECTO
-- ==========================================

-- Habilitar extensión para geolocalización (necesaria para el rastreo en David)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Tabla de Usuarios (Sincronizada con Supabase Auth)
CREATE TABLE public.usuarios (
    usuario_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auth_id UUID UNIQUE, -- Enlace directo al ID secreto de auth.users de Supabase
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    estado_verificacion VARCHAR(20) CHECK (estado_verificacion IN ('pendiente', 'activo', 'suspendido')) DEFAULT 'pendiente',
    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_usuarios_correo ON public.usuarios(correo_electronico);
CREATE INDEX idx_usuarios_cedula ON public.usuarios(cedula);

-- 2. Tabla de Ubicaciones (Uso de GEOGRAPHY para precisión GPS)
CREATE TABLE public.ubicaciones_servicio (
    ubicacion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre_referencia VARCHAR(50),
    coordenadas_gps GEOGRAPHY(POINT, 4326) NOT NULL, 
    descripcion_direccion TEXT,
    foto_url VARCHAR(255),
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE
);

-- 3. Tabla de Rutas
CREATE TABLE public.rutas (
    ruta_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_ruta VARCHAR(100) NOT NULL,
    zona_sector VARCHAR(100),
    horario_estimado VARCHAR(100),
    estado_ruta VARCHAR(20) CHECK (estado_ruta IN ('activa', 'mantenimiento', 'inactiva')) DEFAULT 'activa'
);

-- 4. Suscripciones
CREATE TABLE public.suscripciones (
    suscripcion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
    ubicacion_id INT NOT NULL REFERENCES public.ubicaciones_servicio(ubicacion_id) ON DELETE CASCADE,
    ruta_id INT NOT NULL REFERENCES public.rutas(ruta_id),
    fecha_activacion DATE,
    proximo_vencimiento DATE,
    estado_pago VARCHAR(20) CHECK (estado_pago IN ('al_dia', 'moroso')) DEFAULT 'al_dia'
);

-- 5. Historial de Pagos
CREATE TABLE public.pagos (
    pago_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    suscripcion_id INT NOT NULL REFERENCES public.suscripciones(suscripcion_id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50),
    comprobante_url VARCHAR(255)
);

-- 6. Rastreo de Camiones (Actualización automática de timestamp)
CREATE TABLE public.camiones_rastreo (
    camion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ruta_id INT NOT NULL REFERENCES public.rutas(ruta_id) ON DELETE CASCADE,
    placa_vehiculo VARCHAR(20) NOT NULL UNIQUE,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    ultima_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sistema de Notificaciones
CREATE TABLE public.notificaciones (
    notificacion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo_notificacion VARCHAR(20) CHECK (tipo_notificacion IN ('pago', 'ruta', 'sistema', 'incidencia')) DEFAULT 'sistema',
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Reportes e Incidencias
CREATE TABLE public.reportes_incidencias (
    reporte_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
    ubicacion_id INT NOT NULL REFERENCES public.ubicaciones_servicio(ubicacion_id) ON DELETE CASCADE,
    tipo_incidencia VARCHAR(30) CHECK (tipo_incidencia IN ('no_paso_camion', 'mala_atencion', 'desperdicio_en_via', 'otro')) NOT NULL,
    descripcion TEXT,
    estado_reporte VARCHAR(20) CHECK (estado_reporte IN ('abierto', 'en_proceso', 'resuelto', 'cerrado')) DEFAULT 'abierto',
    fecha_reporte TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- SECCIÓN DE FUNCIONES Y TRIGGERS (LÓGICA)
-- ==========================================

-- TRIGGER 1: Sincronización Automática de Registro (Frontend Auth -> Tabla Pública)
CREATE OR REPLACE FUNCTION public.fn_sincronizar_auth_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (
        auth_id,
        nombre, 
        apellido, 
        cedula, 
        correo_electronico, 
        estado_verificacion
    )
    VALUES (
        NEW.id, -- El UUID nativo generado por Supabase Auth
        COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'), 
        COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo'),   
        COALESCE(NEW.raw_user_meta_data->>'cedula', '0-000-0000'), 
        NEW.email,
        'pendiente'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.fn_sincronizar_auth_usuario();


-- TRIGGER 2: Activación Inicial de Suscripción (Cuando pasa de 'pendiente' a 'activo')
CREATE OR REPLACE FUNCTION public.fn_activar_suscripcion_inicial()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado_verificacion = 'pendiente' AND NEW.estado_verificacion = 'activo' THEN
        INSERT INTO public.suscripciones (usuario_id, ubicacion_id, ruta_id, fecha_activacion, proximo_vencimiento, estado_pago)
        SELECT 
            NEW.usuario_id, 
            ub.ubicacion_id, 
            1, -- Ruta 1 por defecto
            CURRENT_DATE, 
            (CURRENT_DATE + INTERVAL '30 days'), 
            'al_dia'
        FROM public.ubicaciones_servicio ub 
        WHERE ub.usuario_id = NEW.usuario_id 
        LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_activar_suscripcion_inicial
AFTER UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.fn_activar_suscripcion_inicial();


-- TRIGGER 3: Alerta de Proximidad de Camión SACH
CREATE OR REPLACE FUNCTION public.fn_alerta_proximidad_sach()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitud <> OLD.latitud OR NEW.longitud <> OLD.longitud THEN
        INSERT INTO public.notificaciones (usuario_id, titulo, mensaje, tipo_notificacion)
        SELECT s.usuario_id, '¡Camión SACH en camino!', 
               'El recolector de la ruta se está moviendo en tu sector.', 'ruta'
        FROM public.suscripciones s
        WHERE s.ruta_id = NEW.ruta_id;
        
        NEW.ultima_actualizacion = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_alerta_proximidad_sach
BEFORE UPDATE ON public.camiones_rastreo
FOR EACH ROW EXECUTE FUNCTION public.fn_alerta_proximidad_sach();


-- PROCEDIMIENTO ALMACENADO: Procesar Pagos de SACH
CREATE OR REPLACE PROCEDURE public.sp_procesar_pago_sach(
    p_suscripcion_id INT,
    p_monto DECIMAL(10,2),
    p_metodo VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.pagos (suscripcion_id, monto, metodo_pago)
    VALUES (p_suscripcion_id, p_monto, p_metodo);

    UPDATE public.suscripciones 
    SET proximo_vencimiento = (proximo_vencimiento + INTERVAL '30 days'),
        estado_pago = 'al_dia'
    WHERE suscripcion_id = p_suscripcion_id;
END;
$$;