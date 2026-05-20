import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRoutes from './api/routes/chatRoutes.js';

dotenv.config();

// --- Configuración Inicial ---
const app = express();
const PORT = process.env.PORT || 3000;

// Workaround para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares ---
app.use(cors());
app.use(express.json());
// Servir archivos estáticos desde el directorio 'public' en la raíz del proyecto
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Rutas ---
app.use('/api/chat', chatRoutes);

// Endpoint de control
app.get('/status', (req, res) => {
    res.send({ status: "Servidor activo con Gemini" });
});

// --- Inicio del Servidor ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`[SERVER] Servidor local en: http://localhost:${PORT}`);
    });
}

export default app;