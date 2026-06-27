<?php
session_start();
require_once __DIR__ . '/../src/config/config.php';
require_once __DIR__ . '/../src/functions/auth.php';

$error = '';
$success = '';
$formData = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $cedula = trim($_POST['cedula'] ?? '');
    $correo = trim($_POST['correo'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $direccion = trim($_POST['direccion'] ?? '');
    $detalleAdicional = trim($_POST['detalleAdicional'] ?? '');

    $formData = compact('nombre', 'apellido', 'cedula', 'correo', 'telefono', 'direccion', 'detalleAdicional');

    // Validaciones
    $errors = [];
    if (empty($nombre)) $errors[] = 'El nombre es obligatorio.';
    if (empty($apellido)) $errors[] = 'El apellido es obligatorio.';
    if (empty($cedula)) $errors[] = 'La cédula es obligatoria.';
    if (empty($correo)) $errors[] = 'El correo es obligatorio.';
    elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) $errors[] = 'Correo no válido.';
    if (empty($password)) $errors[] = 'La contraseña es obligatoria.';
    elseif (strlen($password) < 8) $errors[] = 'La contraseña debe tener al menos 8 caracteres.';
    elseif ($password !== $confirmPassword) $errors[] = 'Las contraseñas no coinciden.';
    if (empty($direccion)) $errors[] = 'La dirección es obligatoria.';
    // Validar cédula (8 o 9 dígitos)
    $cedulaLimpia = preg_replace('/[^0-9]/', '', $cedula);
    if (strlen($cedulaLimpia) < 8 || strlen($cedulaLimpia) > 9) $errors[] = 'La cédula debe tener 8 o 9 dígitos.';

    if (empty($errors)) {
        try {
            registerUser($nombre, $apellido, $cedulaLimpia, $correo, $telefono, $password, $direccion, $detalleAdicional);
            $_SESSION['register_success'] = 'Cuenta creada exitosamente. Ahora inicia sesión.';
            header('Location: login.php');
            exit;
        } catch (Exception $e) {
            $error = $e->getMessage();
        }
    } else {
        $error = implode(' ', $errors);
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Registro - SmartSACH</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gradient-to-br from-green-50 to-white min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 md:p-12">

        <div class="flex items-center gap-3 mb-4">
            <a href="login.php" class="inline-flex items-center gap-2 text-green-700 hover:text-green-800 transition group">
                <span class="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
                <span class="text-sm font-medium">Volver al Login</span>
            </a>
        </div>

        <h2 class="text-2xl font-bold text-green-800 text-center mb-2">Crear Cuenta</h2>
        <p class="text-gray-500 text-center text-sm mb-6">Completa tus datos para registrarte</p>

        <?php if ($error): ?>
            <div class="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                <span>⚠️</span><span><?php echo htmlspecialchars($error); ?></span>
            </div>
        <?php endif; ?>
        <?php if (isset($_SESSION['register_success'])): ?>
            <div class="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                <span>✅</span><span><?php echo htmlspecialchars($_SESSION['register_success']);
                                    unset($_SESSION['register_success']); ?></span>
            </div>
        <?php endif; ?>

        <form method="POST" action="" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-gray-700 font-medium text-sm mb-1">Nombre * (max 15)</label>
                    <input type="text" name="nombre" value="<?php echo htmlspecialchars($formData['nombre'] ?? ''); ?>"
                        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                        maxlength="15" required />
                </div>
                <div>
                    <label class="block text-gray-700 font-medium text-sm mb-1">Apellido * (max 15)</label>
                    <input type="text" name="apellido" value="<?php echo htmlspecialchars($formData['apellido'] ?? ''); ?>"
                        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                        maxlength="15" required />
                </div>
            </div>

            <div>
                <label class="block text-gray-700 font-medium text-sm mb-1">Cédula * (8-9 dígitos)</label>
                <input type="text" name="cedula" value="<?php echo htmlspecialchars($formData['cedula'] ?? ''); ?>"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                    placeholder="4-789-962" maxlength="11" required />
                <p class="text-xs text-gray-400 mt-1">Formatos: X-XXX-XXXX (8), X-XXXX-XXXX (9) o XX-XXX-XXXX (9)</p>
            </div>

            <div>
                <label class="block text-gray-700 font-medium text-sm mb-1">Correo electrónico *</label>
                <input type="email" name="correo" value="<?php echo htmlspecialchars($formData['correo'] ?? ''); ?>"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                    placeholder="tu@email.com" required />
            </div>

            <div>
                <label class="block text-gray-700 font-medium text-sm mb-1">Teléfono (8 dígitos, ej: 6589-8962)</label>
                <input type="text" name="telefono" value="<?php echo htmlspecialchars($formData['telefono'] ?? ''); ?>"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                    placeholder="6589-8962" maxlength="9" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-gray-700 font-medium text-sm mb-1">Contraseña *</label>
                    <input type="password" name="password"
                        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                        placeholder="8+ caracteres" required />
                </div>
                <div>
                    <label class="block text-gray-700 font-medium text-sm mb-1">Confirmar contraseña *</label>
                    <input type="password" name="confirmPassword"
                        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                        placeholder="Confirma tu contraseña" required />
                </div>
            </div>

            <div>
                <label class="block text-gray-700 font-medium text-sm mb-1">Dirección de recolección *</label>
                <input type="text" name="direccion" value="<?php echo htmlspecialchars($formData['direccion'] ?? ''); ?>"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                    placeholder="Ej: Calle 34, casa 17, Boquete" required />
            </div>

            <div>
                <label class="block text-gray-700 font-medium text-sm mb-1">Detalle adicional (máximo 50 caracteres)</label>
                <textarea name="detalleAdicional" rows="2"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                    maxlength="50"><?php echo htmlspecialchars($formData['detalleAdicional'] ?? ''); ?></textarea>
                <p class="text-xs text-gray-400 mt-1"><?php echo strlen($formData['detalleAdicional'] ?? ''); ?>/50</p>
            </div>

            <button type="submit"
                class="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5">
                Registrarse
            </button>
        </form>

        <p class="text-center text-gray-500 text-sm mt-4">
            ¿Ya tienes cuenta? <a href="login.php" class="text-green-700 font-semibold hover:underline">Inicia sesión aquí</a>
        </p>
    </div>
</body>

</html>