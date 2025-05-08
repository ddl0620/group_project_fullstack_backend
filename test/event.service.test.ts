import { EventService } from '../services/event.service';
import { EventModel } from '../models/event.models';
import { UserModel } from '../models/user.models';
import { ImageUploadService } from '../services/imageUpload.service';
import mongoose from 'mongoose';
import { EventType } from '../enums/eventType.enums';
import { ParticipationStatus } from '../enums/participationStatus.enums';
import { NotificationService } from '../services/notification.service';

jest.mock('../models/event.models');
jest.mock('../models/user.models');
jest.mock('../services/imageUpload.service');
jest.mock('../services/notification.service');
// Mock mongoose.Types.ObjectId.isValid to return true for our test IDs
mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

describe('EventService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Use valid 24-character hex strings for IDs
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEventId = '507f1f77bcf86cd799439022';
  const mockParticipantId1 = '507f1f77bcf86cd799439033';
  const mockParticipantId2 = '507f1f77bcf86cd799439044';
  const mockParticipantId3 = '507f1f77bcf86cd799439055';

  const mockUser = {
    _id: mockUserId,
    maxEventCreate: 2,
    maxParticipantPerEvent: 3,
    password: 'hidden',
  };

  const mockEvent = {
    _id: mockEventId,
    title: 'Test Event',
    description: 'This is a test event',
    type: EventType.SOCIAL,
    startDate: new Date(),
    endDate: new Date(),
    location: 'Hanoi',
    images: [],
    organizer: mockUserId,
    participants: [],
    isPublic: true,
    isDeleted: false,
  };

  describe('addEvent', () => {
    it('should create a new event if under max limit', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
      (EventModel.countDocuments as jest.Mock).mockResolvedValue(0);
      (ImageUploadService.convertFileToURL as jest.Mock).mockResolvedValue(['image1.jpg']);
      (EventModel.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await EventService.addEvent(mockUserId, {
        title: mockEvent.title,
        description: mockEvent.description,
        type: mockEvent.type,
        startDate: mockEvent.startDate,
        endDate: mockEvent.endDate,
        location: mockEvent.location,
        isPublic: true,
        organizer: mockUserId,
      }, []);

      expect(result).toEqual(mockEvent);
    });
  });

  describe('getOrganizedEvents', () => {
    it('should return events and pagination', async () => {
      (EventModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockEvent]),
      });
      (EventModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await EventService.getOrganizedEvents(mockUserId, 1, 10, 'desc');
      expect(result.events.length).toBe(1);
    });
  });

  describe('getEventById', () => {
    it('should return event if public or organizer', async () => {
      (EventModel.findOne as jest.Mock).mockResolvedValue(mockEvent);
      const result = await EventService.getEventById(mockUserId, mockEventId);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('setActiveStatus', () => {
    it('should soft delete an event', async () => {
      (EventModel.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockEvent, isDeleted: true });

      const result = await EventService.setActiveStatus(mockUserId, mockEventId, true);
      expect(result.isDeleted).toBe(true);
    });
  });

  describe('replyEvent', () => {
    it('should accept a participant if within limit', async () => {
      const event = {
        ...mockEvent,
        participants: [
          { userId: new mongoose.Types.ObjectId(mockParticipantId1), status: ParticipationStatus.ACCEPTED },
          { userId: new mongoose.Types.ObjectId(mockParticipantId2), status: ParticipationStatus.ACCEPTED },
          { userId: new mongoose.Types.ObjectId(mockParticipantId3), status: ParticipationStatus.PENDING },
        ],
      };
      
      (EventModel.findOne as jest.Mock).mockResolvedValue(event);
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      
      const updatedEvent = {
        ...event,
        participants: event.participants.map(p =>
          p.userId.toString() === mockParticipantId3
            ? { ...p, status: ParticipationStatus.ACCEPTED, respondedAt: new Date() }
            : p
        ),
      };
      
      (EventModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedEvent);
      
      // Mock the notification service to prevent the error
      (NotificationService.createNotification as jest.Mock).mockResolvedValue({});
      
      const result = await EventService.replyEvent(mockEventId, mockUserId, {
        userId: mockParticipantId3,
        status: 'ACCEPTED',
      });
      
      expect(result?.participants?.some(p => 
        p.userId.toString() === mockParticipantId3.toString() && 
        p.status === ParticipationStatus.ACCEPTED
      )).toBe(true);
    });
  });
});