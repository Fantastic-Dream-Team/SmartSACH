<?php
session_start();
require_once __DIR__ . '/../src/config/config.php';
require_once __DIR__ . '/../src/functions/auth.php';

$error = '';
$success = '';

// Procesar el formulario cuando se envía por POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = trim($_POST['correo'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validaciones del lado del servidor (rúbrica)
    if (empty($correo) || empty($password)) {
        $error = 'Todos los campos son obligatorios.';
    } elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $error = 'El correo electrónico no es válido.';
    } else {
        try {
            $result = loginUser($correo, $password);
            $accessToken = $result['access_token'];
            $redirectUrl = REACT_URL . '/dashboard?token=' . urlencode($accessToken);
            header('Location: ' . $redirectUrl);
            exit;
        } catch (Exception $e) {
            $error = $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Iniciar Sesión - SmartSACH</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gradient-to-br from-green-50 to-white min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        <!-- Panel Izquierdo (Bienvenida) -->
        <div class="w-full md:w-1/2 bg-gradient-to-br from-green-800 to-green-600 text-white p-8 md:p-12 flex flex-col justify-center">
            <div class="flex items-center gap-3 mb-6">
                <img src="/assets/images/logoblanco.png" alt="SmartSACH" class="h-12" />
                <h2 class="text-2xl font-bold">SmartSACH</h2>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold mb-4">¡Bienvenido de vuelta!</h1>
            <p class="text-white/80 mb-6 leading-relaxed">
                Inicia sesión para acceder a tu panel de control, gestionar tus rutas y realizar pagos.
            </p>
            <div class="space-y-3">
                <div class="flex items-center gap-3"><span class="text-xl">🗺️</span><span>Rastreo en tiempo real</span></div>
                <div class="flex items-center gap-3"><span class="text-xl">📱</span><span>Pagos fáciles y rápidos</span></div>
                <div class="flex items-center gap-3"><span class="text-xl">📋</span><span>Reporte de incidencias</span></div>
            </div>
        </div>

        <!-- Panel Derecho (Formulario) -->
        <div class="w-full md:w-1/2 p-8 md:p-12">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-green-800">Iniciar Sesión</h2>
                <p class="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
            </div>

            <?php if ($error): ?>
                <div class="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm mb-4">
                    <span>⚠️</span>
                    <span><?php echo htmlspecialchars($error); ?></span>
                </div>
            <?php endif; ?>
            <?php if ($success): ?>
                <div class="bg-green-50 text-green-600 p-3 rounded-xl flex items-center gap-2 text-sm mb-4">
                    <span>✅</span>
                    <span><?php echo htmlspecialchars($success); ?></span>
                </div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">Correo electrónico</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                        <input type="email" name="correo" value="<?php echo htmlspecialchars($_POST['correo'] ?? ''); ?>"
                            class="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all"
                            placeholder="tu@email.com" required />
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">Contraseña</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                        <input type="password" name="password"
                            class="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all"
                            placeholder="••••••••" required />
                    </div>
                </div>

                <button type="submit"
                    class="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5">
                    Ingresar
                </button>

                <p class="text-center text-gray-500 text-sm mt-5">
                    ¿No tienes una cuenta?
                    <a href="register.php" class="text-green-700 font-semibold hover:underline">Regístrate aquí</a>
                </p>
            </form>
        </div>
    </div>
</body>

</html>