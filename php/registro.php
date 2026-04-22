<?php
include 'config.php';

$mensaje = ""; // Variable para mostrar alertas en el HTML

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $apellido = $_POST['apellido'];
    $cedula = $_POST['cedula'];
    $correo = $_POST['correo'];
    $pass = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $descripcion = $_POST['descripcion'];

    try {
        // Iniciamos una transacción por seguridad (ya que insertamos en dos tablas)
        $conn->begin_transaction();

        $sql_user = "INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, password) 
                     VALUES ('$nombre', '$apellido', '$cedula', '$correo', '$pass')";
        
        $conn->query($sql_user);
        $last_id = $conn->insert_id;

        // Insertar Ubicación
        $sql_ubi = "INSERT INTO ubicaciones_servicio (usuario_id, descripcion_direccion, coordenadas_gps) 
                     VALUES ('$last_id', '$descripcion', ST_GeomFromText('POINT(8.43 -82.43)'))";
        $conn->query($sql_ubi);

        $conn->commit();
        $mensaje = "<div class='alert alert-success'>¡Registro exitoso! Tu cuenta está en revisión.</div>";

    } catch (mysqli_sql_exception $e) {
        $conn->rollback(); // Si algo falla, deshacemos los cambios

        // Verificamos si el error es por duplicado (Código 1062 en MySQL)
        if ($e->getCode() == 1062) {
            if (strpos($e->getMessage(), 'cedula') !== false) {
                $mensaje = "<div class='alert alert-warning'>La cédula <strong>$cedula</strong> ya está registrada.</div>";
            } elseif (strpos($e->getMessage(), 'correo_electronico') !== false) {
                $mensaje = "<div class='alert alert-warning'>El correo <strong>$correo</strong> ya está en uso.</div>";
            }
        } else {
            $mensaje = "<div class='alert alert-danger'>Error crítico: " . $e->getMessage() . "</div>";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Registro SmartSACH</title>
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
                    <input type="text" name="cedula" class="form-control mb-2" placeholder="Cédula (Ej: 4-123-456)" required>
                    <input type="email" name="correo" class="form-control mb-2" placeholder="Correo electrónico" required>
                    <input type="password" name="password" class="form-control mb-2" placeholder="Contraseña" required>
                    <textarea name="descripcion" class="form-control mb-3" placeholder="Descripción de ubicación exacta en David"></textarea>
                    
                    <button type="submit" class="btn btn-success w-100">Registrar</button>
                </form>
                <p class="mt-3 text-center">¿Ya tienes cuenta? <a href="login.php" class="text-success">Ingresar</a></p>
            </div>
        </div>
    </div>
</body>
</html>