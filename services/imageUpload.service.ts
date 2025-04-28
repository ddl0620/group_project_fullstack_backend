import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from '../helpers/httpsError.helpers';

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadImageInput {
    file: string; // File ảnh (đường dẫn hoặc buffer)
    folder: string; // Thư mục trên Cloudinary
}

export class ImageUploadService {
    /**
     * Upload ảnh lên Cloudinary và trả về URL
     */
    static async uploadImage(input: UploadImageInput): Promise<string> {
        const { file, folder } = input;

        try {
            const result = await cloudinary.uploader.upload(file, {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' }, // Giới hạn kích thước
                    { quality: 'auto', fetch_format: 'auto' }, // Tối ưu chất lượng và định dạng
                ],
            });

            return result.secure_url;
        } catch (err: any) {
            throw new HttpError(`Failed to upload image: ${err.message}`, 500, 'UPLOAD_IMAGE_FAILED');
        }
    }

    /**
     * Upload nhiều ảnh cùng lúc và trả về danh sách URL
     */
    static async uploadImages(inputs: UploadImageInput[]): Promise<string[]> {
        const uploadPromises = inputs.map(input => this.uploadImage(input));
        return await Promise.all(uploadPromises);
    }

    /**
     * Delete multiple images from Cloudinary by their URLs
     * @param urls Array of Cloudinary URLs to delete
     * @param folder Folder path used in Cloudinary (e.g., 'discussionPosts/{postId}')
     */
    static async deleteImages(urls: string[], folder: string): Promise<void> {
        try {
            const deletePromises = urls.map(async (url) => {
                try {
                    // Extract public_id from URL
                    const urlParts = url.split('/');
                    const fileName = urlParts.pop()?.split('.')[0]; // Get filename without extension
                    if (!fileName) {
                        throw new Error('Invalid URL format');
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
}