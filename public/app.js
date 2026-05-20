// Selección de elementos del DOM
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');

// Elementos para el estado de carga
const sendButton = chatForm.querySelector('button[type="submit"]');
const loadingIndicator = document.getElementById('loadingIndicator');

let chatHistory = []; // Almacenará el historial de la conversación
// URL del backend local (reemplazar por producción en el futuro)
const API_URL = '/api/chat';

/**
 * Inserta un nuevo mensaje en la interfaz y desplaza el scroll.
 * @param {string} text - Contenido del mensaje.
 * @param {'user' | 'bot'} sender - Quién envía el mensaje.
 */
function createMessageElement(sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    chatMessages.appendChild(messageElement);
    return messageElement;
}

function scrollChat() {
    // Scroll automático al último mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Envía el mensaje del usuario al servidor backend y procesa la respuesta.
 * @param {string} message - El mensaje de texto.
 * @param {Array} history - El historial de la conversación.
 */
async function fetchBotResponse(message, history) {
    // Deshabilitar input y mostrar carga
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

        // --- Lógica de Streaming ---
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botReply = '';
        const botMessageElement = createMessageElement('bot');

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            botReply += chunk;
            // Usar 'marked' para renderizar el markdown a HTML
            botMessageElement.innerHTML = marked.parse(botReply);
            scrollChat();
        }

        // Añadir la respuesta completa del bot al historial
        chatHistory.push({
            role: 'model',
            parts: [{ text: botReply }]
        });
        console.log('Historial actualizado:', chatHistory);

    } catch (error) {
        console.error('Error al conectar con la API o procesar respuesta:', error);
        const errorElement = createMessageElement('bot');
        errorElement.innerText = `Lo siento, hubo un problema técnico y no pude procesar tu consulta. Detalles: ${error.message}. Por favor, reintentá en unos momentos.`;
        chatHistory.pop(); // Eliminar el mensaje de usuario fallido del historial
    } finally {
        // Habilitar input y ocultar carga
        userInput.disabled = false;
        sendButton.disabled = false;
        loadingIndicator.style.display = 'none';
        userInput.focus(); // Volver a enfocar el input
    }
}

// Escucha del evento del formulario
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Renderiza el mensaje del usuario inmediatamente
    const userMessageElement = createMessageElement('user');
    userMessageElement.innerText = message;
    scrollChat();
    
    // 2. Limpia el campo de texto
    userInput.value = '';

    const historyToSend = [...chatHistory];
    chatHistory.push({ role: 'user', parts: [{ text: message }] });

    // 3. Consulta al backend de Node.js
    fetchBotResponse(message, historyToSend);
});