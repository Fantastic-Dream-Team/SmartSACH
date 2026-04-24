<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$nombre = $data['nombre'];
$apellido = $data['apellido'];
$cedula = $data['cedula'];
$correo = $data['correo'];
$password = $data['password'];
$direccion = $data['direccion'];

// Verificar si el usuario ya existe
$check = $conn->query("SELECT * FROM usuarios WHERE correo_electronico = '$correo' OR cedula = '$cedula'");
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El correo o cédula ya está registrado"]);
    exit();
}

$sql = "INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, password, estado_verificacion) 
        VALUES ('$nombre', '$apellido', '$cedula', '$correo', '$password', 'pendiente')";

if ($conn->query($sql)) {
    $usuario_id = $conn->insert_id;
    
    // Insertar ubicación
    $sql_ubi = "INSERT INTO ubicaciones_servicio (usuario_id, descripcion_direccion, coordenadas_gps) 
                VALUES ('$usuario_id', '$direccion', ST_GeomFromText('POINT(8.4289 -82.4283)'))";
    $conn->query($sql_ubi);
    
    echo json_encode(["success" => true, "message" => "Usuario registrado exitosamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar: " . $conn->error]);
}
?>