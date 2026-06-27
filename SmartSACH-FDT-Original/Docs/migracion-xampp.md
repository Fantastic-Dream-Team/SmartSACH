# Migracion desde Pruebas XAMPP

La carpeta `Pruebas XAMPP` se conserva intacta como referencia. La division funcional queda en `SmartSACH-FDT`:

## Frontend

- `Frontend/login.html`: reemplaza la vista de `php/login.php`.
- `Frontend/registro.html`: reemplaza la vista de `php/registro.php`.
- `Frontend/dashboard.html`: reemplaza la vista de `php/dashboard.php`.
- `Frontend/assets/js`: contiene las llamadas al backend y manejo de sesion en navegador.
- `Frontend/assets/css`: contiene estilos propios de las vistas.

## Backend

- `Backend/src/routes/auth.routes.js`: reemplaza la logica PHP de login y registro.
- `Backend/src/routes/dashboard.routes.js`: reemplaza la logica PHP del panel.
- `Backend/src/config/supabase.js`: reemplaza la conexion de `php/config.php`.
- `Backend/src/middleware/auth.js`: protege rutas mediante JWT.

## Database

Los scripts SQL originales de `Pruebas XAMPP/BD-Scripts` deben mantenerse como referencia y consolidarse con los scripts ya presentes en `SmartSACH-FDT/Database`.

Para Supabase, la carpeta `SmartSACH-FDT/Database` contiene el esquema usado por el backend:

- `BD-Supabase.sql`: tablas principales y extension PostGIS.
- `Funciones_Triggers-SB.sql`: triggers y procedimientos.
- `Views.sql`: vistas de consulta.

El backend actual usa conexion PostgreSQL directa mediante `pg`, con variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DB_SSL`.
