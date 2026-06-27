import { useEffect } from 'react';

function RegisterForm() {
  useEffect(() => {
    const urlBasePHP = import.meta.env.VITE_PHP_BASE_URL;
    window.location.href = `${urlBasePHP}/register.php`;
  }, []);
  return null;
}

export default RegisterForm;