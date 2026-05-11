<?php
// Habilitar CORS (esto es crucial para que tu frontend en Vercel pueda comunicarse con este backend)
header("Access-Control-Allow-Origin: *"); // En producción, reemplaza '*' con la URL de tu app en Vercel, e.g., 'https://tu-app.vercel.app'
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejar preflight requests (peticiones OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Configuración de la base de datos usando variables de entorno
$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$db   = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');

// DSN (Data Source Name) para PostgreSQL
$dsn = "pgsql:host=$host;port=$port;dbname=$db;";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Conectar a la base de datos
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // En caso de error de conexión
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos: " . $e->getMessage()]);
    exit;
}

// Lógica para obtener el estado de paz y salvo
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Consulta a la vista vista_paz_y_salvo_usuarios
        $stmt = $pdo->query('SELECT * FROM vista_paz_y_salvo_usuarios');
        $resultados = $stmt->fetchAll();

        // Devolver los resultados en formato JSON
        header('Content-Type: application/json');
        echo json_encode($resultados);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al ejecutar la consulta: " . $e->getMessage()]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Método no permitido"]);
}
?>