<?php
echo "<h2>Probando conexión a MySQL</h2>";

$host = "localhost";
$user = "root";
$pass = "";
$db_name = "sistema_recoleccion";
$port = 3306;

echo "Intentando conectar a: $host, puerto $port, base: $db_name<br>";

$conn = new mysqli($host, $user, $pass, $db_name, $port);

if ($conn->connect_error) {
    echo "❌ Error de conexión: " . $conn->connect_error;
} else {
    echo "✅ Conexión exitosa a la base de datos!";
    $conn->close();
}
?>