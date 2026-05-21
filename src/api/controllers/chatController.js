import { ai, SYSTEM_INSTRUCTION } from '../../config/geminiConfig.js';

export const handleChat = async (req, res) => {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "El formato del mensaje no es válido." });
    }

    try {
        const model = ai.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: { temperature: 0.4 }
        });

        const result = await chat.sendMessageStream(message);

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of result.stream) {
            res.write(chunk.text());
        }
        res.end();
    } catch (error) {
        console.error("Error crítico en la comunicación con Gemini API:", error);
        res.status(500).send("Hubo un error interno al procesar la respuesta.");
    }
};