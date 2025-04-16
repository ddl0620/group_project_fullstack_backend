import express from "express";
import { DiscussionReplyController } from "../controllers/discussionReply.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/:postId", authenticationToken, DiscussionReplyController.createReply);
router.get("/:postId", authenticationToken, DiscussionReplyController.getReplies);
router.get("/:replyId/detail", authenticationToken, DiscussionReplyController.getReplyById);
router.put("/:replyId", authenticationToken, DiscussionReplyController.updateReply);
router.delete("/:replyId", authenticationToken, DiscussionReplyController.deleteReply);

export default router;