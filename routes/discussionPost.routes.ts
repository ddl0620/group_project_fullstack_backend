import express from "express";
import { DiscussionPostController } from "../controllers/discussionPost.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";
import { checkEventParticipant} from "../middlewares/checkEventParticipant.middleware"
import { createPostSchema, updatePostSchema } from "../validation/discussionPost.validation";
import { validateRequest } from "../middlewares/validation.middleware";

const router = express.Router();

router.post("/:eventId", authenticationToken, validateRequest(createPostSchema), checkEventParticipant, DiscussionPostController.createPost);
router.get("/:eventId", authenticationToken, validateRequest(updatePostSchema), checkEventParticipant, DiscussionPostController.getPosts);
router.get("/:postId/detail", authenticationToken, checkEventParticipant, DiscussionPostController.getPostById);
router.put("/:postId", authenticationToken, checkEventParticipant, DiscussionPostController.updatePost);
router.delete("/:postId", authenticationToken, checkEventParticipant, DiscussionPostController.deletePost);

export default router;