<?php
include 'config.php';

$sql = "SELECT r.nombre_ruta, r.zona_sector, r.horario_estimado, r.estado_ruta
        FROM suscripciones s
        JOIN rutas r ON s.ruta_id = r.ruta_id
        WHERE s.usuario_id = 4";
$result = $conn->query($sql);
$ruta = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mis Rutas - SmartSACH</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="card shadow">
            <div class="card-header bg-success text-white">
                <h3>🗺️ Mi Ruta de Recolección</h3>
            </div>
            <div class="card-body">
                <?php if ($ruta): ?>
                    <table class="table table-bordered">
                        <tr><th>Ruta</th><td><?php echo $ruta['nombre_ruta']; ?></td></tr>
                        <tr><th>Zona</th><td><?php echo $ruta['zona_sector']; ?></td></tr>
                        <tr><th>Horario</th><td><?php echo $ruta['horario_estimado']; ?></td></tr>
                        <tr><th>Estado</th><td><?php echo $ruta['estado_ruta']; ?></td></tr>
                    </table>
                <?php else: ?>
                    <div class="alert alert-warning">No tienes rutas asignadas.</div>
                <?php endif; ?>
                <a href="dashboard.php" class="btn btn-secondary">Volver</a>
            </div>
        </div>
    </div>
</body>
</html>