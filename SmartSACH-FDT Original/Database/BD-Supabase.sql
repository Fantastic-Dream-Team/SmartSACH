-- Habilitar extensión para geolocalización (necesaria para el rastreo en David)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Tabla de Usuarios
CREATE TABLE usuarios (
    usuario_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    estado_verificacion VARCHAR(20) CHECK (estado_verificacion IN ('pendiente', 'activo', 'suspendido')) DEFAULT 'pendiente',
    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);

-- 2. Tabla de Ubicaciones (Uso de GEOGRAPHY para precisión GPS)
CREATE TABLE ubicaciones_servicio (
    ubicacion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre_referencia VARCHAR(50),
    coordenadas_gps GEOGRAPHY(POINT, 4326) NOT NULL, 
    descripcion_direccion TEXT,
    foto_url VARCHAR(255),
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 3. Tabla de Rutas
CREATE TABLE rutas (
    ruta_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_ruta VARCHAR(100) NOT NULL,
    zona_sector VARCHAR(100),
    horario_estimado VARCHAR(100),
    estado_ruta VARCHAR(20) CHECK (estado_ruta IN ('activa', 'mantenimiento', 'inactiva')) DEFAULT 'activa'
);

-- 4. Suscripciones
CREATE TABLE suscripciones (
    suscripcion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id),
    ubicacion_id INT NOT NULL REFERENCES ubicaciones_servicio(ubicacion_id),
    ruta_id INT NOT NULL REFERENCES rutas(ruta_id),
    fecha_activacion DATE,
    proximo_vencimiento DATE,
    estado_pago VARCHAR(20) CHECK (estado_pago IN ('al_dia', 'moroso')) DEFAULT 'al_dia'
);

-- 5. Historial de Pagos
CREATE TABLE pagos (
    pago_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    suscripcion_id INT NOT NULL REFERENCES suscripciones(suscripcion_id),
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50),
    comprobante_url VARCHAR(255)
);

-- 6. Rastreo de Camiones (Actualización automática de timestamp)
CREATE TABLE camiones_rastreo (
    camion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ruta_id INT NOT NULL REFERENCES rutas(ruta_id) ON DELETE CASCADE,
    placa_vehiculo VARCHAR(20) NOT NULL UNIQUE,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    ultima_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sistema de Notificaciones
CREATE TABLE notificaciones (
    notificacion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo_notificacion VARCHAR(20) CHECK (tipo_notificacion IN ('pago', 'ruta', 'sistema', 'incidencia')) DEFAULT 'sistema',
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Reportes e Incidencias
CREATE TABLE reportes_incidencias (
    reporte_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id),
    ubicacion_id INT NOT NULL REFERENCES ubicaciones_servicio(ubicacion_id),
    tipo_incidencia VARCHAR(30) CHECK (tipo_incidencia IN ('no_paso_camion', 'mala_atencion', 'desperdicio_en_via', 'otro')) NOT NULL,
    descripcion TEXT,
    estado_reporte VARCHAR(20) CHECK (estado_reporte IN ('abierto', 'en_proceso', 'resuelto', 'cerrado')) DEFAULT 'abierto',
    fecha_reporte TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
