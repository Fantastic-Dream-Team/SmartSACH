// Backend/src/server.js
import app from './app.js';
import { PORT } from './config/env.js';  // ✅ Ruta correcta

app.listen(PORT, () => {
    console.log(`SmartSACH API escuchando en el puerto ${PORT}`);
});