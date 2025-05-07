import express from 'express';
import { DiscussionReplyController } from '../controllers/discussionReply.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { checkReplyParticipant } from '../middlewares/checkReplyParticipant.middleware';
import upload from '../uploads/multer.config';

const router = express.Router();

router.post(
    '/:postId',
    authenticationToken,
    checkReplyParticipant,
    upload.array('images', 10),
    DiscussionReplyController.createReply,
);

router.get(
    '/:postId',
    authenticationToken,
    checkReplyParticipant,
    DiscussionReplyController.getReplies,
);

router.get(
    '/:replyId/detail',
    authenticationToken,
    checkReplyParticipant,
    DiscussionReplyController.getReplyById,
);

router.put(
    '/:replyId',
    authenticationToken,
    upload.array('images', 10),
    checkReplyParticipant,
    DiscussionReplyController.updateReply,
);

router.delete(
    '/:replyId',
    authenticationToken,
    checkReplyParticipant,
    DiscussionReplyController.deleteReply,
);

export default router;
