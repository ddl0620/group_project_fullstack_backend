import express from 'express';
import { DiscussionReplyController } from '../controllers/discussionReply.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { checkReplyParticipant } from '../middlewares/checkReplyParticipant.middleware';
import upload from '../uploads/multer.config';

/**
 * Discussion Reply Router
 * 
 * This router handles operations related to replies within discussion posts,
 * including creating, retrieving, updating, and deleting replies.
 * All routes require authentication and verify that the user has permission
 * to interact with the specific post or reply.
 */
const router = express.Router();

/**
 * POST /:postId
 * 
 * Creates a new reply to a specific discussion post
 * 
 * @param {string} postId - ID of the post to reply to
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware checkReplyParticipant - Ensures the user has permission to reply to this post
 * @middleware upload.array - Handles multiple image uploads (up to 10)
 * @controller DiscussionReplyController.createReply - Processes reply creation
 * 
 * @body {Object} replyData - Reply content and metadata
 * @body {Array<File>} images - Optional image files to attach to the reply
 * 
 * @returns {Object} The created reply details
 */
router.post(
    '/:postId',
    authenticationToken,
    checkReplyParticipant,
    upload.array('images', 10),
    DiscussionReplyController.createReply,
);

/**
 * GET /:postId
 * 
 * Retrieves all replies for a specific discussion post
 * 
 * @param {string} postId - ID of the post to get replies from
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware checkReplyParticipant - Ensures the user has permission to view replies to this post
 * @controller DiscussionReplyController.getReplies - Retrieves replies for the post
 * 
 * @returns {Array} List of replies for the specified post
 */
router.get(
    '/:postId',
    authenticationToken,
    checkReplyParticipant,
    DiscussionReplyController.getReplies,
);

/**
 * GET /:replyId/detail
 * 
 * Retrieves a specific reply by its ID
 * 
 * @param {string} replyId - ID of the reply to retrieve
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware checkReplyParticipant - Ensures the user has permission to view this reply
 * @controller DiscussionReplyController.getReplyById - Retrieves the specific reply
 * 
 * @returns {Object} The requested reply details
 */
router.get(
    '/:replyId/detail',
    authenticationToken,
    checkReplyParticipant,
    DiscussionReplyController.getReplyById,
);

/**
 * PUT /:replyId
 * 
 * Updates an existing reply
 * 
 * @param {string} replyId - ID of the reply to update
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware upload.array - Handles multiple image uploads (up to 10)
 * @middleware checkReplyParticipant - Ensures the user has permission to update this reply
 * @controller DiscussionReplyController.updateReply - Processes reply update
 * 
 * @body {Object} updatedData - Updated reply content and metadata
 * @body {Array<File>} images - Optional image files to attach to the reply
 * 
 * @returns {Object} The updated reply details
 */
router.put(
    '/:replyId',
    authenticationToken,
    upload.array('images', 10),
    checkReplyParticipant,
    DiscussionReplyController.updateReply,
);

/**
 * DELETE /:replyId
 * 
 * Removes a reply
 * 
 * @param {string} replyId - ID of the reply to delete
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware checkReplyParticipant - Ensures the user has permission to delete this reply
 * @controller DiscussionReplyController.deleteReply - Handles reply deletion
 * 
 * @returns {Object} Confirmation of deletion
 */
router.delete(
    '/:replyId',
    authenticationToken,
    checkReplyParticipant,
    DiscussionReplyController.deleteReply,
);

export default router;
