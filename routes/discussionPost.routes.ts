import express from 'express';
import { DiscussionPostController } from '../controllers/discussionPost.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { allowedUserMiddleware } from '../middlewares/checkEventParticipant.middleware';
import upload from '../uploads/multer.config';

/**
 * Discussion Post Router
 * 
 * This router handles operations related to discussion posts within events,
 * including creating, retrieving, updating, and deleting posts.
 * All routes require authentication and verify that the user is a participant of the event.
 */
const router = express.Router();

/**
 * POST /:eventId
 * 
 * Creates a new discussion post for a specific event
 * 
 * @param {string} eventId - ID of the event where the post will be created
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware allowedUserMiddleware - Ensures the user is a participant of the event
 * @middleware upload.array - Handles multiple image uploads (up to 10)
 * @controller DiscussionPostController.createPost - Processes post creation
 * 
 * @body {Object} postData - Post content and metadata
 * @body {Array<File>} images - Optional image files to attach to the post
 * 
 * @returns {Object} The created post details
 */
router.post(
    '/:eventId',
    authenticationToken,
    allowedUserMiddleware,
    upload.array('images', 10),
    DiscussionPostController.createPost,
);

/**
 * GET /:eventId
 * 
 * Retrieves all discussion posts for a specific event
 * 
 * @param {string} eventId - ID of the event to get posts from
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware allowedUserMiddleware - Ensures the user is a participant of the event
 * @controller DiscussionPostController.getPosts - Retrieves posts for the event
 * 
 * @returns {Array} List of posts for the specified event
 */
router.get(
    '/:eventId',
    authenticationToken,
    allowedUserMiddleware,
    DiscussionPostController.getPosts,
);

/**
 * GET /:eventId/posts/:postId
 * 
 * Retrieves a specific discussion post by its ID
 * 
 * @param {string} eventId - ID of the event the post belongs to
 * @param {string} postId - ID of the post to retrieve
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware allowedUserMiddleware - Ensures the user is a participant of the event
 * @controller DiscussionPostController.getPostById - Retrieves the specific post
 * 
 * @returns {Object} The requested post details
 */
router.get(
    '/:eventId/posts/:postId',
    authenticationToken,
    allowedUserMiddleware,
    DiscussionPostController.getPostById,
);

/**
 * PUT /:postId
 * 
 * Updates an existing discussion post
 * 
 * @param {string} postId - ID of the post to update
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware upload.array - Handles multiple image uploads (up to 10)
 * @controller DiscussionPostController.updatePost - Processes post update
 * 
 * @body {Object} updatedData - Updated post content and metadata
 * @body {Array<File>} images - Optional image files to attach to the post
 * 
 * @returns {Object} The updated post details
 * 
 * @note This route doesn't include the allowedUserMiddleware, suggesting the controller
 *       might handle permission checks internally (e.g., verifying post ownership)
 */
router.put(
    '/:postId',
    authenticationToken,
    upload.array('images', 10),
    DiscussionPostController.updatePost,
);

/**
 * DELETE /:eventId/posts/:postId
 * 
 * Removes a discussion post from an event
 * 
 * @param {string} eventId - ID of the event the post belongs to
 * @param {string} postId - ID of the post to delete
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware allowedUserMiddleware - Ensures the user is a participant of the event
 * @controller DiscussionPostController.deletePost - Handles post deletion
 * 
 * @returns {Object} Confirmation of deletion
 */
router.delete(
    '/:eventId/posts/:postId',
    authenticationToken,
    allowedUserMiddleware,
    DiscussionPostController.deletePost,
);

export default router;
