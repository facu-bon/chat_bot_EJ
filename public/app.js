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
function appendMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerText = text;
    
    // Añadir al historial de chat en el formato esperado por la API de Gemini
    chatHistory.push({
        role: sender === 'user' ? 'user' : 'model', // 'user' o 'model'
        parts: [{ text: text }]
    });

    chatMessages.appendChild(messageElement);
    
    // Scroll automático al último mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;

    console.log('Historial actual:', chatHistory); // Para depuración
}

/**
 * Envía el mensaje del usuario al servidor backend y procesa la respuesta.
 * @param {string} message - El mensaje de texto.
 */
async function fetchBotResponse(message) {
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
            body: JSON.stringify({ message: message, history: chatHistory }) // Enviar el historial completo
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en el servidor: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        appendMessage(data.reply, 'bot');

    } catch (error) {
        console.error('Error al conectar con la API o procesar respuesta:', error);
        appendMessage(`Lo siento, hubo un problema técnico y no pude procesar tu consulta. Detalles: ${error.message}. Por favor, reintentá en unos momentos.`, 'bot');
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
    appendMessage(message, 'user');
    
    // 2. Limpia el campo de texto
    userInput.value = '';

    // 3. Consulta al backend de Node.js
    fetchBotResponse(message);
});

// Inicializar el historial con el mensaje de bienvenida del bot
document.addEventListener('DOMContentLoaded', () => {
    const initialBotMessage = document.querySelector('.chat-messages .message.bot').innerText;
    chatHistory.push({ role: 'model', parts: [{ text: initialBotMessage }] });
});