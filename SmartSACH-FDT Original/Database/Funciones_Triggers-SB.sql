-- 1. Función y Trigger para Activación Inicial
CREATE OR REPLACE FUNCTION fn_activar_suscripcion_inicial()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado_verificacion = 'pendiente' AND NEW.estado_verificacion = 'activo' THEN
        INSERT INTO suscripciones (usuario_id, ubicacion_id, ruta_id, fecha_activacion, proximo_vencimiento, estado_pago)
        SELECT 
            NEW.usuario_id, 
            ub.ubicacion_id, 
            1, -- Ruta 1 por defecto
            CURRENT_DATE, 
            (CURRENT_DATE + INTERVAL '30 days'), 
            'al_dia'
        FROM ubicaciones_servicio ub 
        WHERE ub.usuario_id = NEW.usuario_id 
        LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_activar_suscripcion_inicial
AFTER UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION fn_activar_suscripcion_inicial();

-- 2. Procedimiento para Procesar Pagos
CREATE OR REPLACE PROCEDURE sp_procesar_pago_sach(
    p_suscripcion_id INT,
    p_monto DECIMAL(10,2),
    p_metodo VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO pagos (suscripcion_id, monto, metodo_pago)
    VALUES (p_suscripcion_id, p_monto, p_metodo);

    UPDATE suscripciones 
    SET proximo_vencimiento = (proximo_vencimiento + INTERVAL '30 days'),
        estado_pago = 'al_dia'
    WHERE suscripcion_id = p_suscripcion_id;
END;
$$;

-- 3. Trigger para Alerta de Proximidad de Camión
CREATE OR REPLACE FUNCTION fn_alerta_proximidad_sach()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitud <> OLD.latitud OR NEW.longitud <> OLD.longitud THEN
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo_notificacion)
        SELECT s.usuario_id, '¡Camión SACH en camino!', 
               'El recolector de la ruta se está moviendo en tu sector.', 'ruta'
        FROM suscripciones s
        WHERE s.ruta_id = NEW.ruta_id;
        
        -- Actualizar timestamp de última posición
        NEW.ultima_actualizacion = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_alerta_proximidad_sach
BEFORE UPDATE ON camiones_rastreo
FOR EACH ROW EXECUTE FUNCTION fn_alerta_proximidad_sach();
