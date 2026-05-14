-- SmartSACH - Esquema extendido para Supabase (PostgreSQL)
-- Script idempotente: puedes ejecutarlo múltiples veces sin perder datos.

BEGIN;

CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    estado_verificacion VARCHAR(20) NOT NULL DEFAULT 'activo'
        CHECK (estado_verificacion IN ('pendiente', 'activo', 'suspendido')),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
    ADD COLUMN IF NOT EXISTS estado_verificacion VARCHAR(20) NOT NULL DEFAULT 'activo',
    ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS rutas (
    ruta_id SERIAL PRIMARY KEY,
    nombre_ruta VARCHAR(100) NOT NULL,
    zona_sector VARCHAR(100),
    horario_estimado VARCHAR(100),
    estado_ruta VARCHAR(20) NOT NULL DEFAULT 'activa'
        CHECK (estado_ruta IN ('activa', 'mantenimiento', 'inactiva')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ubicaciones_servicio (
    ubicacion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    nombre_referencia VARCHAR(255) NOT NULL,
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    descripcion_direccion TEXT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ubicaciones_servicio
    ADD COLUMN IF NOT EXISTS nombre_referencia VARCHAR(255),
    ADD COLUMN IF NOT EXISTS latitud NUMERIC(10, 8),
    ADD COLUMN IF NOT EXISTS longitud NUMERIC(11, 8),
    ADD COLUMN IF NOT EXISTS descripcion_direccion TEXT,
    ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS suscripciones (
    suscripcion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    ubicacion_id INT NOT NULL REFERENCES ubicaciones_servicio(ubicacion_id) ON DELETE CASCADE,
    ruta_id INT NOT NULL REFERENCES rutas(ruta_id),
    fecha_activacion DATE NOT NULL DEFAULT CURRENT_DATE,
    proximo_vencimiento DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    estado_pago VARCHAR(20) NOT NULL DEFAULT 'al_dia'
        CHECK (estado_pago IN ('al_dia', 'moroso')),
    estado_suscripcion VARCHAR(20) NOT NULL DEFAULT 'activa'
        CHECK (estado_suscripcion IN ('activa', 'pausada', 'cancelada')),
    monto_mensual DECIMAL(10, 2) NOT NULL DEFAULT 10.00
);

ALTER TABLE suscripciones
    ADD COLUMN IF NOT EXISTS estado_suscripcion VARCHAR(20) NOT NULL DEFAULT 'activa',
    ADD COLUMN IF NOT EXISTS monto_mensual DECIMAL(10, 2) NOT NULL DEFAULT 10.00;

CREATE TABLE IF NOT EXISTS pagos (
    pago_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    suscripcion_id INT NOT NULL REFERENCES suscripciones(suscripcion_id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'Pago web',
    periodo_referencia VARCHAR(7),
    estado_pago VARCHAR(20) NOT NULL DEFAULT 'pagado'
        CHECK (estado_pago IN ('pagado', 'reversado'))
);

ALTER TABLE pagos
    ADD COLUMN IF NOT EXISTS usuario_id INT,
    ADD COLUMN IF NOT EXISTS periodo_referencia VARCHAR(7),
    ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) NOT NULL DEFAULT 'pagado';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'pagos' AND column_name = 'usuario_id'
    ) THEN
        UPDATE pagos p
        SET usuario_id = s.usuario_id
        FROM suscripciones s
        WHERE p.usuario_id IS NULL AND p.suscripcion_id = s.suscripcion_id;
    END IF;
END $$;

ALTER TABLE pagos
    ALTER COLUMN usuario_id SET NOT NULL;

CREATE TABLE IF NOT EXISTS rutas_puntos (
    punto_id SERIAL PRIMARY KEY,
    ruta_id INT NOT NULL REFERENCES rutas(ruta_id) ON DELETE CASCADE,
    secuencia INT NOT NULL,
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_rutas_puntos_ruta_secuencia
    ON rutas_puntos (ruta_id, secuencia);

CREATE TABLE IF NOT EXISTS camiones_rastreo (
    camion_id SERIAL PRIMARY KEY,
    ruta_id INT NOT NULL REFERENCES rutas(ruta_id) ON DELETE CASCADE,
    placa_vehiculo VARCHAR(20) NOT NULL UNIQUE,
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reportes_servicio (
    reporte_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    ubicacion_id INT NOT NULL REFERENCES ubicaciones_servicio(ubicacion_id) ON DELETE CASCADE,
    tipo_incidencia VARCHAR(50) NOT NULL
        CHECK (tipo_incidencia IN ('no_paso_camion', 'mala_atencion', 'desperdicio_en_via', 'recomendacion', 'otro')),
    descripcion TEXT NOT NULL,
    estado_reporte VARCHAR(20) NOT NULL DEFAULT 'abierto'
        CHECK (estado_reporte IN ('abierto', 'en_proceso', 'resuelto', 'cerrado')),
    fecha_reporte TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ubicaciones_usuario ON ubicaciones_servicio(usuario_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario ON suscripciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_ubicacion ON suscripciones(ubicacion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes_servicio(usuario_id);

INSERT INTO rutas (ruta_id, nombre_ruta, zona_sector, horario_estimado, estado_ruta)
VALUES
    (1, 'Ruta David Centro', 'David Centro', 'Lunes a sábado 7:00 AM', 'activa'),
    (2, 'Ruta David Norte', 'San Mateo, El Cabrero', 'Lunes a sábado 9:00 AM', 'activa'),
    (3, 'Ruta David Sur', 'Pedregal, Doleguita', 'Lunes a sábado 1:00 PM', 'activa')
ON CONFLICT (ruta_id) DO NOTHING;

INSERT INTO camiones_rastreo (ruta_id, placa_vehiculo, latitud, longitud)
VALUES
    (1, 'SACH-101', 8.42860000, -82.43190000),
    (2, 'SACH-202', 8.44600000, -82.42500000),
    (3, 'SACH-303', 8.40550000, -82.44710000)
ON CONFLICT (placa_vehiculo) DO NOTHING;

INSERT INTO rutas_puntos (ruta_id, secuencia, latitud, longitud)
VALUES
    (1, 1, 8.43020000, -82.43510000),
    (1, 2, 8.43330000, -82.43020000),
    (1, 3, 8.42910000, -82.42450000),
    (1, 4, 8.42550000, -82.42880000)
ON CONFLICT (ruta_id, secuencia) DO NOTHING;

CREATE OR REPLACE VIEW vista_estado_cuenta_usuario AS
SELECT
    s.usuario_id,
    s.suscripcion_id,
    r.nombre_ruta,
    u.nombre_referencia,
    s.proximo_vencimiento,
    s.monto_mensual,
    CASE
        WHEN s.proximo_vencimiento >= CURRENT_DATE THEN 'PAZ Y SALVO'
        ELSE 'EN MORA'
    END AS estado_financiero,
    CASE
        WHEN s.proximo_vencimiento >= CURRENT_DATE THEN 0
        ELSE (CURRENT_DATE - s.proximo_vencimiento)
    END AS dias_mora
FROM suscripciones s
JOIN rutas r ON r.ruta_id = s.ruta_id
JOIN ubicaciones_servicio u ON u.ubicacion_id = s.ubicacion_id;

COMMIT;
