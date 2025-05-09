import mongoose from "mongoose";
import {DB_URI} from "../config/env";

/**
 * Database Connection Module
 * 
 * This module provides functionality to establish a connection to MongoDB using Mongoose.
 * It validates the presence of a database URI in environment variables and handles
 * connection errors appropriately.
 * 
 * @module database/connection
 */

/**
 * Validates that the MongoDB URI is defined in environment variables
 * Throws an error if the URI is missing to prevent application startup with invalid configuration
 * 
 * @throws {Error} If DB_URI is not defined in environment variables
 */
if(!DB_URI){
    throw new Error("Please add a MongoDB URI to .env file");
}

/**
 * Establishes a connection to MongoDB using the provided URI
 * 
 * This function attempts to connect to the MongoDB database specified in the environment
 * variables. On success, it logs a confirmation message. On failure, it logs the error
 * and terminates the process with exit code 1, as the application cannot function
 * without a database connection.
 * 
 * @async
 * @function connectToDB
 * @returns {Promise<void>} A promise that resolves when the connection is established
 * @throws {Error} Logs error and exits process if connection fails
 * 
 * @example
 * // Import and call in your application entry point
 * import connectToDB from './path/to/this/file';
 * 
 * async function startServer() {
 *   await connectToDB();
 *   // Continue with server initialization
 * }
 */
const connectToDB = async (): Promise<void> => {
    try {
        await mongoose.connect(DB_URI as string);
        console.log("✅ Successfully connected to database");
    } catch (e) {
        //log
        console.error("❌ Error connecting to database:", e);
        process.exit(1);
    }
}

export default connectToDB;