<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "1. Inicio<br>";

require_once 'config.php';

echo "2. Después de config.php<br>";

$usuario_id = 4;

echo "3. Usuario ID: $usuario_id<br>";

$sql = "SELECT r.nombre_ruta FROM suscripciones s JOIN rutas r ON s.ruta_id = r.ruta_id WHERE s.usuario_id = $usuario_id";

echo "4. SQL: $sql<br>";

$result = $conn->query($sql);

echo "5. Después de query<br>";

if ($result && $result->num_rows > 0) {
    $ruta = $result->fetch_assoc();
    echo "6. Ruta encontrada: " . $ruta['nombre_ruta'] . "<br>";
    echo json_encode(["success" => true, "ruta" => $ruta]);
} else {
    echo "6. No se encontraron resultados<br>";
    echo json_encode(["success" => false, "message" => "No tienes ruta asignada"]);
}

echo "<br>7. Fin";
?>