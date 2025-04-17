import express from "express";
import { DiscussionPostController } from "../controllers/discussionPost.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";
import { checkEventParticipant} from "../middlewares/checkEventParticipant.middleware"

const router = express.Router();

router.post("/:eventId", authenticationToken, checkEventParticipant, DiscussionPostController.createPost);
router.get("/:eventId", authenticationToken, checkEventParticipant, DiscussionPostController.getPosts);
router.get("/:postId/detail", authenticationToken, checkEventParticipant, DiscussionPostController.getPostById);
router.put("/:postId", authenticationToken, checkEventParticipant, DiscussionPostController.updatePost);
router.delete("/:postId", authenticationToken, checkEventParticipant, DiscussionPostController.deletePost);

export default router;