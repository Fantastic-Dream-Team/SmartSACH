<?php
session_start();
require_once 'config.php';
require_once 'clases.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit(); }

$userObj = new Usuario($conn);
$misRutas = $userObj->obtenerMisRutas($_SESSION['usuario_id']);
$estado = $userObj->obtenerEstadoFinanciero($_SESSION['usuario_id']);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Panel SmartSACH</title>
</head>
<body class="bg-light">
    <nav class="navbar navbar-dark bg-success mb-4 shadow">
        <div class="container">
            <span class="navbar-brand">SmartSACH David</span>
            <span class="navbar-text text-white">Hola, <?php echo $_SESSION['nombre']; ?></span>
            <a href="logout.php" class="btn btn-outline-light btn-sm">Salir</a>
        </div>
    </nav>

    <div class="container">
        <div class="row">
            <div class="col-md-8">
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-white"><h5>Mis Rutas Asignadas</h5></div>
                    <div class="card-body">
                        <table class="table table-hover">
                            <thead>
                                <tr><th>Ruta</th><th>Sector</th><th>Horario</th></tr>
                            </thead>
                            <tbody>
                                <?php while($r = $misRutas->fetch_assoc()): ?>
                                <tr>
                                    <td><?php echo $r['nombre_ruta']; ?></td>
                                    <td><?php echo $r['zona_sector']; ?></td>
                                    <td><span class="badge bg-primary"><?php echo $r['horario_estimado']; ?></span></td>
                                </tr>
                                <?php endwhile; if($misRutas->num_rows == 0) echo "<tr><td colspan='3' class='text-center'>No tienes rutas asignadas aún.</td></tr>"; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card shadow-sm border-0">
                    <div class="card-body text-center">
                        <h6>Estado de Paz y Salvo</h6>
                        <?php if($estado && $estado['estado_pago'] == 'al_dia'): ?>
                            <div class="alert alert-success">
                                <h3>AL DÍA</h3>
                                <small>Vence: <?php echo $estado['proximo_vencimiento']; ?></small>
                            </div>
                        <?php else: ?>
                            <div class="alert alert-danger">
                                <h3>MOROSO</h3>
                                <p>Por favor regularice su pago.</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>