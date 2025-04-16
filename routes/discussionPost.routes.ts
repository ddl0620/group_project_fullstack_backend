import express from "express";
import { DiscussionPostController } from "../controllers/discussionPost.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/:eventId", authenticationToken, DiscussionPostController.createPost);
router.get("/:eventId", authenticationToken, DiscussionPostController.getPosts);
router.get("/:postId/detail", authenticationToken, DiscussionPostController.getPostById);
router.put("/:postId", authenticationToken, DiscussionPostController.updatePost);
router.delete("/:postId", authenticationToken, DiscussionPostController.deletePost);

export default router;