/**
 * Environment Configuration
 * 
 * This module loads environment variables from the appropriate .env file
 * based on the current NODE_ENV and exports them for use throughout the application.
 * 
 * The environment variables are loaded from .env.[development|production|test].local files.
 */
import {config} from "dotenv";

// Load environment variables from the appropriate .env file
config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

/**
 * Exported environment variables
 * 
 * @property {string} PORT - The port number the server will listen on
 * @property {string} NODE_ENV - The current environment (development, production, test)
 * @property {string} DB_URI - Database connection URI
 * @property {string} JWT_SECRET - Secret key used for JWT token generation and validation
 * @property {string} JWT_EXPIRES_IN - JWT token expiration time
 */
export const {PORT,
    NODE_ENV,
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
} = process.env;