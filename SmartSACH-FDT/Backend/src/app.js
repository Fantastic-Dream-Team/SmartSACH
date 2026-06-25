import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (desde la carpeta Frontend/dist)
const frontendPath = path.join(__dirname, '../Frontend/dist');
app.use(express.static(frontendPath));

// Rutas de la API
app.use('/api/auth', authRouter);

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'El servidor está funcionando' });
});

// Para cualquier otra ruta, servir el index.html del frontend (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

export default app;