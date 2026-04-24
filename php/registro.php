<?php
require_once 'config.php';
require_once 'clases.php';

$mensaje = "";
$userObj = new Usuario($conn);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        if ($userObj->registrar($_POST)) {
            $mensaje = "<div class='alert alert-success'>¡Registro exitoso!</div>";
        }
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() == 1062) {
            $mensaje = "<div class='alert alert-warning'>Los datos ya están registrados.</div>";
        } else {
            $mensaje = "<div class='alert alert-danger'>Error: " . $e->getMessage() . "</div>";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Registro - <?php echo APP_NAME; ?></title>
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="card mx-auto shadow-sm" style="max-width: 500px;">
            <div class="card-body">
                <h3 class="text-center mb-4">Creación de cuenta</h3>
                <?php echo $mensaje; ?>
                <form method="POST">
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <input type="text" name="nombre" class="form-control" placeholder="Nombre" required>
                        </div>
                        <div class="col-md-6 mb-2">
                            <input type="text" name="apellido" class="form-control" placeholder="Apellido" required>
                        </div>
                    </div>
                    <input type="text" name="cedula" class="form-control mb-2" placeholder="Cédula" required>
                    <input type="email" name="correo" class="form-control mb-2" placeholder="Correo electrónico" required>
                    <input type="password" name="password" class="form-control mb-2" placeholder="Contraseña" required>
                    <textarea name="descripcion" class="form-control mb-3" placeholder="Ubicación en David"></textarea>
                    <button type="submit" class="btn btn-success w-100">Registrar</button>
                </form>
                <p class="mt-3 text-center"><a href="login.php">¿Ya tienes cuenta? Ingresar</a></p>
            </div>
        </div>
    </div>
</body>
</html>