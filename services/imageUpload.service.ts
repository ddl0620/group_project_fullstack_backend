import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from '../helpers/httpsError.helpers';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Input interface for image upload operations
 */
export interface UploadImageInput {
    file: string; // File ảnh (đường dẫn hoặc buffer)
    folder: string; // Thư mục trên Cloudinary
}

/**
 * Image Upload Service
 *
 * This service manages operations related to image uploads, including
 * uploading, deleting, and managing images on Cloudinary.
 * It provides optimized image processing and organized storage.
 */
export class ImageUploadService {
    /**
     * Uploads a single image to Cloudinary
     *
     * Uploads an image with optimization transformations and returns the secure URL.
     *
     * @param {UploadImageInput} input - Upload parameters including file and folder
     * @returns {Promise<string>} The secure URL of the uploaded image
     * @throws {HttpError} If upload fails
     */
    static async uploadImage(input: UploadImageInput): Promise<string> {
        const { file, folder } = input;

        try {
            const result = await cloudinary.uploader.upload(file, {
                folder: folder,
                chunk_size: 6000000, // 6MB per chunk
                resource_type: 'image',
                transformation: [
                    { width: 1024, height: 1024, crop: 'limit' }, // Giới hạn kích thước
                    { quality: 'auto', fetch_format: 'auto' }, // Tối ưu chất lượng và định dạng
                ],
            });

            return result.secure_url;
        } catch (err: any) {
            throw new HttpError(
                `Failed to upload image: ${err.message}`,
                StatusCode.INTERNAL_SERVER_ERROR,
                ErrorCode.UPLOAD_IMAGE_FAILED,
            );
        }
    }

    /**
     * Uploads multiple images to Cloudinary in parallel
     *
     * Processes multiple image uploads concurrently and returns all secure URLs.
     *
     * @param {UploadImageInput[]} inputs - Array of upload parameters
     * @returns {Promise<string[]>} Array of secure URLs for the uploaded images
     */
    static async uploadImages(inputs: UploadImageInput[]): Promise<string[]> {
        const uploadPromises = inputs.map(input => this.uploadImage(input));
        return await Promise.all(uploadPromises);
    }

    /**
     * Deletes multiple images from Cloudinary by their URLs
     *
     * Extracts public IDs from URLs and deletes the images from Cloudinary.
     * Continues with remaining deletions if individual deletions fail.
     *
     * @param {string[]} urls - Array of Cloudinary URLs to delete
     * @param {string} folder - Folder path in Cloudinary (e.g., 'discussionPosts/{postId}')
     * @returns {Promise<void>}
     */
    static async deleteImages(urls: string[], folder: string): Promise<void> {
        try {
            const deletePromises = urls.map(async url => {
                try {
                    // Extract public_id from URL
                    const urlParts: string[] = url.split('/');
                    const fileName = urlParts.pop()?.split('.')[0]; // Get filename without extension
                    if (!fileName) {
                        throw new HttpError(
                            'Invalid URL format',
                            StatusCode.URI_TOO_LONG,
                            ErrorCode.INVALID_INPUT,
                        );
                    }
                    const publicId = `${folder}/${fileName}`; // e.g., 'discussionPosts/{postId}/{fileName}'

                    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                } catch (err: any) {
                    console.error(`Failed to delete Cloudinary image ${url}:`, err.message);
                    // Continue with other deletions
                }
            });

            await Promise.all(deletePromises);
        } catch (err: any) {
            console.error('Error during bulk image deletion:', err.message);
            // Do not throw to avoid blocking the main operation
        }
    }

    /**
     * Converts Multer file objects to Cloudinary URLs
     *
     * Processes uploaded files and stores them in a specified folder structure.
     *
     * @param {Express.Multer.File[] | undefined} files - Array of uploaded files
     * @param {string} folderName - Base folder name for storage
     * @param {string | null} id - Optional ID to create a subfolder
     * @returns {Promise<string[]>} Array of secure URLs for the uploaded images
     */
    static async convertFileToURL(
        files: Express.Multer.File[] | undefined,
        folderName: string,
        id: string | null = null,
    ): Promise<string[]> {
        let imgUrls: string[] = [];

        if (files && files.length > 0) {
            const uploadedImages = [];

            for (const currentFile of files) {
                const tmp: UploadImageInput = {
                    file: currentFile.path,
                    folder: id ? `${folderName}/${id}` : folderName,
                };

                uploadedImages.push(tmp);
            }

            imgUrls = await ImageUploadService.uploadImages(uploadedImages);
        }

        return imgUrls;
    }

    /**
     * Updates an entity's image list, handling additions and removals
     *
     * Processes new uploads, retains specified existing images, and removes
     * deleted images from both the entity and Cloudinary storage.
     *
     * @param {Express.Multer.File[] | undefined} files - New files to upload
     * @param {string[]} existingImages - URLs of images to retain
     * @param {any} entity - Entity with current images array
     * @param {string} folderName - Base folder name for storage
     * @param {string | null} id - Optional ID for subfolder
     * @returns {Promise<string[]>} Updated array of image URLs
     * @throws {HttpError} If existingImages format is invalid
     */
    static async updateImagesList(
        files: Express.Multer.File[] | undefined,
        existingImages: string[],
        entity: any,
        folderName: string,
        id: string | null = null,
    ): Promise<string[]> {
        // Parse existingImages
        const folder: string = id ? `${folderName}/${id}` : folderName;
        let retainedImages: string[] = [];
        if (existingImages) {
            try {
                retainedImages = Array.isArray(existingImages)
                    ? existingImages
                    : typeof existingImages === 'string'
                      ? JSON.parse(existingImages)
                      : [];
                if (!Array.isArray(retainedImages)) {
                    throw new Error('existingImages must be an array');
                }
            } catch (err) {
                throw new HttpError(
                    'Invalid existingImages format',
                    400,
                    'INVALID_EXISTING_IMAGES',
                );
            }
        }

        // Identify removed images for Cloudinary cleanup
        const entityImages: string[] = entity?.images;
        const removedImages: string[] = (entityImages || []).filter(
            url => !retainedImages.includes(url),
        );

        // Handle new file uploads
        let newImageUrls: string[] = [];
        if (files && files.length > 0) {
            const uploadInputs = files.map(file => ({
                file: file.path,
                folder: folder,
            }));
            newImageUrls = await ImageUploadService.uploadImages(uploadInputs);
        }

        // Combine retained images and new uploads
        const updatedImages = [...retainedImages, ...newImageUrls];

        // Delete removed images from Cloudinary
        if (removedImages.length > 0 && folder && id) {
            await ImageUploadService.deleteImages(removedImages, folder);
        }

        return updatedImages;
    }
}
