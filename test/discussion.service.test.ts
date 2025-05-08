import { DiscussionPostService } from '../services/discussionPost.service';
import { DiscussionReplyService } from '../services/discussionReply.service';
import { DiscussionPostModel } from '../models/discussionPost.model';
import { DiscussionReplyModel } from '../models/discussionReply.model';
import { EventModel } from '../models/event.models';
import { ImageUploadService } from '../services/imageUpload.service';
import { NotificationService } from '../services/notification.service';
import mongoose from 'mongoose';
import { HttpError } from '../helpers/httpsError.helpers';

// Mock dependencies
jest.mock('../models/discussionPost.model');
jest.mock('../models/discussionReply.model');
jest.mock('../models/event.models');
jest.mock('../services/imageUpload.service');
jest.mock('../services/notification.service');

// Mock mongoose.Types.ObjectId.isValid to return true for our test IDs
mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

describe('Discussion Services Tests', () => {
  // Valid 24-character hex strings for IDs
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEventId = '507f1f77bcf86cd799439022';
  const mockPostId = '507f1f77bcf86cd799439033';
  const mockReplyId = '507f1f77bcf86cd799439044';
  const mockParentReplyId = '507f1f77bcf86cd799439055';

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------- DiscussionPostService Tests -----------------------
  describe('DiscussionPostService', () => {
    const mockPost = {
      _id: mockPostId,
      creator_id: mockUserId,
      event_id: mockEventId,
      content: 'Test post content',
      images: ['https://example.com/image1.jpg'],
      isDeleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockEvent = {
      _id: mockEventId,
      title: 'Test Event',
      participants: [
        { userId: new mongoose.Types.ObjectId(mockUserId), status: 'ACCEPTED' }
      ],
      isDeleted: false,
    };

    const mockFiles = [
      {
        fieldname: 'images',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
        path: '/tmp/test.jpg',
      }
    ] as Express.Multer.File[];

    describe('createDiscussionPost', () => {
      it('should create a post successfully', async () => {
        // Mock dependencies
        (EventModel.findOne as jest.Mock).mockResolvedValue(mockEvent);
        (ImageUploadService.convertFileToURL as jest.Mock).mockResolvedValue(['https://example.com/image1.jpg']);
        (DiscussionPostModel.create as jest.Mock).mockResolvedValue(mockPost);
        (NotificationService.createNotification as jest.Mock).mockResolvedValue({});

        const result = await DiscussionPostService.createPost(
          {
            content: 'Test post content',
            creator_id: mockUserId,
            event_id: mockEventId,
          },
          mockFiles
        );

        expect(EventModel.findOne).toHaveBeenCalledWith({
          _id: mockEventId,
          isDeleted: false,
        });
        expect(ImageUploadService.convertFileToURL).toHaveBeenCalledWith(
          mockFiles,
          'discussionPost',
          mockUserId
        );
        expect(DiscussionPostModel.create).toHaveBeenCalled();
        expect(result).toEqual(mockPost);
      });

      it('should throw error if event not found', async () => {
        (EventModel.findOne as jest.Mock).mockResolvedValue(null);

        await expect(
          DiscussionPostService.createPost(
            {
              content: 'Test post content',
              creator_id: mockUserId,
              event_id: mockEventId,
            },
            mockFiles
          )
        ).rejects.toThrow();
      });
    });

    describe('getDiscussionPosts', () => {
      it('should return posts with pagination', async () => {
        const mockPosts = [mockPost];
        
        (DiscussionPostModel.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockPosts),
        });

        const result = await DiscussionPostService.getPosts(mockEventId, 1, 10);

        expect(DiscussionPostModel.find).toHaveBeenCalledWith({
          event_id: mockEventId,
          isDeleted: false,
        });
        expect(result).toEqual(mockPosts);
      });
    });

    describe('getDiscussionPostById', () => {
      it('should return a post by ID', async () => {
        (DiscussionPostModel.findById as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockPost),
        });

        const result = await DiscussionPostService.getPostById(mockPostId);

        expect(DiscussionPostModel.findById).toHaveBeenCalledWith(mockPostId);
        expect(result).toEqual(mockPost);
      });
    });

    describe('updateDiscussionPost', () => {
        it('should update a post successfully', async () => {
          const updatedPost = {
            ...mockPost,
            content: 'Updated content',
          };
  
          (DiscussionPostModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockPost),
          });
          (ImageUploadService.updateImagesList as jest.Mock).mockResolvedValue(['https://example.com/image2.jpg']);
          (DiscussionPostModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedPost);
  
          const existingImages = ['https://example.com/image1.jpg'];
          const result = await DiscussionPostService.updatePost(
            mockPostId,
            mockFiles,
            existingImages,
            { content: 'Updated content' }
          );
  
          expect(DiscussionPostModel.findByIdAndUpdate).toHaveBeenCalled();
          expect(result).toEqual(updatedPost);
        });
      });

    describe('deleteDiscussionPost', () => {
      it('should mark a post as deleted', async () => {
        const deletedPost = { ...mockPost, isDeleted: true };
        
        (DiscussionPostModel.findById as jest.Mock).mockResolvedValue(mockPost);
        (DiscussionPostModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(deletedPost);

        const result = await DiscussionPostService.deletePost(mockPostId);

        expect(DiscussionPostModel.findById).toHaveBeenCalledWith(mockPostId);
        expect(DiscussionPostModel.findByIdAndUpdate).toHaveBeenCalledWith(
          mockPostId,
          { isDeleted: true },
          { new: true }
        );
        expect(result).toEqual(deletedPost);
      });
    });
  });

  // ----------------------- DiscussionReplyService Tests -----------------------
  describe('DiscussionReplyService', () => {
    const mockReply = {
      _id: mockReplyId,
      post_id: mockPostId,
      creator_id: mockUserId,
      parent_reply_id: null,
      content: 'Test reply content',
      images: [],
      isDeleted: false,
      created_at: new Date(),
    };

    const mockChildReply = {
      _id: mockParentReplyId,
      post_id: mockPostId,
      creator_id: mockUserId,
      parent_reply_id: mockReplyId,
      content: 'Test child reply content',
      images: [],
      isDeleted: false,
      created_at: new Date(),
    };

    describe('createDiscussionReply', () => {
      it('should create a reply successfully', async () => {
        (DiscussionReplyModel.create as jest.Mock).mockResolvedValue(mockReply);

        const result = await DiscussionReplyService.createReply({
          content: 'Test reply content',
          creator_id: mockUserId,
          post_id: mockPostId,
        });

        expect(DiscussionReplyModel.create).toHaveBeenCalledWith({
          content: 'Test reply content',
          creator_id: mockUserId,
          post_id: mockPostId,
          parent_reply_id: null,
        });
        expect(result).toEqual(mockReply);
      });

      it('should create a nested reply successfully', async () => {
        const nestedReply = { ...mockReply, parent_reply_id: mockParentReplyId };
        (DiscussionReplyModel.create as jest.Mock).mockResolvedValue(nestedReply);

        const result = await DiscussionReplyService.createReply({
          content: 'Test reply content',
          creator_id: mockUserId,
          post_id: mockPostId,
          parent_reply_id: mockParentReplyId,
        });

        expect(DiscussionReplyModel.create).toHaveBeenCalledWith({
          content: 'Test reply content',
          creator_id: mockUserId,
          post_id: mockPostId,
          parent_reply_id: mockParentReplyId,
        });
        expect(result).toEqual(nestedReply);
      });
    });

    describe('getDiscussionReplies', () => {
      it('should return replies with pagination', async () => {
        const mockReplies = [mockReply];
        
        (DiscussionReplyModel.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockReplies),
        });

        const result = await DiscussionReplyService.getReplies(mockPostId, 1, 10);

        expect(DiscussionReplyModel.find).toHaveBeenCalledWith({
          post_id: mockPostId,
          isDeleted: false,
        });
        expect(result).toEqual(mockReplies);
      });
    });

    describe('getDiscussionReplyById', () => {
      it('should return a reply by ID', async () => {
        (DiscussionReplyModel.findOne as jest.Mock).mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockReply),
        });

        const result = await DiscussionReplyService.getReplyById(mockReplyId);

        expect(DiscussionReplyModel.findOne).toHaveBeenCalledWith({
          _id: mockReplyId,
          isDeleted: false,
        });
        expect(result).toEqual(mockReply);
      });
    });

    describe('updateDiscussionReply', () => {
      it('should update a reply successfully', async () => {
        const updatedReply = { ...mockReply, content: 'Updated content' };
        (DiscussionReplyModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedReply);

        const result = await DiscussionReplyService.updateReply(mockReplyId, {
          content: 'Updated content',
        });

        expect(DiscussionReplyModel.findByIdAndUpdate).toHaveBeenCalledWith(
          mockReplyId,
          { content: 'Updated content' },
          { new: true }
        );
        expect(result).toEqual(updatedReply);
      });
    });

    describe('deleteDiscussionReply', () => {
      it('should mark a reply as deleted', async () => {
        const deletedReply = { ...mockReply, isDeleted: true };
        
        (DiscussionReplyModel.findById as jest.Mock).mockResolvedValue(mockReply);
        (DiscussionReplyModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(deletedReply);

        const result = await DiscussionReplyService.deleteReply(mockReplyId);

        expect(DiscussionReplyModel.findById).toHaveBeenCalledWith(mockReplyId);
        expect(DiscussionReplyModel.findByIdAndUpdate).toHaveBeenCalledWith(
          mockReplyId,
          { isDeleted: true },
          { new: true }
        );
        expect(result).toEqual(deletedReply);
      });
    });
  });
});