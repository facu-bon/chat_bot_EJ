import { Router } from 'express';
import { handleChat, verifyWhatsAppWebhook, receiveWhatsAppMessage } from '../controllers/chatController.js';

const router = Router();

// Monta el manejador del chat en la raíz de este router
router.post('/', handleChat);

// Endpoints para WhatsApp API
router.get('/webhook', verifyWhatsAppWebhook);
router.post('/webhook', receiveWhatsAppMessage);

export default router;