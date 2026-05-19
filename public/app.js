// Selección de elementos del DOM
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');

// URL del backend local (reemplazar por producción en el futuro)
const API_URL = '/api/chat';

/**
 * Inserta un nuevo mensaje en la interfaz y desplaza el scroll.
 * @param {string} text - Contenido del mensaje.
 * @param {'user' | 'bot'} sender - Quién envía el mensaje.
 */
function appendMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerText = text;
    
    chatMessages.appendChild(messageElement);
    
    // Scroll automático al último mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Envía el mensaje del usuario al servidor backend y procesa la respuesta.
 * @param {string} message - El mensaje de texto.
 */
async function fetchBotResponse(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const data = await response.json();
        appendMessage(data.reply, 'bot');

    } catch (error) {
        console.error('Error al conectar con la API:', error);
        appendMessage('Lo siento, hubo un problema técnico y no pude procesar tu consulta. Por favor, reintentá en unos momentos.', 'bot');
    }
}

// Escucha del evento del formulario
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Renderiza el mensaje del usuario inmediatamente
    appendMessage(message, 'user');
    
    // 2. Limpia el campo de texto
    userInput.value = '';

    // 3. Consulta al backend de Node.js
    fetchBotResponse(message);
});