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

export const verifyWhatsAppWebhook = (req, res) => {
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
};

export const receiveWhatsAppMessage = (req, res) => {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message) {
        const from = message.from;
        const text = message.text?.body;
        console.log(`Nuevo mensaje de WhatsApp de ${from}: ${text}`);
    }

    res.sendStatus(200);
};
