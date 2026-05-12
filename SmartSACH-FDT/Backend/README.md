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
- `SUPABASE_URL`: URL del proyecto en Supabase, en `Project Settings > API > Project URL`.
- `SUPABASE_ANON_KEY`: clave `anon public` en `Project Settings > API > Project API keys`.
- `JWT_SECRET`: valor largo y privado para firmar sesiones.

Si ya tienes variables creadas como `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, el backend tambien las reconoce.

## Endpoints iniciales

- `GET /`: informacion basica de la API.
- `GET /health`: estado del servidor.
- `GET /api/status`: estado de conexion con Supabase.

## Render

Puedes desplegar usando el `render.yaml` de la raiz del proyecto o creando un Web Service manual:

- Root Directory: `.`
- Build Command: `cd Backend && npm install`
- Start Command: `cd Backend && npm start`
