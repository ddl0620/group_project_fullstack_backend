import multer from "multer";
import fs from "fs";
import path from "path";

/**
 * File Upload Configuration Module
 * 
 * This module configures multer for handling file uploads in the application.
 * It sets up storage locations, filename generation, file size limits,
 * and filtering for allowed file types.
 */

/**
 * Create uploads directory if it doesn't exist
 * 
 * Ensures the target directory for file uploads exists before
 * attempting to save files. Uses the current working directory
 * as the base path for the uploads folder.
 */
// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure storage options for multer
 * 
 * Sets up disk storage with custom destination and filename generation.
 * This ensures files are stored in the correct location with unique names
 * to prevent conflicts.
 */
// Cấu hình storage cho multer
const storage = multer.diskStorage({
    /**
     * Define the destination directory for uploaded files
     * 
     * @param req - Express request object
     * @param file - Information about the uploaded file
     * @param cb - Callback to indicate the destination directory
     */
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Thư mục lưu file tạm thời
    },
    /**
     * Generate a unique filename for each uploaded file
     * 
     * Creates a filename using timestamp, random number, and original filename
     * to ensure uniqueness and preserve file extension.
     * 
     * @param req - Express request object
     * @param file - Information about the uploaded file
     * @param cb - Callback to indicate the generated filename
     */
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`); // Tên file duy nhất
    },
});

/**
 * Configure multer middleware for file uploads
 * 
 * Sets up multer with storage configuration, size limits, and file type filtering.
 * This configuration ensures secure and controlled file uploads.
 */
// Cấu hình multer
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn 5MB mỗi file
        files: 10, // Giới hạn tối đa 10 file mỗi request
    },
    /**
     * Filter files based on mimetype
     * 
     * Only allows image files to be uploaded, rejecting other file types.
     * 
     * @param req - Express request object
     * @param file - Information about the uploaded file
     * @param cb - Callback to accept or reject the file
     */
    fileFilter: (req, file, cb) => {
        // Chỉ cho phép file ảnh
        if (!file.mimetype.startsWith("image/")) {
            return new Error("Only image files are allowed");
        }
        cb(null, true);
    },
});

export default upload;