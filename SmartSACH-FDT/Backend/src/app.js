// Backend/src/app.js
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.json({ message: 'SmartSACH API funcionando correctamente' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'El servidor está funcionando' });
});

export default app;