<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

$usuario_id = $_GET['usuario_id'];

$sql = "SELECT r.nombre_ruta, r.zona_sector, r.horario_estimado, 
               s.proximo_vencimiento, s.estado_pago
        FROM suscripciones s
        JOIN rutas r ON s.ruta_id = r.ruta_id
        WHERE s.usuario_id = $usuario_id";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $ruta = $result->fetch_assoc();
    echo json_encode(["success" => true, "ruta" => $ruta]);
} else {
    echo json_encode(["success" => false, "message" => "No tienes ruta asignada"]);
}
?>