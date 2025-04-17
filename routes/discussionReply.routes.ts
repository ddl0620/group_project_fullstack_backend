import express from "express";
import { DiscussionReplyController } from "../controllers/discussionReply.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";
import { checkEventParticipant } from "../middlewares/checkEventParticipant.middleware";
import { createReplySchema, updateReplySchema } from "../validation/discussionReply.validation";
import { validateRequest } from "../middlewares/validation.middleware"

const router = express.Router();

router.post("/:postId", authenticationToken, validateRequest(createReplySchema), checkEventParticipant, DiscussionReplyController.createReply);
router.get("/:postId", authenticationToken, validateRequest(updateReplySchema), checkEventParticipant, DiscussionReplyController.getReplies);
router.get("/:replyId/detail", authenticationToken, checkEventParticipant, DiscussionReplyController.getReplyById);
router.put("/:replyId", authenticationToken, checkEventParticipant, DiscussionReplyController.updateReply);
router.delete("/:replyId", authenticationToken, checkEventParticipant, DiscussionReplyController.deleteReply);

export default router;