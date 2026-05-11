<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

if (class_exists(Dotenv\Dotenv::class) && file_exists(__DIR__ . '/.env')) {
    Dotenv\Dotenv::createImmutable(__DIR__)->safeLoad();
}

$sessionPath = __DIR__ . '/storage/sessions';
if (!is_dir($sessionPath)) {
    mkdir($sessionPath, 0775, true);
}
session_save_path($sessionPath);
session_name('SMARTSACHSESSID');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => is_secure_request(),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$allowedOrigin = getenv('APP_ORIGIN') ?: ($_ENV['APP_ORIGIN'] ?? '*');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function debug_enabled(): bool
{
    $value = strtolower((string) (getenv('APP_DEBUG') ?: ($_ENV['APP_DEBUG'] ?? 'false')));
    return in_array($value, ['1', 'true', 'yes', 'on'], true);
}

function database_error(PDOException $e): void
{
    error_log('[SmartSACH DB] ' . $e->getMessage());
    $payload = ['ok' => false, 'message' => 'No se pudo completar la operación en la base de datos.'];
    if (debug_enabled()) {
        $payload['debug'] = $e->getMessage();
    }
    json_response($payload, 500);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? 'localhost');
    $port = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? '5432');
    $name = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'sistema_recoleccion');
    $user = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'postgres');
    $pass = getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? '');
    $sslMode = getenv('DB_SSLMODE') ?: ($_ENV['DB_SSLMODE'] ?? 'prefer');
    $dsn = "pgsql:host={$host};port={$port};dbname={$name};sslmode={$sslMode}";

    return $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function input(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_response(['ok' => false, 'message' => 'Solicitud JSON inválida.'], 400);
    }
    return $data;
}

function clean_string(mixed $value, int $max = 255): string
{
    $value = trim((string) $value);
    $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function is_secure_request(): bool
{
    $https = $_SERVER['HTTPS'] ?? '';
    $forwardedProto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '';
    return $https === 'on' || $https === '1' || strtolower($forwardedProto) === 'https';
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    setcookie('SMARTSACH_CSRF', $_SESSION['csrf_token'], [
        'expires' => 0,
        'path' => '/',
        'secure' => is_secure_request(),
        'httponly' => false,
        'samesite' => 'Lax',
    ]);
    return $_SESSION['csrf_token'];
}

function require_csrf(): void
{
    $header = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $sessionToken = (string) ($_SESSION['csrf_token'] ?? '');
    $cookieToken = (string) ($_COOKIE['SMARTSACH_CSRF'] ?? '');
    $validSessionToken = $sessionToken !== '' && hash_equals($sessionToken, $header);
    $validCookieToken = $cookieToken !== '' && hash_equals($cookieToken, $header);

    if (!$header || (!$validSessionToken && !$validCookieToken)) {
        json_response(['ok' => false, 'message' => 'Token de seguridad inválido. Recarga la página.'], 419);
    }
}

function require_auth(): array
{
    if (empty($_SESSION['user_id'])) {
        json_response(['ok' => false, 'message' => 'Debes iniciar sesión.'], 401);
    }

    $stmt = db()->prepare('SELECT usuario_id, nombre, apellido, cedula, correo_electronico, estado_verificacion, fecha_registro FROM usuarios WHERE usuario_id = :id');
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        session_destroy();
        json_response(['ok' => false, 'message' => 'La sesión ya no es válida.'], 401);
    }

    return $user;
}

function validate_password_strength(string $password): ?string
{
    if (strlen($password) < 8) {
        return 'La contraseña debe tener mínimo 8 caracteres.';
    }
    if (!preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/\d/', $password)) {
        return 'La contraseña debe incluir mayúsculas, minúsculas y números.';
    }
    return null;
}

function validate_cedula(string $cedula): bool
{
    return (bool) preg_match('/^[A-Z0-9]{1,3}-?\d{1,4}-?\d{1,6}$/i', $cedula);
}

function throttle_login(string $email): void
{
    $key = 'login_' . hash('sha256', strtolower($email) . ($_SERVER['REMOTE_ADDR'] ?? 'local'));
    $attempt = $_SESSION[$key] ?? ['count' => 0, 'until' => 0];

    if (($attempt['until'] ?? 0) > time()) {
        json_response(['ok' => false, 'message' => 'Demasiados intentos. Intenta nuevamente en unos minutos.'], 429);
    }
}

function register_failed_login(string $email): void
{
    $key = 'login_' . hash('sha256', strtolower($email) . ($_SERVER['REMOTE_ADDR'] ?? 'local'));
    $attempt = $_SESSION[$key] ?? ['count' => 0, 'until' => 0];
    $attempt['count']++;
    if ($attempt['count'] >= 5) {
        $attempt = ['count' => 0, 'until' => time() + 300];
    }
    $_SESSION[$key] = $attempt;
}

function clear_failed_login(string $email): void
{
    $key = 'login_' . hash('sha256', strtolower($email) . ($_SERVER['REMOTE_ADDR'] ?? 'local'));
    unset($_SESSION[$key]);
}

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/', '/');
$scriptBase = trim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');
if ($scriptBase && str_starts_with($path, $scriptBase)) {
    $path = trim(substr($path, strlen($scriptBase)), '/');
}
if ($path === 'index.php') {
    $path = '';
} elseif (str_starts_with($path, 'index.php/')) {
    $path = substr($path, strlen('index.php/'));
}
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET' && in_array($path, ['', 'api/health'], true)) {
        json_response(['ok' => true, 'message' => 'SmartSACH API is running', 'csrfToken' => csrf_token()]);
    }

    if ($method === 'GET' && in_array($path, ['api/db-check', 'api/db_check', 'api/dbcheck', 'db-check'], true)) {
        $pdo = db();
        $tables = ['usuarios', 'ubicaciones_servicio', 'rutas', 'suscripciones', 'vista_paz_y_salvo_usuarios'];
        $result = [
            'database' => $pdo->query('SELECT current_database()')->fetchColumn(),
            'tables' => [],
            'columns' => [],
            'counts' => [],
        ];

        foreach ($tables as $table) {
            $stmt = $pdo->prepare('SELECT to_regclass(:table)');
            $stmt->execute(['table' => 'public.' . $table]);
            $result['tables'][$table] = (bool) $stmt->fetchColumn();
        }

        foreach (['usuarios', 'ubicaciones_servicio'] as $table) {
            $stmt = $pdo->prepare(
                'SELECT column_name, data_type
                 FROM information_schema.columns
                 WHERE table_schema = :schema AND table_name = :table
                 ORDER BY ordinal_position'
            );
            $stmt->execute(['schema' => 'public', 'table' => $table]);
            $result['columns'][$table] = $stmt->fetchAll();
        }

        foreach (['usuarios', 'ubicaciones_servicio'] as $table) {
            if (!empty($result['tables'][$table])) {
                $result['counts'][$table] = (int) $pdo->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
            }
        }

        json_response(['ok' => true, 'data' => $result]);
    }

    if ($method === 'GET' && $path === 'api/auth/csrf') {
        json_response(['ok' => true, 'csrfToken' => csrf_token()]);
    }

    if ($method === 'POST' && $path === 'api/auth/register') {
        require_csrf();
        $data = input();

        $nombre = clean_string($data['nombre'] ?? '', 50);
        $apellido = clean_string($data['apellido'] ?? '', 50);
        $cedula = strtoupper(clean_string($data['cedula'] ?? '', 20));
        $correo = strtolower(clean_string($data['correo'] ?? '', 100));
        $password = (string) ($data['password'] ?? '');
        $confirmPassword = (string) ($data['confirmPassword'] ?? '');
        $direccion = clean_string($data['direccion'] ?? '', 255);
        $descripcion = clean_string($data['descripcion'] ?? '', 2000);
        $latitud = filter_var($data['latitud'] ?? null, FILTER_VALIDATE_FLOAT);
        $longitud = filter_var($data['longitud'] ?? null, FILTER_VALIDATE_FLOAT);

        $errors = [];
        foreach (['nombre' => $nombre, 'apellido' => $apellido, 'cedula' => $cedula, 'correo' => $correo, 'direccion' => $direccion, 'descripcion' => $descripcion] as $field => $value) {
            if ($value === '') {
                $errors[$field] = 'Este campo es obligatorio.';
            }
        }
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $errors['correo'] = 'Correo electrónico inválido.';
        }
        if (!validate_cedula($cedula)) {
            $errors['cedula'] = 'Cédula inválida. Usa un formato como 4-826-1202.';
        }
        if ($password !== $confirmPassword) {
            $errors['confirmPassword'] = 'Las contraseñas no coinciden.';
        }
        if ($passwordError = validate_password_strength($password)) {
            $errors['password'] = $passwordError;
        }
        if ($latitud === false || $longitud === false || $latitud < -90 || $latitud > 90 || $longitud < -180 || $longitud > 180) {
            $errors['ubicacion'] = 'Selecciona una ubicación válida en el mapa.';
        }

        if ($errors) {
            json_response(['ok' => false, 'message' => 'Revisa los campos marcados.', 'errors' => $errors], 422);
        }

        $pdo = db();
        $exists = $pdo->prepare('SELECT correo_electronico, cedula FROM usuarios WHERE correo_electronico = :correo OR cedula = :cedula LIMIT 1');
        $exists->execute(['correo' => $correo, 'cedula' => $cedula]);
        $duplicate = $exists->fetch();
        if ($duplicate) {
            $errors = [];
            if (($duplicate['correo_electronico'] ?? '') === $correo) {
                $errors['correo'] = 'Este correo ya está registrado.';
            }
            if (($duplicate['cedula'] ?? '') === $cedula) {
                $errors['cedula'] = 'Esta cédula ya está registrada.';
            }
            json_response(['ok' => false, 'message' => 'Ya existe una cuenta con estos datos.', 'errors' => $errors], 409);
        }

        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, password) VALUES (:nombre, :apellido, :cedula, :correo, :password) RETURNING usuario_id');
            $stmt->execute([
                'nombre' => $nombre,
                'apellido' => $apellido,
                'cedula' => $cedula,
                'correo' => $correo,
                'password' => password_hash($password, PASSWORD_DEFAULT),
            ]);
            $userId = (int) $stmt->fetchColumn();

            $location = $pdo->prepare('INSERT INTO ubicaciones_servicio (usuario_id, nombre_referencia, latitud, longitud, descripcion_direccion) VALUES (:usuario_id, :referencia, :latitud, :longitud, :descripcion)');
            $location->execute([
                'usuario_id' => $userId,
                'referencia' => $direccion,
                'latitud' => $latitud,
                'longitud' => $longitud,
                'descripcion' => $descripcion,
            ]);
            $pdo->commit();
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        json_response(['ok' => true, 'message' => 'Cuenta creada correctamente.', 'user' => ['usuario_id' => $userId, 'nombre' => $nombre, 'apellido' => $apellido, 'correo_electronico' => $correo]]);
    }

    if ($method === 'POST' && $path === 'api/auth/login') {
        require_csrf();
        $data = input();
        $correo = strtolower(clean_string($data['correo'] ?? '', 100));
        $password = (string) ($data['password'] ?? '');

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || $password === '') {
            json_response(['ok' => false, 'message' => 'Correo o contraseña inválidos.'], 422);
        }

        throttle_login($correo);
        $stmt = db()->prepare('SELECT usuario_id, nombre, apellido, cedula, correo_electronico, password, estado_verificacion FROM usuarios WHERE correo_electronico = :correo LIMIT 1');
        $stmt->execute(['correo' => $correo]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, (string) $user['password'])) {
            register_failed_login($correo);
            json_response(['ok' => false, 'message' => 'Correo o contraseña incorrectos.'], 401);
        }

        clear_failed_login($correo);
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['usuario_id'];
        unset($user['password']);
        json_response(['ok' => true, 'message' => 'Bienvenido a SmartSACH.', 'user' => $user]);
    }

    if ($method === 'GET' && $path === 'api/auth/me') {
        json_response(['ok' => true, 'user' => require_auth()]);
    }

    if ($method === 'POST' && $path === 'api/auth/logout') {
        require_csrf();
        session_destroy();
        json_response(['ok' => true, 'message' => 'Sesión cerrada.']);
    }

    if ($method === 'POST' && $path === 'api/auth/forgot-password') {
        require_csrf();
        $data = input();
        $correo = strtolower(clean_string($data['correo'] ?? '', 100));
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            json_response(['ok' => false, 'message' => 'Ingresa un correo válido.'], 422);
        }

        // Aquí se integraría un proveedor de correo. La respuesta es neutra para no revelar cuentas existentes.
        json_response(['ok' => true, 'message' => 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.']);
    }

    if ($method === 'GET' && $path === 'api/paz-y-salvo') {
        require_auth();
        $stmt = db()->query('SELECT * FROM vista_paz_y_salvo_usuarios');
        json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    json_response(['ok' => false, 'message' => 'Endpoint no encontrado.'], 404);
} catch (PDOException $e) {
    database_error($e);
} catch (Throwable $e) {
    error_log('[SmartSACH Error] ' . $e->getMessage());
    json_response(['ok' => false, 'message' => 'Error inesperado del servidor.'], 500);
}
