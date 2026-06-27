CREATE OR REPLACE VIEW vista_paz_y_salvo_usuarios AS
SELECT 
    u.cedula,
    (u.nombre || ' ' || u.apellido) AS cliente,
    s.proximo_vencimiento,
    CASE 
        WHEN s.proximo_vencimiento >= CURRENT_DATE THEN 'PAZ Y SALVO'
        ELSE 'EN MORA'
    END AS estado_financiero,
    (s.proximo_vencimiento - CURRENT_DATE) AS dias_para_vencimiento
FROM usuarios u
JOIN suscripciones s ON u.usuario_id = s.usuario_id;
