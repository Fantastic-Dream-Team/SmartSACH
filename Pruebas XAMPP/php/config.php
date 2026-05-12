<?php
// Reporte de errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

define('APP_NAME', 'SmartSACH David');

// Credenciales de Supabase (Transaction Pooler)
define('DB_HOST', 'aws-1-us-west-2.pooler.supabase.com');
define('DB_PORT', '5432'); // Si falla, intenta con 6543
define('DB_NAME', 'postgres');
define('DB_USER', 'postgres.hbgfywutsshezntatljs');
define('DB_PASS', 'q3TYyXJHYbnTcU2P');

try {
    // DSN para PostgreSQL
    $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
    
    $conn = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        // Forzar IPv4 si es necesario para evitar el error de resolución de nombre
        PDO::ATTR_PERSISTENT => false 
    ]);



} catch (PDOException $e) {
    // Si el error persiste, este mensaje nos dirá exactamente por qué
    die("Error de conexión a la base de datos: " . $e->getMessage());
}
?>