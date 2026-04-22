<?php
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $apellido = $_POST['apellido'];
    $cedula = $_POST['cedula'];
    $correo = $_POST['correo'];
    // Encriptamos la contraseña con BCRYPT
    $pass = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $descripcion = $_POST['descripcion'];

    // Insertar Usuario
    $sql_user = "INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, password) VALUES ('$nombre', '$apellido', '$cedula', '$correo', '$pass')";
    
    if ($conn->query($sql_user) === TRUE) {
        $last_id = $conn->insert_id;
        // Insertar Ubicación (Coordenadas fijas para prueba en David)
        $sql_ubi = "INSERT INTO ubicaciones_servicio (usuario_id, descripcion_direccion, coordenadas_gps) VALUES ('$last_id', '$descripcion', ST_GeomFromText('POINT(8.43 -82.43)'))";
        $conn->query($sql_ubi);
        
        echo "<div class='alert alert-success'>Registro exitoso. Espera validación.</div>";
    } else {
        echo "Error: " . $conn->error;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Registro SmartSACH</title>
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="card mx-auto" style="max-width: 500px;">
            <div class="card-body">
                <h3 class="text-center">Creación de cuenta</h3>
                <form method="POST">
                    <input type="text" name="nombre" class="form-control mb-2" placeholder="Nombre" required>
                    <input type="text" name="apellido" class="form-control mb-2" placeholder="Apellido" required>
                    <input type="text" name="cedula" class="form-control mb-2" placeholder="Cédula" required>
                    <input type="email" name="correo" class="form-control mb-2" placeholder="Correo electrónico" required>
                    <input type="password" name="password" class="form-control mb-2" placeholder="Contraseña" required>
                    <textarea name="descripcion" class="form-control mb-3" placeholder="Descripción de ubicación exacta"></textarea>
                    <button type="submit" class="btn btn-success w-100">Registrar</button>
                </form>
                <p class="mt-3 text-center">¿Ya tienes cuenta? <a href="login.php">Ingresar</a></p>
            </div>
        </div>
    </div>
</body>
</html>