<?php
session_start();
include 'config.php';

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $correo = trim($_POST['correo']);
    $pass = trim($_POST['password']);
    
    $sql = "SELECT usuario_id, nombre, password FROM usuarios WHERE correo_electronico = '$correo'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if ($pass == $user['password']) {
            $_SESSION['usuario_id'] = $user['usuario_id'];
            $_SESSION['nombre'] = $user['nombre'];
            header("Location: dashboard.php");
            exit();
        } else {
            $error = "Contraseña incorrecta";
        }
    } else {
        $error = "Usuario no encontrado";
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
        <div class="card mx-auto" style="max-width: 400px;">
            <div class="card-body">
                <h3>SmartSACH</h3>
                <?php if($error != ''): ?>
                    <div class='alert alert-danger'><?php echo $error; ?></div>
                <?php endif; ?>
                <form method="POST" action="">
                    <input type="email" name="correo" class="form-control mb-3" placeholder="Correo" required>
                    <input type="password" name="password" class="form-control mb-3" placeholder="Contraseña" required>
                    <button type="submit" class="btn btn-success w-100">Ingresar</button>
                </form>
            </div>
        </div>
    </div>
</body>
</html>