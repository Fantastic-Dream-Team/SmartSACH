<?php
// Configuración general del microservicio
// TODAS las credenciales se leen del entorno (getenv) – déjalas vacías para que el usuario las rellene

define('REACT_URL', getenv('REACT_URL') ?: 'http://localhost:5173');
define('PHP_URL', getenv('PHP_URL') ?: 'http://localhost:8080');

// Credenciales de Supabase (Auth + DB)
define('SUPABASE_URL', getenv('SUPABASE_URL') ?: '');
define('SUPABASE_ANON_KEY', getenv('SUPABASE_ANON_KEY') ?: '');
define('SUPABASE_SERVICE_ROLE_KEY', getenv('SUPABASE_SERVICE_ROLE_KEY') ?: '');

// Base de datos PostgreSQL (directa)
define('DB_HOST', getenv('DB_HOST') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '5432');
define('DB_DATABASE', getenv('DB_DATABASE') ?: 'postgres');
define('DB_USER', getenv('DB_USER') ?: '');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: '');

// JWT (para firmar tokens si decides usarlos, aunque usaremos el access_token de Supabase)
define('JWT_SECRET', getenv('JWT_SECRET') ?: '');
