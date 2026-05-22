# Deploy En Render (SmartSACH)

Este proyecto ya quedo preparado para Render con Docker y React + PHP.

## 1) Archivos clave

- `Dockerfile`: build multi-stage (React) + runtime PHP/Apache.
- `docker/apache/000-default.conf`: rutas React + exclusion de `/backend/*`.
- `render.yaml`: blueprint con healthcheck y variables base.

## 2) Variables obligatorias en Render

Configura estas variables en el servicio web:

- `APP_ORIGIN=https://TU-SERVICIO.onrender.com`
- `DB_HOST=<host pooler IPv4 de Supabase>`
- `DB_PORT=5432`
- `DB_NAME=postgres`
- `DB_USER=<usuario pooler de Supabase>`
- `DB_PASS=<password>`
- `DB_SSLMODE=require`

Opcionales:

- `APP_DEBUG=false`
- `APP_BUILD=build-react-render`

## 3) Deploy

1. Haz push a la rama conectada en Render.
2. En Render:
   - `Manual Deploy` -> `Clear build cache & deploy`.
3. Espera que termine el build Docker.

## 4) Verificacion post deploy

- Frontend React:
  - `https://TU-SERVICIO.onrender.com/`
- Backend health:
  - `https://TU-SERVICIO.onrender.com/backend/index.php/api/health`
- DB check:
  - `https://TU-SERVICIO.onrender.com/backend/index.php/api/db-check`

## 5) Si sigue saliendo version vieja

- Verifica que el deploy tomo el commit nuevo.
- Repite `Clear build cache & deploy`.
- Revisa logs de build y runtime en Render.
