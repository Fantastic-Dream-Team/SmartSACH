<?php
session_start();
// Limpiar todas las variables de sesión
$_SESSION = array();
// Destruir la sesión en el servidor
session_destroy();
// Redirigir al login
header("Location: login.php");
exit();
?>