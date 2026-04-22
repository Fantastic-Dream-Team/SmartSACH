<?php
session_start();

// 1. Verificación de Seguridad: Si no hay sesión, redirigir al login
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit();
}

// Datos del usuario desde la sesión
$nombreUsuario = $_SESSION['nombre'];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SmartSACH</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

    <nav class="navbar navbar-dark bg-success shadow-sm">
        <div class="container">
            <a class="navbar-brand" href="#">SmartSACH David</a>
            <a href="logout.php" class="btn btn-outline-light btn-sm">Cerrar Sesión</a>
        </div>
    </nav>

    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8 text-center">
                <div class="card shadow">
                    <div class="card-body p-5">
                        <div class="mb-4">
                            <h1 class="display-4 text-success">¡Login Exitoso!</h1>
                        </div>
                        <h2 class="h4 mb-3">Bienvenido, <?php echo htmlspecialchars($nombreUsuario); ?></h2>
                        <p class="text-muted">
                            Has ingresado correctamente a la plataforma de gestión de recolección de basura. 
                            Próximamente podrás ver aquí tus rutas cercanas y estado de cuenta.
                        </p>
                        
                        <hr class="my-4">
                        
                        <div class="d-grid gap-2 d-md-block">
                            <button class="btn btn-success" type="button">Ver mis rutas</button>
                            <button class="btn btn-outline-secondary" type="button">Estado de Pago</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>