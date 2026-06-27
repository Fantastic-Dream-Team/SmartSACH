import app from './app.js';
import { PORT } from './config/env.js';

app.listen(PORT, () => {
    console.log(`SmartSACH API escuchando en el puerto ${PORT}`);
});