import express from "express";
import { DiscussionReplyController } from "../controllers/discussionReply.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";
import { checkEventParticipant } from "../middlewares/checkEventParticipant.middleware";

const router = express.Router();

router.post("/:postId", authenticationToken, checkEventParticipant, DiscussionReplyController.createReply);
router.get("/:postId", authenticationToken, checkEventParticipant, DiscussionReplyController.getReplies);
router.get("/:replyId/detail", authenticationToken, checkEventParticipant, DiscussionReplyController.getReplyById);
router.put("/:replyId", authenticationToken, checkEventParticipant, DiscussionReplyController.updateReply);
router.delete("/:replyId", authenticationToken, checkEventParticipant, DiscussionReplyController.deleteReply);

export default router;