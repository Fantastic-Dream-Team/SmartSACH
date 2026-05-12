# SmartSACH

Frontend responsive y API PHP para autenticación, registro con mapa, sesiones seguras y consulta de paz y salvo.

## Requisitos

- PHP 8+
- PostgreSQL
- Extensión PHP `pdo_pgsql`
- Composer ya está instalado en `backend/vendor`

## Base de datos

Ejecuta los scripts en PostgreSQL:

```sql
\i basededatos/postgretables.sql
\i basededatos/postgretrigers.sql
```

Si la base ya existia en Supabase, ejecuta tambien la migracion incremental:

```sql
\i basededatos/supabase_migration_auth.sql
```

En Supabase SQL Editor puedes pegar el contenido completo de `basededatos/supabase_migration_auth.sql`. Ejecutalo de nuevo despues de estos cambios: ahora tambien amplia columnas existentes, por ejemplo `ubicaciones_servicio.nombre_referencia`, para aceptar direcciones largas del mapa.

Copia `backend/.env.example` a `backend/.env` y ajusta tus credenciales:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_recoleccion
DB_USER=postgres
DB_PASS=tu_clave
APP_ORIGIN=http://localhost:8000
```

## Ejecutar

Desde la raíz del proyecto:

```bash
php -S localhost:8000 -t .
```

Abre:

```text
http://localhost:8000/frontend/
```

## Logos

Guarda los logos del proyecto en `assets/img/` con estos nombres:

```text
assets/img/sachlogo.png
assets/img/logoblanco.png
```

El frontend los usa automaticamente. Si no existen, muestra un fallback basico para que la pagina no se rompa.

La API queda disponible en:

```text
http://localhost:8000/backend/index.php/api/health
```

Diagnostico de base de datos:

```text
http://localhost:8000/backend/index.php/api/db-check
```

## Deploy en Render con Supabase

Sube el repositorio completo a GitHub. En Render crea un **Web Service** conectado al repo y usa Docker. Render debe detectar el `Dockerfile` de la raíz; si te pide ruta, usa:

```text
./Dockerfile
```

Variables de entorno en Render:

```text
APP_ORIGIN=https://TU-SERVICIO.onrender.com
DB_HOST=HOST_DEL_SESSION_POOLER_DE_SUPABASE
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.PROJECT_REF
DB_PASS=tu_password_de_supabase
DB_SSLMODE=require
```

Importante para Render: no uses el host directo `db.PROJECT_REF.supabase.co`, porque Supabase lo resuelve por IPv6 y Render no soporta esa salida. En Supabase entra a **Connect -> Session pooler** y copia esos datos:

```text
Host: algo como aws-0-us-east-1.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.PROJECT_REF
Password: tu password
```

No subas `backend/.env` a GitHub. Las credenciales deben quedar solo en Environment Variables de Render.

Al desplegar, abre:

```text
https://TU-SERVICIO.onrender.com/
```

La página raíz redirige al frontend y la API queda en:

```text
https://TU-SERVICIO.onrender.com/backend/index.php/api/health
```

Diagnostico de base de datos en Render:

```text
https://TU-SERVICIO.onrender.com/backend/index.php/api/db-check
```

Si el registro falla, revisa:

1. Que `DB_HOST` use el Session Pooler de Supabase.
2. Que `DB_USER` sea `postgres.PROJECT_REF`.
3. Que `DB_SSLMODE=require`.
4. Que `supabase_migration_auth.sql` se haya ejecutado sin errores.
5. Que el correo y cedula usados no existan ya en `usuarios`.

Tambien funciona como:

```text
https://TU-SERVICIO.onrender.com/backend/api/db-check
```

## Funcionalidades

- Login con correo y contraseña.
- Registro con validación completa y contraseña hasheada.
- Sesión segura con cookie `HttpOnly` y token CSRF.
- Protección básica contra fuerza bruta por sesión/IP.
- Consultas preparadas contra SQL Injection.
- Sanitización y escape contra XSS en frontend y backend.
- Recuperación de contraseña preparada para conectar un proveedor de correo.
- Mapa Leaflet/OpenStreetMap con búsqueda, marcador arrastrable y geolocalización.
- Dashboard privado con datos del usuario y consulta de paz y salvo.
