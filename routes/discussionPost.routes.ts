import express from "express";
import { DiscussionPostController } from "../controllers/discussionPost.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";
import { checkEventParticipant } from "../middlewares/checkEventParticipant.middleware";
import { createPostSchema, updatePostSchema } from "../validation/discussionPost.validation";
import { validateRequest } from "../middlewares/validation.middleware";

const router = express.Router();

// input: eventId là string nhé --> oke roi
router.post("/:eventId", authenticationToken, validateRequest(createPostSchema), checkEventParticipant, DiscussionPostController.createPost);

// input: eventId là string nhé --> oke roi
router.get("/:eventId", authenticationToken, checkEventParticipant, DiscussionPostController.getPosts);

// input: eventId và postId
router.get("/:eventId/posts/:postId", authenticationToken, checkEventParticipant, DiscussionPostController.getPostById);

router.put("/:postId", authenticationToken, validateRequest(updatePostSchema), checkEventParticipant, DiscussionPostController.updatePost);

router.delete("/:postId", authenticationToken, checkEventParticipant, DiscussionPostController.deletePost);

export default router;