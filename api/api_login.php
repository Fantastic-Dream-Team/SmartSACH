<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$correo = $data['correo'];
$password = $data['password'];

$sql = "SELECT usuario_id, nombre, apellido, password FROM usuarios WHERE correo_electronico = '$correo'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
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