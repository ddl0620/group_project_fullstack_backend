import { ImageUploadService } from '../services/imageUpload.service';
import { ImageDiscussionService } from '../services/imageDiscussion.service';
import { ImageDicussionModel } from '../models/imageDiscussion.model';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import { HttpError } from '../helpers/httpsError.helpers';
import fs from 'fs';

// Mock dependencies
jest.mock('cloudinary');
jest.mock('../models/imageDiscussion.model');
jest.mock('fs');

// Mock mongoose.Types.ObjectId.isValid to return true for our test IDs
mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

describe('Image Services Tests', () => {
  // Valid 24-character hex strings for IDs
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockPostId = '507f1f77bcf86cd799439022';
  const mockReplyId = '507f1f77bcf86cd799439033';
  const mockImageId = '507f1f77bcf86cd799439044';

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------- ImageUploadService Tests -----------------------
  describe('ImageUploadService', () => {
    const mockFile = {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 12345,
      destination: '/tmp',
      filename: 'test-1234.jpg',
      path: '/tmp/test-1234.jpg',
      buffer: Buffer.from('test image data'),
    } as Express.Multer.File;

    const mockFiles = [mockFile];
    const mockSecureUrl = 'https://res.cloudinary.com/demo/image/upload/test-1234.jpg';

    describe('uploadImage', () => {
      it('should upload an image to cloudinary and return URL', async () => {
        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
          secure_url: mockSecureUrl,
        });

        const result = await ImageUploadService.uploadImage({
          file: mockFile.path,
          folder: 'test-folder',
        });

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
          mockFile.path,
          expect.objectContaining({
            folder: 'test-folder',
            resource_type: 'image',
          })
        );
        expect(result).toEqual(mockSecureUrl);
      });

      it('should throw error if upload fails', async () => {
        (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(
          new Error('Upload failed')
        );

        await expect(
          ImageUploadService.uploadImage({
            file: mockFile.path,
            folder: 'test-folder',
          })
        ).rejects.toThrow(HttpError);
      });
    });

    describe('uploadImages', () => {
      it('should upload multiple images and return URLs', async () => {
        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
          secure_url: mockSecureUrl,
        });

        const inputs = [
          { file: '/path/to/image1.jpg', folder: 'test-folder' },
          { file: '/path/to/image2.jpg', folder: 'test-folder' },
        ];

        const result = await ImageUploadService.uploadImages(inputs);

        expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(2);
        expect(result).toEqual([mockSecureUrl, mockSecureUrl]);
      });
    });

    describe('deleteImages', () => {
      it('should delete images from cloudinary', async () => {
        (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

        const urls = [
          'https://res.cloudinary.com/demo/image/upload/folder/file1.jpg',
          'https://res.cloudinary.com/demo/image/upload/folder/file2.jpg',
        ];

        await ImageUploadService.deleteImages(urls, 'test-folder');

        expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
      });

      it('should continue deletion if one image fails', async () => {
        (cloudinary.uploader.destroy as jest.Mock)
          .mockResolvedValueOnce({ result: 'ok' })
          .mockRejectedValueOnce(new Error('Failed to delete'));

        const urls = [
          'https://res.cloudinary.com/demo/image/upload/folder/file1.jpg',
          'https://res.cloudinary.com/demo/image/upload/folder/file2.jpg',
        ];

        // This should not throw
        await ImageUploadService.deleteImages(urls, 'test-folder');

        expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
      });
    });

    describe('convertFileToURL', () => {
      it('should convert files to URLs', async () => {
        // Spy on the uploadImages method
        const uploadImagesSpy = jest.spyOn(ImageUploadService, 'uploadImages')
          .mockResolvedValue([mockSecureUrl]);

        const result = await ImageUploadService.convertFileToURL(mockFiles, 'events', mockUserId);

        expect(uploadImagesSpy).toHaveBeenCalledWith([
          {
            file: mockFile.path,
            folder: `events/${mockUserId}`,
          },
        ]);
        expect(result).toEqual([mockSecureUrl]);
      });

      it('should return empty array if no files provided', async () => {
        const result = await ImageUploadService.convertFileToURL([], 'events', mockUserId);
        expect(result).toEqual([]);
      });
    });

    describe('updateImagesList', () => {
      it('should update images and delete removed ones', async () => {
        const uploadImagesSpy = jest.spyOn(ImageUploadService, 'uploadImages')
          .mockResolvedValue([mockSecureUrl]);
        const deleteImagesSpy = jest.spyOn(ImageUploadService, 'deleteImages')
          .mockResolvedValue();

        const existingImages = ['https://old-image-url.jpg'];
        const entity = {
          images: ['https://old-image-url.jpg', 'https://removed-image.jpg'],
        };

        const result = await ImageUploadService.updateImagesList(
          mockFiles,
          existingImages,
          entity,
          'events',
          mockUserId
        );

        expect(uploadImagesSpy).toHaveBeenCalled();
        expect(deleteImagesSpy).toHaveBeenCalled();
        expect(result).toEqual([...existingImages, mockSecureUrl]);
      });

      it('should handle invalid existingImages format', async () => {
        await expect(
          ImageUploadService.updateImagesList(
            mockFiles,
            'invalid-json' as any,
            {},
            'events',
            mockUserId
          )
        ).rejects.toThrow(HttpError);
      });
    });
  });

  // ----------------------- ImageDiscussionService Tests -----------------------
  describe('ImageDiscussionService', () => {
    const mockImageData = {
      url: 'https://example.com/image.jpg',
      type: 'post' as const,
      reference_id: mockPostId,
    };

    const mockImage = {
      _id: mockImageId,
      ...mockImageData,
      uploaded_at: new Date(),
      isDeleted: false,
    };

    describe('createImage', () => {
      it('should create a new image record', async () => {
        (ImageDicussionModel.create as jest.Mock).mockResolvedValue(mockImage);

        const result = await ImageDiscussionService.createImage(mockImageData);

        expect(ImageDicussionModel.create).toHaveBeenCalledWith(mockImageData);
        expect(result).toEqual(mockImage);
      });
    });

    describe('getImagesByReference', () => {
      it('should return images for a reference', async () => {
        (ImageDicussionModel.find as jest.Mock).mockReturnValue({
          sort: jest.fn().mockResolvedValue([mockImage]),
        });

        const result = await ImageDiscussionService.getImagesByReference(
          mockPostId,
          'post'
        );

        expect(ImageDicussionModel.find).toHaveBeenCalledWith({
          reference_id: mockPostId,
          type: 'post',
          isDeleted: false,
        });
        expect(result).toEqual([mockImage]);
      });
    });

    describe('deleteImage', () => {
      it('should soft delete an image', async () => {
        const deletedImage = { ...mockImage, isDeleted: true };
        (ImageDicussionModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(deletedImage);

        const result = await ImageDiscussionService.deleteImage(mockImageId);

        expect(ImageDicussionModel.findByIdAndUpdate).toHaveBeenCalledWith(
          mockImageId,
          { isDeleted: true },
          { new: true }
        );
        expect(result).toEqual(deletedImage);
      });
    });

    describe('deleteImagesByReference', () => {
      it('should soft delete all images for a reference', async () => {
        (ImageDicussionModel.updateMany as jest.Mock).mockResolvedValue({ nModified: 2 });

        await ImageDiscussionService.deleteImagesByReference(mockPostId, 'post');

        expect(ImageDicussionModel.updateMany).toHaveBeenCalledWith(
          { reference_id: mockPostId, type: 'post' },
          { isDeleted: true }
        );
      });
    });
  });
});