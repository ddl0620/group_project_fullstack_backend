import express from 'express';
import { DiscussionPostController } from '../controllers/discussionPost.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { allowedUserMiddleware } from '../middlewares/checkEventParticipant.middleware';
import upload from '../uploads/multer.config';

const router = express.Router();

router.post(
    '/:eventId',
    authenticationToken,
    allowedUserMiddleware,
    upload.array('images', 10),
    DiscussionPostController.createPost,
);

router.get(
    '/:eventId',
    authenticationToken,
    allowedUserMiddleware,
    DiscussionPostController.getPosts,
);

router.get(
    '/:eventId/posts/:postId',
    authenticationToken,
    allowedUserMiddleware,
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
    allowedUserMiddleware,
    DiscussionPostController.deletePost,
);

export default router;
