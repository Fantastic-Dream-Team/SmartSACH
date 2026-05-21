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
    $message = $e->getMessage();
    if (str_contains($message, 'relation') && str_contains($message, 'does not exist')) {
        $payload['message'] = 'Falta una tabla en la base de datos. Ejecuta la migración de Supabase.';
    } elseif (str_contains($message, 'column') && str_contains($message, 'does not exist')) {
        $payload['message'] = 'Falta una columna en la base de datos. Revisa la migración de Supabase.';
    } elseif (str_contains($message, 'password authentication failed')) {
        $payload['message'] = 'Las credenciales de conexión a Supabase no son correctas.';
    } elseif (str_contains($message, 'Network is unreachable')) {
        $payload['message'] = 'Render no puede conectar al host directo IPv6 de Supabase. Usa el Session Pooler IPv4 en DB_HOST y DB_USER.';
    } elseif (str_contains($message, 'Connection refused') || str_contains($message, 'could not translate host name')) {
        $payload['message'] = 'No se pudo conectar con Supabase. Revisa DB_HOST, DB_PORT, DB_USER y red.';
    }
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

function normalize_float(mixed $value): float|false
{
    if (is_string($value)) {
        $value = str_replace(',', '.', trim($value));
    }
    return filter_var($value, FILTER_VALIDATE_FLOAT);
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

    $stmt = db()->prepare('SELECT usuario_id, nombre, apellido, cedula, correo_electronico, telefono, estado_verificacion, fecha_registro FROM usuarios WHERE usuario_id = :id');
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

function validate_phone(string $phone): bool
{
    return $phone === '' || (bool) preg_match('/^\+?[0-9\-\s]{7,20}$/', $phone);
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

function fetch_default_route_id(PDO $pdo): int
{
    $stmt = $pdo->query("SELECT ruta_id FROM rutas WHERE estado_ruta = 'activa' ORDER BY ruta_id ASC LIMIT 1");
    $routeId = $stmt->fetchColumn();
    if ($routeId !== false) {
        return (int) $routeId;
    }
    $insert = $pdo->prepare("INSERT INTO rutas (nombre_ruta, zona_sector, horario_estimado, estado_ruta) VALUES ('Ruta David Centro', 'David, Chiriquí', 'Lunes a sábado', 'activa') RETURNING ruta_id");
    $insert->execute();
    return (int) $insert->fetchColumn();
}

function user_locations_with_routes(int $userId): array
{
    $stmt = db()->prepare(
        "SELECT
            u.ubicacion_id,
            u.nombre_referencia,
            u.latitud,
            u.longitud,
            u.descripcion_direccion,
            u.fecha_creacion,
            s.suscripcion_id,
            s.estado_suscripcion,
            s.estado_pago,
            s.proximo_vencimiento,
            s.monto_mensual,
            r.ruta_id,
            r.nombre_ruta,
            r.zona_sector,
            r.horario_estimado
         FROM ubicaciones_servicio u
         LEFT JOIN suscripciones s ON s.ubicacion_id = u.ubicacion_id AND s.usuario_id = u.usuario_id
         LEFT JOIN rutas r ON r.ruta_id = s.ruta_id
         WHERE u.usuario_id = :user_id
         ORDER BY u.fecha_creacion ASC"
    );
    $stmt->execute(['user_id' => $userId]);
    return $stmt->fetchAll();
}

function account_summary(int $userId): array
{
    $stmt = db()->prepare(
        "SELECT
            COUNT(*) FILTER (WHERE estado_suscripcion = 'activa') AS rutas_activas,
            COUNT(*) FILTER (WHERE proximo_vencimiento < CURRENT_DATE) AS suscripciones_morosas,
            COALESCE(SUM(CASE WHEN proximo_vencimiento < CURRENT_DATE THEN monto_mensual ELSE 0 END), 0) AS deuda_estimada,
            MIN(proximo_vencimiento) AS proximo_vencimiento
         FROM suscripciones
         WHERE usuario_id = :user_id"
    );
    $stmt->execute(['user_id' => $userId]);
    $summary = $stmt->fetch() ?: [];
    return [
        'rutas_activas' => (int) ($summary['rutas_activas'] ?? 0),
        'suscripciones_morosas' => (int) ($summary['suscripciones_morosas'] ?? 0),
        'deuda_estimada' => (float) ($summary['deuda_estimada'] ?? 0),
        'proximo_vencimiento' => $summary['proximo_vencimiento'] ?? null,
    ];
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
        json_response([
            'ok' => true,
            'message' => 'SmartSACH API is running',
            'build' => getenv('APP_BUILD') ?: 'build-2026-05-13-r1',
            'csrfToken' => csrf_token(),
        ]);
    }

    if ($method === 'GET' && $path === 'api/auth/csrf') {
        json_response(['ok' => true, 'csrfToken' => csrf_token()]);
    }

    if ($method === 'GET' && in_array($path, ['api/db-check', 'api/db_check', 'api/dbcheck', 'db-check'], true)) {
        $pdo = db();
        $result = [
            'database' => $pdo->query('SELECT current_database()')->fetchColumn(),
            'tables' => [],
        ];
        foreach (['usuarios', 'ubicaciones_servicio', 'rutas', 'suscripciones', 'pagos', 'camiones_rastreo', 'reportes_servicio'] as $table) {
            $stmt = $pdo->prepare('SELECT to_regclass(:table)');
            $stmt->execute(['table' => 'public.' . $table]);
            $result['tables'][$table] = (bool) $stmt->fetchColumn();
        }
        json_response(['ok' => true, 'data' => $result]);
    }

    if ($method === 'POST' && $path === 'api/auth/register') {
        require_csrf();
        $data = input();

        $nombre = clean_string($data['nombre'] ?? '', 50);
        $apellido = clean_string($data['apellido'] ?? '', 50);
        $cedula = strtoupper(clean_string($data['cedula'] ?? '', 20));
        $correo = strtolower(clean_string($data['correo'] ?? '', 100));
        $telefono = clean_string($data['telefono'] ?? '', 20);
        $password = (string) ($data['password'] ?? '');
        $confirmPassword = (string) ($data['confirmPassword'] ?? '');
        $direccion = clean_string($data['direccion'] ?? '', 255);
        $descripcion = clean_string($data['descripcion'] ?? '', 2000);
        $latitud = normalize_float($data['latitud'] ?? null);
        $longitud = normalize_float($data['longitud'] ?? null);

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
        if (!validate_phone($telefono)) {
            $errors['telefono'] = 'Teléfono inválido.';
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
            $stmt = $pdo->prepare('INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, telefono, password, estado_verificacion) VALUES (:nombre, :apellido, :cedula, :correo, :telefono, :password, :estado) RETURNING usuario_id');
            $stmt->execute([
                'nombre' => $nombre,
                'apellido' => $apellido,
                'cedula' => $cedula,
                'correo' => $correo,
                'telefono' => $telefono !== '' ? $telefono : null,
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'estado' => 'activo',
            ]);
            $userId = (int) $stmt->fetchColumn();

            $location = $pdo->prepare('INSERT INTO ubicaciones_servicio (usuario_id, nombre_referencia, latitud, longitud, descripcion_direccion) VALUES (:usuario_id, :referencia, :latitud, :longitud, :descripcion) RETURNING ubicacion_id');
            $location->execute([
                'usuario_id' => $userId,
                'referencia' => $direccion,
                'latitud' => $latitud,
                'longitud' => $longitud,
                'descripcion' => $descripcion,
            ]);
            $ubicacionId = (int) $location->fetchColumn();

            $routeId = fetch_default_route_id($pdo);
            $subscription = $pdo->prepare('INSERT INTO suscripciones (usuario_id, ubicacion_id, ruta_id, fecha_activacion, proximo_vencimiento, estado_pago, estado_suscripcion, monto_mensual) VALUES (:usuario_id, :ubicacion_id, :ruta_id, CURRENT_DATE, CURRENT_DATE + INTERVAL \'30 days\', :estado_pago, :estado_suscripcion, :monto_mensual)');
            $subscription->execute([
                'usuario_id' => $userId,
                'ubicacion_id' => $ubicacionId,
                'ruta_id' => $routeId,
                'estado_pago' => 'al_dia',
                'estado_suscripcion' => 'activa',
                'monto_mensual' => 10.00,
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
        json_response(['ok' => true, 'message' => 'Cuenta creada correctamente.', 'user' => ['usuario_id' => $userId, 'nombre' => $nombre, 'apellido' => $apellido, 'correo_electronico' => $correo, 'telefono' => $telefono]]);
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
        $stmt = db()->prepare('SELECT usuario_id, nombre, apellido, cedula, correo_electronico, telefono, password, estado_verificacion FROM usuarios WHERE correo_electronico = :correo LIMIT 1');
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
        json_response(['ok' => true, 'message' => 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.']);
    }

    if ($method === 'GET' && $path === 'api/dashboard/overview') {
        $user = require_auth();
        $pdo = db();
        $overview = account_summary((int) $user['usuario_id']);

        $subscriptions = $pdo->prepare(
            "SELECT
                s.suscripcion_id,
                s.proximo_vencimiento,
                s.estado_pago,
                s.estado_suscripcion,
                s.monto_mensual,
                r.ruta_id,
                r.nombre_ruta,
                r.zona_sector,
                r.horario_estimado,
                u.ubicacion_id,
                u.nombre_referencia,
                u.latitud,
                u.longitud,
                c.camion_id,
                c.placa_vehiculo,
                c.latitud AS camion_latitud,
                c.longitud AS camion_longitud,
                c.ultima_actualizacion
             FROM suscripciones s
             JOIN rutas r ON r.ruta_id = s.ruta_id
             JOIN ubicaciones_servicio u ON u.ubicacion_id = s.ubicacion_id
             LEFT JOIN camiones_rastreo c ON c.ruta_id = s.ruta_id
             WHERE s.usuario_id = :user_id AND s.estado_suscripcion = 'activa'
             ORDER BY s.proximo_vencimiento ASC"
        );
        $subscriptions->execute(['user_id' => $user['usuario_id']]);
        $rows = $subscriptions->fetchAll();

        $routePoints = [];
        if (!empty($rows[0]['ruta_id'])) {
            $pointsStmt = $pdo->prepare(
                "SELECT secuencia, latitud, longitud
                 FROM rutas_puntos
                 WHERE ruta_id = :ruta_id
                 ORDER BY secuencia ASC"
            );
            $pointsStmt->execute(['ruta_id' => $rows[0]['ruta_id']]);
            $routePoints = $pointsStmt->fetchAll();
        }

        json_response([
            'ok' => true,
            'user' => $user,
            'summary' => $overview,
            'routes' => $rows,
            'route_points' => $routePoints,
        ]);
    }

    if ($method === 'GET' && $path === 'api/profile') {
        $user = require_auth();
        $locations = user_locations_with_routes((int) $user['usuario_id']);
        json_response([
            'ok' => true,
            'user' => $user,
            'locations' => $locations,
            'summary' => account_summary((int) $user['usuario_id']),
        ]);
    }

    if ($method === 'POST' && $path === 'api/profile/update') {
        require_csrf();
        $user = require_auth();
        $data = input();

        $nombre = clean_string($data['nombre'] ?? '', 50);
        $apellido = clean_string($data['apellido'] ?? '', 50);
        $telefono = clean_string($data['telefono'] ?? '', 20);
        $errors = [];
        if ($nombre === '') {
            $errors['nombre'] = 'El nombre es obligatorio.';
        }
        if ($apellido === '') {
            $errors['apellido'] = 'El apellido es obligatorio.';
        }
        if (!validate_phone($telefono)) {
            $errors['telefono'] = 'Teléfono inválido.';
        }
        if ($errors) {
            json_response(['ok' => false, 'message' => 'Revisa los campos.', 'errors' => $errors], 422);
        }

        $stmt = db()->prepare('UPDATE usuarios SET nombre = :nombre, apellido = :apellido, telefono = :telefono WHERE usuario_id = :id');
        $stmt->execute([
            'nombre' => $nombre,
            'apellido' => $apellido,
            'telefono' => $telefono !== '' ? $telefono : null,
            'id' => $user['usuario_id'],
        ]);
        json_response(['ok' => true, 'message' => 'Perfil actualizado correctamente.']);
    }

    if ($method === 'POST' && $path === 'api/locations/create') {
        require_csrf();
        $user = require_auth();
        $data = input();

        $referencia = clean_string($data['nombre_referencia'] ?? '', 255);
        $descripcion = clean_string($data['descripcion_direccion'] ?? '', 2000);
        $latitud = normalize_float($data['latitud'] ?? null);
        $longitud = normalize_float($data['longitud'] ?? null);
        $errors = [];
        if ($referencia === '') {
            $errors['nombre_referencia'] = 'La referencia es obligatoria.';
        }
        if ($descripcion === '') {
            $errors['descripcion_direccion'] = 'La descripción es obligatoria.';
        }
        if ($latitud === false || $longitud === false) {
            $errors['ubicacion'] = 'Coordenadas inválidas.';
        }
        if ($errors) {
            json_response(['ok' => false, 'message' => 'Revisa los campos.', 'errors' => $errors], 422);
        }

        $pdo = db();
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('INSERT INTO ubicaciones_servicio (usuario_id, nombre_referencia, latitud, longitud, descripcion_direccion) VALUES (:user_id, :referencia, :latitud, :longitud, :descripcion) RETURNING ubicacion_id');
            $stmt->execute([
                'user_id' => $user['usuario_id'],
                'referencia' => $referencia,
                'latitud' => $latitud,
                'longitud' => $longitud,
                'descripcion' => $descripcion,
            ]);
            $locationId = (int) $stmt->fetchColumn();

            $routeId = fetch_default_route_id($pdo);
            $subscription = $pdo->prepare('INSERT INTO suscripciones (usuario_id, ubicacion_id, ruta_id, fecha_activacion, proximo_vencimiento, estado_pago, estado_suscripcion, monto_mensual) VALUES (:usuario_id, :ubicacion_id, :ruta_id, CURRENT_DATE, CURRENT_DATE + INTERVAL \'30 days\', :estado_pago, :estado_suscripcion, :monto_mensual)');
            $subscription->execute([
                'usuario_id' => $user['usuario_id'],
                'ubicacion_id' => $locationId,
                'ruta_id' => $routeId,
                'estado_pago' => 'al_dia',
                'estado_suscripcion' => 'activa',
                'monto_mensual' => 10.00,
            ]);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }

        json_response(['ok' => true, 'message' => 'Nueva ruta y ubicación registradas.']);
    }

    if ($method === 'POST' && preg_match('#^api/locations/(\d+)/update$#', $path, $matches)) {
        require_csrf();
        $user = require_auth();
        $locationId = (int) $matches[1];
        $data = input();
        $referencia = clean_string($data['nombre_referencia'] ?? '', 255);
        $descripcion = clean_string($data['descripcion_direccion'] ?? '', 2000);

        $exists = db()->prepare('SELECT ubicacion_id FROM ubicaciones_servicio WHERE ubicacion_id = :id AND usuario_id = :user_id');
        $exists->execute(['id' => $locationId, 'user_id' => $user['usuario_id']]);
        if (!$exists->fetch()) {
            json_response(['ok' => false, 'message' => 'No tienes permisos para esta ubicación.'], 403);
        }

        $stmt = db()->prepare('UPDATE ubicaciones_servicio SET nombre_referencia = :referencia, descripcion_direccion = :descripcion WHERE ubicacion_id = :id');
        $stmt->execute([
            'referencia' => $referencia !== '' ? $referencia : 'Ubicación',
            'descripcion' => $descripcion,
            'id' => $locationId,
        ]);
        json_response(['ok' => true, 'message' => 'Ubicación actualizada.']);
    }

    if ($method === 'GET' && $path === 'api/payments/summary') {
        $user = require_auth();
        $stmt = db()->prepare(
            "SELECT
                s.suscripcion_id,
                s.proximo_vencimiento,
                s.estado_pago,
                s.monto_mensual,
                r.nombre_ruta,
                u.nombre_referencia,
                u.descripcion_direccion
             FROM suscripciones s
             JOIN rutas r ON r.ruta_id = s.ruta_id
             JOIN ubicaciones_servicio u ON u.ubicacion_id = s.ubicacion_id
             WHERE s.usuario_id = :user_id
             ORDER BY s.proximo_vencimiento ASC"
        );
        $stmt->execute(['user_id' => $user['usuario_id']]);
        $subscriptions = $stmt->fetchAll();

        $history = db()->prepare(
            "SELECT
                p.pago_id,
                p.suscripcion_id,
                p.monto,
                p.fecha_pago,
                p.metodo_pago,
                p.periodo_referencia,
                p.estado_pago,
                r.nombre_ruta
             FROM pagos p
             JOIN suscripciones s ON s.suscripcion_id = p.suscripcion_id
             JOIN rutas r ON r.ruta_id = s.ruta_id
             WHERE p.usuario_id = :user_id
             ORDER BY p.fecha_pago DESC
             LIMIT 30"
        );
        $history->execute(['user_id' => $user['usuario_id']]);

        $summary = account_summary((int) $user['usuario_id']);
        $estadoCuenta = $summary['suscripciones_morosas'] > 0 ? 'con_saldo_pendiente' : 'al_dia';
        json_response([
            'ok' => true,
            'estado_cuenta' => $estadoCuenta,
            'summary' => $summary,
            'subscriptions' => $subscriptions,
            'payments' => $history->fetchAll(),
        ]);
    }

    if ($method === 'POST' && $path === 'api/payments/pay') {
        require_csrf();
        $user = require_auth();
        $data = input();
        $suscripcionId = (int) ($data['suscripcion_id'] ?? 0);
        $metodoPago = clean_string($data['metodo_pago'] ?? 'Pago web', 50);
        if ($suscripcionId <= 0) {
            json_response(['ok' => false, 'message' => 'Suscripción inválida.'], 422);
        }

        $pdo = db();
        $stmt = $pdo->prepare('SELECT suscripcion_id, monto_mensual, proximo_vencimiento FROM suscripciones WHERE suscripcion_id = :id AND usuario_id = :user_id');
        $stmt->execute(['id' => $suscripcionId, 'user_id' => $user['usuario_id']]);
        $sub = $stmt->fetch();
        if (!$sub) {
            json_response(['ok' => false, 'message' => 'Suscripción no encontrada.'], 404);
        }

        $monto = (float) $sub['monto_mensual'];
        $periodo = date('Y-m', strtotime((string) $sub['proximo_vencimiento']));

        $pdo->beginTransaction();
        try {
            $pay = $pdo->prepare('INSERT INTO pagos (usuario_id, suscripcion_id, monto, metodo_pago, periodo_referencia, estado_pago) VALUES (:usuario_id, :suscripcion_id, :monto, :metodo, :periodo, :estado)');
            $pay->execute([
                'usuario_id' => $user['usuario_id'],
                'suscripcion_id' => $suscripcionId,
                'monto' => $monto,
                'metodo' => $metodoPago,
                'periodo' => $periodo,
                'estado' => 'pagado',
            ]);

            $update = $pdo->prepare("UPDATE suscripciones SET proximo_vencimiento = GREATEST(proximo_vencimiento, CURRENT_DATE) + INTERVAL '30 days', estado_pago = 'al_dia' WHERE suscripcion_id = :id");
            $update->execute(['id' => $suscripcionId]);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }

        json_response(['ok' => true, 'message' => 'Pago registrado correctamente.']);
    }

    if ($method === 'POST' && $path === 'api/reports/create') {
        require_csrf();
        $user = require_auth();
        $data = input();

        $ubicacionId = (int) ($data['ubicacion_id'] ?? 0);
        $tipo = clean_string($data['tipo_incidencia'] ?? 'otro', 50);
        $descripcion = clean_string($data['descripcion'] ?? '', 2000);
        $allowed = ['no_paso_camion', 'mala_atencion', 'desperdicio_en_via', 'recomendacion', 'otro'];
        if (!in_array($tipo, $allowed, true)) {
            $tipo = 'otro';
        }
        if ($descripcion === '') {
            json_response(['ok' => false, 'message' => 'Describe tu reporte para poder enviarlo.'], 422);
        }

        $exists = db()->prepare('SELECT ubicacion_id FROM ubicaciones_servicio WHERE ubicacion_id = :id AND usuario_id = :user_id');
        $exists->execute(['id' => $ubicacionId, 'user_id' => $user['usuario_id']]);
        if (!$exists->fetch()) {
            json_response(['ok' => false, 'message' => 'Selecciona una ubicación válida.'], 422);
        }

        $stmt = db()->prepare('INSERT INTO reportes_servicio (usuario_id, ubicacion_id, tipo_incidencia, descripcion, estado_reporte) VALUES (:user_id, :ubicacion_id, :tipo, :descripcion, :estado)');
        $stmt->execute([
            'user_id' => $user['usuario_id'],
            'ubicacion_id' => $ubicacionId,
            'tipo' => $tipo,
            'descripcion' => $descripcion,
            'estado' => 'abierto',
        ]);
        json_response(['ok' => true, 'message' => 'Gracias. Tu reporte fue enviado al equipo SmartSACH.']);
    }

    if ($method === 'GET' && $path === 'api/paz-y-salvo') {
        $user = require_auth();
        $stmt = db()->prepare('SELECT * FROM vista_estado_cuenta_usuario WHERE usuario_id = :user_id');
        $stmt->execute(['user_id' => $user['usuario_id']]);
        json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    json_response(['ok' => false, 'message' => 'Endpoint no encontrado.'], 404);
} catch (PDOException $e) {
    database_error($e);
} catch (Throwable $e) {
    error_log('[SmartSACH Error] ' . $e->getMessage());
    if (debug_enabled()) {
        json_response(['ok' => false, 'message' => 'Error inesperado del servidor.', 'debug' => $e->getMessage()], 500);
    }
    json_response(['ok' => false, 'message' => 'Error inesperado del servidor.'], 500);
}
