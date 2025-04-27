import express from "express";
import { DiscussionReplyController } from "../controllers/discussionReply.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";
import {checkReplyParticipant } from "../middlewares/checkReplyParticipant.middleware";
import {updateReplySchema } from "../validation/discussionReply.validation";
import { validateRequest } from "../middlewares/validation.middleware"

const router = express.Router();

// đã check --> oke roi
router.post("/:postId", authenticationToken, checkReplyParticipant, DiscussionReplyController.createReply);
// router.post("/:postId", authenticationToken, validateRequest(createReplySchema), checkReplyParticipant, DiscussionReplyController.createReply);

// đã check --> oke roi
router.get("/:postId", authenticationToken, checkReplyParticipant, DiscussionReplyController.getReplies);

// đã check --> oke roi
router.get("/:replyId/detail", authenticationToken, checkReplyParticipant, DiscussionReplyController.getReplyById);

// đã check --> oke roi
router.put("/:replyId", authenticationToken, validateRequest(updateReplySchema), checkReplyParticipant, DiscussionReplyController.updateReply);

router.delete("/:replyId", authenticationToken, checkReplyParticipant, DiscussionReplyController.deleteReply);

export default router;