<?php
session_start();
require_once 'config.php';
require_once 'clases.php';

$error = "";
$userObj = new Usuario($conn);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = $userObj->login($_POST['correo'], $_POST['password']);
    if ($user) {
        $_SESSION['usuario_id'] = $user['usuario_id'];
        $_SESSION['nombre'] = $user['nombre'];
        header("Location: dashboard.php");
        exit();
    } else {
        $error = "Credenciales incorrectas.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Login - <?php echo APP_NAME; ?></title>
</head>
<body class="d-flex align-items-center" style="height: 100vh;">
    <div class="container text-center">
        <div class="card mx-auto shadow" style="max-width: 400px;">
            <div class="card-body">
                <h4 class="mb-4 text-success"><?php echo APP_NAME; ?></h4>
                <?php if($error) echo "<div class='alert alert-danger'>$error</div>"; ?>
                <form method="POST">
                    <input type="email" name="correo" class="form-control mb-3" placeholder="Correo" required>
                    <input type="password" name="password" class="form-control mb-3" placeholder="Contraseña" required>
                    <button type="submit" class="btn btn-success w-100">Ingresar</button>
                </form>
                <div class="mt-3"><a href="registro.php">Crear cuenta</a></div>
            </div>
        </div>
    </div>
</body>
</html>