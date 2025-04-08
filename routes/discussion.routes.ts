import express from 'express';
import { sendMessage, getMessagesByEvent } from '../controllers/discussion.controller';
import { authenticationToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/send', authenticationToken, sendMessage);
router.get('/:eventId', authenticationToken, getMessagesByEvent);

export default router;
