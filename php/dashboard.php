<?php
session_start();
include 'config.php';

// Si no hay sesión, redirigir al login
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit();
}

$usuario_id = $_SESSION['usuario_id'];

// Consultar la ruta del usuario
$sql = "SELECT r.nombre_ruta, r.zona_sector, r.horario_estimado, 
               s.proximo_vencimiento, s.estado_pago
        FROM suscripciones s
        JOIN rutas r ON s.ruta_id = r.ruta_id
        WHERE s.usuario_id = $usuario_id";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
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
        <div class="col-md-8">
            <div class="card shadow">
                <div class="card-body p-4">
                    <h2 class="text-success">Bienvenido, <?php echo htmlspecialchars($_SESSION['nombre']); ?></h2>
                    <hr>

                    <?php if ($result && $result->num_rows > 0): 
                        $ruta = $result->fetch_assoc(); ?>
                        <div class="alert alert-info">
                            <h4>📋 Tu información de recolección:</h4>
                            <p><strong>📍 Ruta:</strong> <?php echo $ruta['nombre_ruta']; ?></p>
                            <p><strong>🗺️ Zona:</strong> <?php echo $ruta['zona_sector']; ?></p>
                            <p><strong>⏰ Horario:</strong> <?php echo $ruta['horario_estimado']; ?></p>
                            <p><strong>📅 Próximo vencimiento:</strong> <?php echo $ruta['proximo_vencimiento']; ?></p>
                            <p><strong>💰 Estado:</strong> 
                                <span class="badge bg-success"><?php echo $ruta['estado_pago']; ?></span>
                            </p>
                        </div>
                    <?php else: ?>
                        <div class="alert alert-warning">
                            ⚠️ No se encontró tu ruta asignada. Contacta al administrador.
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>