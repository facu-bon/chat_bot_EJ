import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir frontend desde carpeta public

// Inicializar el cliente de Gemini usando tu variable de entorno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Prompt del sistema centralizado para el estudio jurídico
const SYSTEM_INSTRUCTION = `Sos el asistente virtual de recepción del Estudio Jurídico "Asociados & Co.". 
Tu objetivo es ser sumamente profesional, cordial y eficiente.

Tus tareas principales son:
1. Saludar al cliente y preguntar el motivo de su consulta.
2. Brindar información básica (Horarios: Lunes a Viernes de 9 a 18 hs. Ubicación: Av. Corrientes, CABA).
3. Si el cliente quiere agendar un turno o dejar un caso, debés solicitar de manera amable: Nombre completo, Teléfono de contacto y un breve resumen del tema (Civil, Laboral, Comercial, Penal).
4. IMPORTANTE: No estás autorizado a dar asesoramiento legal ni emitir opiniones jurídicas. Si el cliente te hace una pregunta legal compleja, respondé de forma muy educada: "Para brindarle el asesoramiento correcto, es necesario que coordine una entrevista con uno de nuestros profesionales. ¿Le gustaría que tomemos sus datos para agendar una cita?"`;

// Instanciar la sesión de chat con el modelo recomendado (gemini-2.5-flash)
// Usamos .chats.create para que el SDK maneje automáticamente la memoria del hilo conversacional
const chatSession = ai.chats.create({
    model: 'gemini-2.5-flash', // El modelo ideal para chat: ultra rápido y económico
    config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4 // Mantiene el tono formal y enfocado
    }
});

/**
 * Endpoint del Chat adaptado para Gemini
 */
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "El formato del mensaje no es válido." });
    }

    try {
        // Enviamos el mensaje a la sesión activa. El SDK se encarga de guardar el historial.
        const response = await chatSession.sendMessage({
            message: message
        });

        // La respuesta de Gemini viene de forma directa en la propiedad .text
        const botReply = response.text;

        return res.json({ reply: botReply });

    } catch (error) {
        console.error("Error crítico en la comunicación con Gemini API:", error);
        return res.status(500).json({ 
            error: "Hubo un error interno al procesar la respuesta.",
            details: error.message 
        });
    }
});

// Endpoint de control
app.get('/status', (req, res) => {
    res.send({ status: "Servidor activo con Gemini" });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Servidor corriendo con Gemini en: http://localhost:${PORT}`);
});