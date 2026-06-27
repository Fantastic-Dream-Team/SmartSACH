# Backend SmartSACH-FDT

API base de SmartSACH-FDT preparada para desplegarse en Render con Node.js y Express. Tambien sirve los archivos de `../Frontend` cuando se despliega desde la raiz del proyecto.

## Desarrollo local

```bash
npm install
copy .env.example .env
npm run dev
```

La API queda disponible en `http://localhost:10000` y el frontend se puede abrir desde esa misma URL.

## Variables de entorno

Configura estas variables en Render:

- `NODE_ENV=production`
- `PORT`: Render la asigna automaticamente.
- `CORS_ORIGIN`: URL del frontend desplegado.
- `DB_HOST=aws-1-us-west-2.pooler.supabase.com`
- `DB_PORT=5432`
- `DB_NAME=postgres`
- `DB_USER=postgres.hbgfywutsshezntatljs`
- `DB_PASSWORD`: password de la base de datos en Supabase.
- `DB_SSL=true`
- `JWT_SECRET`: valor largo y privado para firmar sesiones.

## Endpoints iniciales

- `GET /`: informacion basica de la API.
- `GET /health`: estado del servidor.
- `GET /api/status`: estado de conexion con Supabase.

## Render

Puedes desplegar usando el `render.yaml` de la raiz del proyecto o creando un Web Service manual:

- Root Directory: `.`
- Build Command: `cd Backend && npm install`
- Start Command: `cd Backend && npm start`

Antes de probar registro o login, asegúrate de ejecutar en Supabase los scripts de `Database` y configurar `DB_PASSWORD` en Render.
