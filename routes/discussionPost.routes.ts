import express from 'express';
import { DiscussionPostController } from '../controllers/discussionPost.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { checkEventParticipant } from '../middlewares/checkEventParticipant.middleware';
import upload from '../uploads/multer.config';

const router = express.Router();

router.post(
    '/:eventId',
    authenticationToken,
    checkEventParticipant,
    upload.array('images', 10),
    DiscussionPostController.createPost,
);

router.get(
    '/:eventId',
    authenticationToken,
    checkEventParticipant,
    DiscussionPostController.getPosts,
);

router.get(
    '/:eventId/posts/:postId',
    authenticationToken,
    checkEventParticipant,
    DiscussionPostController.getPostById,
);

router.put(
    '/:postId',
    authenticationToken,
    upload.array('images', 10),
    DiscussionPostController.updatePost,
);

router.delete(
    '/:eventId/posts/:postId',
    authenticationToken,
    checkEventParticipant,
    DiscussionPostController.deletePost,
);

export default router;
