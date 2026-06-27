import { useEffect } from 'react';

function RegisterForm() {
  useEffect(() => {
    const phpBaseUrl = import.meta.env.VITE_PHP_BASE_URL || 'https://smartsach-php-auth.onrender.com';
    window.location.href = `${phpBaseUrl}/register.php`;
  }, []);
  return null;
}

export default RegisterForm;