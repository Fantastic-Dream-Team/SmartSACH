-- 1. TRIGGER: ACTIVACIÓN AUTOMÁTICA DE SUSCRIPCIÓN
-- En PostgreSQL, primero se crea la función y luego el trigger.

CREATE OR REPLACE FUNCTION activar_suscripcion_inicial()
RETURNS TRIGGER AS $$
DECLARE
    v_ubicacion_id INT;
BEGIN
    IF OLD.estado_verificacion = 'pendiente' AND NEW.estado_verificacion = 'activo' THEN
        -- Obtener la primera ubicacion del usuario
        SELECT ubicacion_id INTO v_ubicacion_id 
        FROM ubicaciones_servicio 
        WHERE usuario_id = NEW.usuario_id 
        LIMIT 1;

        IF FOUND THEN
            INSERT INTO suscripciones (usuario_id, ubicacion_id, ruta_id, fecha_activacion, proximo_vencimiento, estado_pago)
            VALUES (
                NEW.usuario_id, 
                v_ubicacion_id, 
                1, -- Asigna la ruta 1 por defecto
                CURRENT_DATE, 
                CURRENT_DATE + INTERVAL '30 days', 
                'al_dia'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_activar_suscripcion_inicial
AFTER UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION activar_suscripcion_inicial();


-- 2. STORED PROCEDURE: REGISTRO DE PAGOS Y RENOVACIÓN
-- En PostgreSQL, usamos funciones o procedimientos. Aquí usaremos un procedimiento.

CREATE OR REPLACE PROCEDURE sp_procesar_pago_sach(
    p_suscripcion_id INT,
    p_monto DECIMAL,
    p_metodo VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Registrar el pago
    INSERT INTO pagos (suscripcion_id, monto, metodo_pago)
    VALUES (p_suscripcion_id, p_monto, p_metodo);

    -- Actualizar la fecha de vencimiento y poner al día
    UPDATE suscripciones 
    SET proximo_vencimiento = proximo_vencimiento + INTERVAL '30 days',
        estado_pago = 'al_dia'
    WHERE suscripcion_id = p_suscripcion_id;
END;
$$;


-- 3. TRIGGER: NOTIFICACIÓN POR MOVIMIENTO DE CAMIÓN

CREATE OR REPLACE FUNCTION alerta_proximidad_sach()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitud <> OLD.latitud OR NEW.longitud <> OLD.longitud THEN
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo_notificacion)
        SELECT s.usuario_id, '¡Camión SACH en camino!', 
               'El recolector de la ruta está cerca.', 'ruta'
        FROM suscripciones s
        WHERE s.ruta_id = NEW.ruta_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_alerta_proximidad_sach
AFTER UPDATE ON camiones_rastreo
FOR EACH ROW
EXECUTE FUNCTION alerta_proximidad_sach();