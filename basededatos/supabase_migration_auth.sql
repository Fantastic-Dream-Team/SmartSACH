-- Ejecuta este script en Supabase SQL Editor si la base ya existía antes del frontend nuevo.
-- Es idempotente: agrega lo que falte sin borrar tus datos.

CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    estado_verificacion VARCHAR(20) DEFAULT 'pendiente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS nombre VARCHAR(50),
    ADD COLUMN IF NOT EXISTS apellido VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cedula VARCHAR(20),
    ADD COLUMN IF NOT EXISTS correo_electronico VARCHAR(100),
    ADD COLUMN IF NOT EXISTS password VARCHAR(255),
    ADD COLUMN IF NOT EXISTS estado_verificacion VARCHAR(20) DEFAULT 'pendiente',
    ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_cedula_key'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_cedula_key UNIQUE (cedula);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_correo_electronico_key'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_correo_electronico_key UNIQUE (correo_electronico);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS ubicaciones_servicio (
    ubicacion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    nombre_referencia VARCHAR(255),
    latitud NUMERIC(10, 8),
    longitud NUMERIC(11, 8),
    descripcion_direccion TEXT,
    foto_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ubicaciones_servicio
    ADD COLUMN IF NOT EXISTS nombre_referencia VARCHAR(255),
    ADD COLUMN IF NOT EXISTS latitud NUMERIC(10, 8),
    ADD COLUMN IF NOT EXISTS longitud NUMERIC(11, 8),
    ADD COLUMN IF NOT EXISTS descripcion_direccion TEXT,
    ADD COLUMN IF NOT EXISTS foto_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS rutas (
    ruta_id SERIAL PRIMARY KEY,
    nombre_ruta VARCHAR(100) NOT NULL,
    zona_sector VARCHAR(100),
    horario_estimado VARCHAR(100),
    estado_ruta VARCHAR(20) DEFAULT 'activa'
);

INSERT INTO rutas (ruta_id, nombre_ruta, zona_sector, horario_estimado, estado_ruta)
VALUES (1, 'Ruta David Centro', 'David, Chiriquí', 'Lunes a sábado', 'activa')
ON CONFLICT (ruta_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS suscripciones (
    suscripcion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id),
    ubicacion_id INT NOT NULL REFERENCES ubicaciones_servicio(ubicacion_id),
    ruta_id INT NOT NULL REFERENCES rutas(ruta_id),
    fecha_activacion DATE,
    proximo_vencimiento DATE,
    estado_pago VARCHAR(20) DEFAULT 'al_dia'
);

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
