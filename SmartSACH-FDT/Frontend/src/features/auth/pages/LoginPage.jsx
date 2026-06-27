import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    // Usa la variable de entorno, pero si no está definida, usa la URL de Render directamente
    const phpBaseUrl = import.meta.env.VITE_PHP_BASE_URL || 'https://smartsach-php-auth.onrender.com';
    window.location.href = `${phpBaseUrl}/login.php`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <p className="text-green-700 font-medium">Redirigiendo al sistema de autenticación...</p>
    </div>
  );
}