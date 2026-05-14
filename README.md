# SmartSACH

Aplicación web para gestión de recolección de basura en Chiriquí:
- Registro y login de usuarios.
- Dashboard con rutas activas, mapa y estado financiero.
- Perfil con múltiples ubicaciones/rutas por usuario.
- Pagos con trazabilidad e historial.
- Reporte de incidencias del servicio.
- Sección Nosotros + contacto por WhatsApp.

## Estructura

- `frontend/`: SPA (HTML/CSS/JS).
- `backend/`: API PHP (sesiones + CSRF + PostgreSQL/Supabase).
- `basededatos/`: scripts SQL para Supabase.
- `assets/`: logos e imágenes del sitio.

## Base de datos (Supabase)

Ejecuta en SQL Editor:

```sql
-- contenido de:
basededatos/supabase_migration_auth.sql
```

Ese script es idempotente y crea el esquema extendido completo.

## Variables de entorno backend

Crea `backend/.env`:

```env
APP_ORIGIN=http://localhost:8000
APP_DEBUG=true

DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=tu_password
DB_SSLMODE=prefer
```

Para Render + Supabase, usa Session Pooler IPv4 y `DB_SSLMODE=require`.

## Ejecutar local

Desde la raíz del proyecto:

```bash
php -S localhost:8000 -t .
```

Abrir:

```text
http://localhost:8000/frontend/
```

API health:

```text
http://localhost:8000/backend/index.php/api/health
```
