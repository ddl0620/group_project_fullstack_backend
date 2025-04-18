import express from "express";
import { DiscussionReplyController } from "../controllers/discussionReply.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";
import {checkReplyParticipant } from "../middlewares/checkReplyParticipant.middleware";
import { createReplySchema, updateReplySchema } from "../validation/discussionReply.validation";
import { validateRequest } from "../middlewares/validation.middleware"

const router = express.Router();

router.post("/:postId", authenticationToken, validateRequest(createReplySchema), checkReplyParticipant, DiscussionReplyController.createReply);
router.get("/:postId", authenticationToken, validateRequest(updateReplySchema), checkReplyParticipant, DiscussionReplyController.getReplies);
router.get("/:replyId/detail", authenticationToken, checkReplyParticipant, DiscussionReplyController.getReplyById);
router.put("/:replyId", authenticationToken, checkReplyParticipant, DiscussionReplyController.updateReply);
router.delete("/:replyId", authenticationToken, checkReplyParticipant, DiscussionReplyController.deleteReply);

export default router;