<?php
session_start();

//Conexión a la base de datos - J
require_once 'config.php';

// 1. Verificación de Seguridad: Si no hay sesión, redirigir al login
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit();
}

// Datos del usuario desde la sesión
$nombreUsuario = $_SESSION['nombre'];

// Obtener el ID del usuario para futuras consultas - J 
$usuario_id = $_SESSION['usuario_id'];

//Rutas - J 
$rutas = [];

$sqlRutas = "SELECT nombre_ruta, zona_sector, horario_estimado FROM rutas";
$resultRutas = $conn->query($sqlRutas);

if ($resultRutas && $resultRutas->num_rows > 0) {
    while ($row = $resultRutas->fetch_assoc()) {
        $rutas[] = $row;
    }
}

//Estado de pago - J
$estadoPago = "Desconocido";

// CORRECCIÓN: Aquí faltaba cerrar el string y el punto y coma
$sqlEstado = "SELECT estado_pago
               FROM suscripciones
               WHERE usuario_id = '$usuario_id'
               LIMIT 1";

$resultEstado = $conn->query($sqlEstado); // CORRECCIÓN: $conn no $coon

if ($resultEstado && $resultEstado->num_rows > 0) {
    $rowEstado = $resultEstado->fetch_assoc();
    $estadoPago = $rowEstado['estado_pago'];
}

// CORRECCIÓN: Aquí estaba el error principal - No debes cerrar PHP todavía
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

                        <!-- MAPA - CORRECCIÓN: Los comentarios HTML son -->
                        <img src="assets/mapa.png" class="img-fluid mb-4"> <!-- CORRECCIÓN: img.fluid a img-fluid -->

                        <!-- BIENVENIDA - CORRECCIÓN: "Bineveido" a "Bienvenido" -->
                        <h2>Bienvenido...</h2>

                        <div class="mb-4">
                            <h1 class="display-4 text-success">¡Login Exitoso!</h1>
                        </div>
                        <h2 class="h4 mb-3">Bienvenido, <?php echo htmlspecialchars($nombreUsuario); ?></h2>

                        <hr>
                        <!-- CORRECCIÓN: calss a class, successful a success -->
                        <h4 class="text-success">Estado de cuenta:</h4>

                        <p>
                        <?php if ($estadoPago == 'al día'): ?> <!-- CORRECCIÓN: $estado a $estadoPago -->
                            <span class="badge bg-success">Paz_Salvo</span>
                        <?php else: ?>
                            <span class="badge bg-danger">Pago Pendiente</span>
                        <?php endif; ?>
                        </p>

                        <hr>

                        <h4 class="text-success">Rutas Disponibles:</h4> <!-- CORRECCIÓN: successful a success -->

                        <ul class="list-group"> <!-- CORRECCIÓN: list-group-item a list-group -->
                        <?php foreach ($rutas as $ruta): ?>
                            <li class="list-group-item">
                                <strong><?php echo htmlspecialchars($ruta['nombre_ruta']); ?></strong><br>
                                Zona: <?php echo htmlspecialchars($ruta['zona_sector']); ?><br>
                                Horario: <?php echo htmlspecialchars($ruta['horario_estimado']); ?>
                            </li>
                        <?php endforeach; ?>
                        </ul>

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