import { Router } from 'express';
import { handleChat } from '../controllers/chatController.js';

const router = Router();

// Monta el manejador del chat en la raíz de este router
router.post('/', handleChat);

export default router;