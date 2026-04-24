<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Paso 1: PHP ejecutándose<br>";

$host = "127.0.0.1";
$user = "root";
$pass = "123";
$db_name = "sistema_recoleccion";
$port = 3306;

echo "Paso 2: Datos de conexión listos<br>";

$conn = new mysqli($host, $user, $pass, $db_name, $port);

echo "Paso 3: Objeto mysqli creado<br>";

if ($conn->connect_error) {
    echo "Paso 4 Error: " . $conn->connect_error . "<br>";
} else {
    echo "Paso 4: Conexión exitosa!<br>";
    
    // Probar una consulta simple
    $result = $conn->query("SELECT 1 as test");
    if ($result) {
        echo "Paso 5: Consulta ejecutada correctamente<br>";
    } else {
        echo "Paso 5 Error en consulta: " . $conn->error . "<br>";
    }
}

echo "Paso 6: Fin del script<br>";
?>