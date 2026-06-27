import { useEffect } from 'react';

export default function RegisterPage() {
  useEffect(() => {
    const phpBaseUrl = import.meta.env.VITE_PHP_BASE_URL || 'http://localhost:8080';
    window.location.href = `${phpBaseUrl}/register.php`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <p className="text-green-700 font-medium">Redirigiendo al sistema de autenticación...</p>
    </div>
  );
}