<?php
// Reporte de errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);


define('APP_NAME', 'SmartSACH David');
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'sistema_recoleccion');
define('DB_PORT', 3307);


$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>