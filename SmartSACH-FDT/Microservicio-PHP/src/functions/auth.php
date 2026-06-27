<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Registra un usuario usando la API de Supabase Auth y luego obtiene sus datos con PDO
 */
function registerUser($nombre, $apellido, $cedula, $correo, $telefono, $password, $direccion, $detalleAdicional = '')
{
    // 1. Llamada a la API de Supabase para crear el usuario en Auth
    $url = SUPABASE_URL . '/auth/v1/signup';
    $payload = json_encode([
        'email' => $correo,
        'password' => $password,
        'data' => [
            'nombre' => $nombre,
            'apellido' => $apellido,
            'cedula' => $cedula,
            'telefono' => $telefono,
            'direccion' => $direccion,
            'detalle_adicional' => $detalleAdicional,
        ]
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . SUPABASE_ANON_KEY,
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($response, true);

    if ($httpCode !== 200) {
        $errorMsg = $data['error']['message'] ?? 'Error desconocido al registrar';
        throw new Exception($errorMsg);
    }

    // 2. Esperar un momento para que el trigger de Supabase (si existe) cree el registro en la tabla pública
    usleep(500000); // 0.5 segundos

    // 3. Obtener el usuario recién creado desde la tabla pública usando Prepared Statement
    $db = Database::getInstance()->getPdo();
    $stmt = $db->prepare('SELECT usuario_id, nombre, apellido, cedula, correo_electronico, estado_verificacion 
                           FROM public.usuarios 
                           WHERE correo_electronico = :correo');
    $stmt->execute([':correo' => $correo]);
    $user = $stmt->fetch();

    if (!$user) {
        // Si el trigger no se ejecutó, insertamos manualmente (por si acaso)
        $stmtInsert = $db->prepare('INSERT INTO public.usuarios 
            (auth_id, nombre, apellido, cedula, telefono, direccion, correo_electronico, estado_verificacion)
            VALUES 
            ((SELECT id FROM auth.users WHERE email = :correo), :nombre, :apellido, :cedula, :telefono, :direccion, :correo, \'pendiente\')');
        $stmtInsert->execute([
            ':correo' => $correo,
            ':nombre' => $nombre,
            ':apellido' => $apellido,
            ':cedula' => $cedula,
            ':telefono' => $telefono,
            ':direccion' => $direccion,
        ]);
        // Volver a consultar
        $stmt->execute([':correo' => $correo]);
        $user = $stmt->fetch();
    }

    return $user;
}

/**
 * Inicia sesión usando la API de Supabase Auth y obtiene los datos con PDO
 */
function loginUser($correo, $password)
{
    // 1. Autenticar con Supabase Auth
    $url = SUPABASE_URL . '/auth/v1/token?grant_type=password';
    $payload = json_encode([
        'email' => $correo,
        'password' => $password,
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . SUPABASE_ANON_KEY,
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($response, true);

    if ($httpCode !== 200) {
        $errorMsg = $data['error']['message'] ?? 'Credenciales incorrectas';
        throw new Exception($errorMsg);
    }

    $accessToken = $data['access_token'];

    // 2. Obtener perfil del usuario desde la tabla pública con Prepared Statement
    $db = Database::getInstance()->getPdo();
    $stmt = $db->prepare('SELECT usuario_id, nombre, apellido, cedula, correo_electronico, estado_verificacion 
                           FROM public.usuarios 
                           WHERE correo_electronico = :correo');
    $stmt->execute([':correo' => $correo]);
    $user = $stmt->fetch();

    if (!$user) {
        // Si no existe en la tabla pública, puede que el trigger no haya funcionado; lo creamos manualmente
        $stmtInsert = $db->prepare('INSERT INTO public.usuarios 
            (auth_id, nombre, apellido, cedula, correo_electronico, estado_verificacion)
            SELECT id, :nombre, :apellido, :cedula, :correo, \'activo\' 
            FROM auth.users 
            WHERE email = :correo');
        $stmtInsert->execute([
            ':nombre' => $userData['nombre'] ?? 'Usuario',
            ':apellido' => $userData['apellido'] ?? '',
            ':cedula' => $userData['cedula'] ?? '0-000-0000',
            ':correo' => $correo,
        ]);
        $stmt->execute([':correo' => $correo]);
        $user = $stmt->fetch();
    }

    return [
        'access_token' => $accessToken,
        'user' => $user,
    ];
}
