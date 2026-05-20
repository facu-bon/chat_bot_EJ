import { ai, SYSTEM_INSTRUCTION } from '../../config/geminiConfig.js';

/**
 * Gestiona la lógica del chat, ahora con streaming de respuestas.
 */
export const handleChat = async (req, res) => {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "El formato del mensaje no es válido." });
    }

    try {
        // Configuración del modelo con la instrucción del sistema
        const model = ai.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION
        });

        // Iniciar una sesión de chat con el historial
        const chat = model.startChat({
            history: history || [],
            generationConfig: { temperature: 0.4 }
        });

        // Enviar el mensaje y obtener un stream de la respuesta
        const result = await chat.sendMessageStream(message);

        // Establecer cabeceras para streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Enviar cada trozo de texto al cliente a medida que llega
        for await (const chunk of result.stream) {
            res.write(chunk.text());
        }
        res.end(); // Finalizar la respuesta de streaming
    } catch (error) {
        console.error("Error crítico en la comunicación con Gemini API:", error);
        res.status(500).send("Hubo un error interno al procesar la respuesta.");
    }
};