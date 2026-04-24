<?php
$host = "localhost";
$user = "root";
$pass = "123";
$db_name   = "sistema_recoleccion";
$port = 3306;

$conn = new mysqli($host, $user, $pass, $db_name, $port);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>