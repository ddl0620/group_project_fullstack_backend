import { Router } from 'express';
import { authenticationToken } from '../middlewares/auth.middleware';
import { onlySelf } from '../middlewares/oneUser.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { updateUserSchema } from '../validation/user.validation';
import { UserController } from '../controllers/user.controllers';
import upload from '../uploads/multer.config';

const userRoutes = Router();
const controller = new UserController();

/**
 * GET /me
 * 
 * Retrieves the profile information of the currently authenticated user
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.me - Fetches the current user's profile data
 * 
 * @returns {Object} The authenticated user's profile information
 */
userRoutes.get('/me', authenticationToken, controller.me);

/**
 * PUT /basicInfo/:id
 * 
 * Updates the basic profile information of a user
 * 
 * @param {string} id - ID of the user to update
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware onlySelf - Ensures users can only update their own profiles
 * @middleware upload.array - Handles avatar image upload (max 1 file)
 * @controller controller.updateBasicInformation - Processes the profile update
 * 
 * @body {Object} userData - User profile data to update
 * @file {File} avatar - Optional profile image file
 * 
 * @returns {Object} The updated user profile information
 */
userRoutes.put(
    '/basicInfo/:id',
    authenticationToken,
    onlySelf,
    upload.array('avatar', 1),
    controller.updateBasicInformation,
);

/**
 * PUT /password/:id
 * 
 * Updates the password for a user account
 * 
 * @param {string} id - ID of the user whose password is being updated
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware onlySelf - Ensures users can only update their own passwords
 * @controller controller.updatePassword - Processes the password update
 * 
 * @body {Object} passwordData - Contains current and new password information
 * 
 * @returns {Object} Confirmation of password update
 */
userRoutes.put('/password/:id', authenticationToken, onlySelf, controller.updatePassword);

/**
 * DELETE /:id
 * 
 * Deletes a user account
 * 
 * @param {string} id - ID of the user account to delete
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware onlySelf - Ensures users can only delete their own accounts
 * @controller controller.deleteUser - Processes the account deletion
 * 
 * @returns {Object} Confirmation of account deletion
 */
userRoutes.delete('/:id', authenticationToken, onlySelf, controller.deleteUser);

/**
 * GET /:id
 * 
 * Retrieves the profile information of a specific user by ID
 * 
 * @param {string} id - ID of the user to retrieve
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.getUserById - Fetches the specified user's profile data
 * 
 * @returns {Object} The requested user's profile information
 */
userRoutes.get('/:id', authenticationToken, controller.getUserById);

export default userRoutes;
