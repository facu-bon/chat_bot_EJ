const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');

const sendButton = chatForm.querySelector('button[type="submit"]');
const loadingIndicator = document.getElementById('loadingIndicator');

let chatHistory = [];
const API_URL = '/api/chat';

function createMessageElement(sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    chatMessages.appendChild(messageElement);
    return messageElement;
}

function scrollChat() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function fetchBotResponse(message, history) {
    userInput.disabled = true;
    sendButton.disabled = true;
    loadingIndicator.style.display = 'block';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ message, history })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en el servidor: ${response.status} - ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botReply = '';
        const botMessageElement = createMessageElement('bot');

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            botReply += chunk;
            botMessageElement.innerHTML = marked.parse(botReply);
            scrollChat();
        }

        chatHistory.push({
            role: 'model',
            parts: [{ text: botReply }]
        });
        console.log('Historial actualizado:', chatHistory);

    } catch (error) {
        console.error('Error al conectar con la API o procesar respuesta:', error);
        const errorElement = createMessageElement('bot');
        errorElement.innerText = `Lo siento, hubo un problema técnico y no pude procesar tu consulta. Detalles: ${error.message}. Por favor, reintentá en unos momentos.`;
        chatHistory.pop();
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        loadingIndicator.style.display = 'none';
        userInput.focus();
    }
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;

    const userMessageElement = createMessageElement('user');
    userMessageElement.innerText = message;
    scrollChat();
    
    userInput.value = '';

    const historyToSend = [...chatHistory];
    chatHistory.push({ role: 'user', parts: [{ text: message }] });

    fetchBotResponse(message, historyToSend);
});