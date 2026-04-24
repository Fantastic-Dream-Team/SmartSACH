<?php
require_once 'config.php';

// Leer los datos enviados
$input = file_get_contents('php://input');

// Si no hay datos, enviar error
if (empty($input)) {
    echo json_encode(["success" => false, "message" => "No se recibieron datos"]);
    exit();
}

$data = json_decode($input, true);

// Verificar que los datos sean válidos
if (!$data || !is_array($data)) {
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit();
}

// Verificar que los campos existen
if (!isset($data['correo']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Correo y contraseña son requeridos"]);
    exit();
}

$correo = trim($data['correo']);
$password = trim($data['password']);

// Buscar usuario
$sql = "SELECT usuario_id, nombre, apellido, password FROM usuarios WHERE correo_electronico = '$correo'";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if ($password == $user['password']) {
        echo json_encode([
            "success" => true,
            "usuario_id" => $user['usuario_id'],
            "nombre" => $user['nombre'],
            "apellido" => $user['apellido']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
}
?>