import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando' });
});

export default app;