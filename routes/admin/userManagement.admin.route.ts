import { Router } from 'express';
import { UserManagementController } from '../../controllers/admin/userManagement.controller';
import { adminOnlyMiddleware, authenticationToken } from '../../middlewares/auth.middleware';

/**
 * Admin User Management Router
 * 
 * This router handles all administrative operations related to user management,
 * including listing, creating, updating, and deleting users.
 * All routes are protected by authentication and admin-only access controls.
 */
const UserRouter = Router();

/**
 * GET /user-management/
 * 
 * Retrieves all users in the system for administrative review
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @controller UserManagementController.getAllUsers - Lists all users with filtering options
 * 
 * @returns {Array} List of users with pagination support
 */
UserRouter.get('/', authenticationToken, adminOnlyMiddleware, UserManagementController.getAllUsers);

/**
 * POST /user-management/
 * 
 * Creates a new user in the system
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @controller UserManagementController.createNewUser - Creates a new user with provided data
 * 
 * @returns {Object} The created user details
 */
UserRouter.post(
    '/',
    authenticationToken,
    adminOnlyMiddleware,
    UserManagementController.createNewUser,
);

/**
 * PUT /user-management/:id
 * 
 * Updates an existing user's information
 * 
 * @param {string} id - ID of the user to update
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @controller UserManagementController.updateUserInformation - Updates the user with provided data
 * 
 * @returns {Object} The updated user details
 */
UserRouter.put(
    '/:id',
    authenticationToken,
    adminOnlyMiddleware,
    UserManagementController.updateUserInformation,
);

/**
 * DELETE /user-management/:id
 * 
 * Removes a user from the system
 * 
 * @param {string} id - ID of the user to delete
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @controller UserManagementController.deleteUser - Handles the user deletion process
 * 
 * @returns {Object} Confirmation of deletion
 */
UserRouter.delete(
    '/:id',
    authenticationToken,
    adminOnlyMiddleware,
    UserManagementController.deleteUser,
);

export default UserRouter;
