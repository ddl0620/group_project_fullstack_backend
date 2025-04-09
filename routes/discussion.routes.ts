import express from 'express';
import { sendMessage, getMessagesByEvent, markMessageAsSeen } from '../controllers/discussion.controller';
import { authenticationToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/send', authenticationToken, sendMessage);
router.get('/:eventId', authenticationToken, getMessagesByEvent);

// Mark a message as seen
router.post('/mark-as-seen', markMessageAsSeen);

export default router;
