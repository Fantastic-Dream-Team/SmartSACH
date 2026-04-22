<?php
session_start();
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $correo = $_POST['correo'];
    $pass = $_POST['password'];

    $sql = "SELECT * FROM usuarios WHERE correo_electronico = '$correo'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        // Verificamos el hash
        if (password_verify($pass, $user['password'])) {
            $_SESSION['usuario_id'] = $user['usuario_id'];
            $_SESSION['nombre'] = $user['nombre'];
            header("Location: dashboard.php");
        } else {
            echo "<div class='alert alert-danger'>Contraseña incorrecta.</div>";
        }
    } else {
        echo "<div class='alert alert-danger'>Usuario no encontrado.</div>";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Login SmartSACH</title>
</head>
<body class="d-flex align-items-center" style="height: 100vh;">
    <div class="container text-center">
        <img src="logo_sach.png" style="width: 150px;" class="mb-4">
        <div class="card mx-auto" style="max-width: 400px;">
            <div class="card-body">
                <form method="POST">
                    <input type="email" name="correo" class="form-control mb-3" placeholder="Correo electrónico" required>
                    <input type="password" name="password" class="form-control mb-3" placeholder="Contraseña" required>
                    <button type="submit" class="btn btn-success w-100">Ingresar</button>
                </form>
                <div class="mt-3">
                    <a href="registro.php">Crear cuenta</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>