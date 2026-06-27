import { useEffect } from 'react';

function LoginForm() {
  useEffect(() => {
    const urlBasePHP = import.meta.env.VITE_PHP_BASE_URL;
    window.location.href = `${urlBasePHP}/login.php`;
  }, []);
  return null;
}

export default LoginForm;