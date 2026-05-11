-- 1. Tabla de Usuarios (Core)
CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Almacena el hash cifrado
    estado_verificacion VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_verificacion IN ('pendiente', 'activo', 'suspendido')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Rutas de Camiones
CREATE TABLE rutas (
    ruta_id SERIAL PRIMARY KEY,
    nombre_ruta VARCHAR(100) NOT NULL,
    zona_sector VARCHAR(100),
    horario_estimado VARCHAR(100),
    estado_ruta VARCHAR(20) DEFAULT 'activa' CHECK (estado_ruta IN ('activa', 'mantenimiento', 'inactiva'))
);

-- 3. Tabla de Ubicaciones (Escalabilidad: Un usuario puede tener N ubicaciones)
-- Nota: Para simplificar, he cambiado el tipo de dato POINT por coordenadas separadas o texto. 
-- Si necesitas usar datos espaciales reales en PostgreSQL, debes habilitar la extensión PostGIS.
CREATE TABLE ubicaciones_servicio (
    ubicacion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre_referencia VARCHAR(50), -- Ejemplo: "Casa Mama", "Local Comercial"
    latitud NUMERIC(10, 8),
    longitud NUMERIC(11, 8),
    descripcion_direccion TEXT,
    foto_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 4. Suscripciones y Paz y Salvo
CREATE TABLE suscripciones (
    suscripcion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    ruta_id INT NOT NULL,
    fecha_activacion DATE,
    proximo_vencimiento DATE, 
    estado_pago VARCHAR(20) DEFAULT 'al_dia' CHECK (estado_pago IN ('al_dia', 'moroso')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones_servicio(ubicacion_id),
    FOREIGN KEY (ruta_id) REFERENCES rutas(ruta_id)
);

-- 5. Historial de Pagos
CREATE TABLE pagos (
    pago_id SERIAL PRIMARY KEY,
    suscripcion_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50),
    comprobante_url VARCHAR(255),
    FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(suscripcion_id)
);

-- 6. Rastreo de Camiones en Tiempo Real
CREATE TABLE camiones_rastreo (
    camion_id SERIAL PRIMARY KEY,
    ruta_id INT NOT NULL,
    placa_vehiculo VARCHAR(20) NOT NULL UNIQUE,
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ruta_id) REFERENCES rutas(ruta_id) ON DELETE CASCADE
);

-- 7. Sistema de Notificaciones
CREATE TABLE notificaciones (
    notificacion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo_notificacion VARCHAR(20) DEFAULT 'sistema' CHECK (tipo_notificacion IN ('pago', 'ruta', 'sistema', 'incidencia')),
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 8. Reportes e Incidencias
CREATE TABLE reportes_incidencias (
    reporte_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    tipo_incidencia VARCHAR(50) NOT NULL CHECK (tipo_incidencia IN ('no_paso_camion', 'mala_atencion', 'desperdicio_en_via', 'otro')),
    descripcion TEXT,
    estado_reporte VARCHAR(20) DEFAULT 'abierto' CHECK (estado_reporte IN ('abierto', 'en_proceso', 'resuelto', 'cerrado')),
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones_servicio(ubicacion_id)
);

-- 9. VISTA: ESTADO DE PAZ Y SALVO EN TIEMPO REAL
CREATE OR REPLACE VIEW vista_paz_y_salvo_usuarios AS
SELECT 
    u.cedula,
    CONCAT(u.nombre, ' ', u.apellido) AS cliente,
    s.proximo_vencimiento,
    CASE 
        WHEN s.proximo_vencimiento >= CURRENT_DATE THEN 'PAZ Y SALVO'
        ELSE 'EN MORA'
    END AS estado_financiero,
    CURRENT_DATE - s.proximo_vencimiento AS dias_para_vencimiento
FROM usuarios u
JOIN suscripciones s ON u.usuario_id = s.usuario_id;