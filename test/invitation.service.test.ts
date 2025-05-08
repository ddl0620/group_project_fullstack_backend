import { InvitationService } from '../services/invitation.service';
import { EventModel } from '../models/event.models';
import { UserModel } from '../models/user.models';
import { InvitationModel } from '../models/Invitation/invitation.models';
import { RSVPModel } from '../models/Invitation/rsvp.models';
import { NotificationService } from '../services/notification.service';
import { EventService } from '../services/event.service';
import mongoose from 'mongoose';
import { HttpError } from '../helpers/httpsError.helpers';
import { ParticipationStatus } from '../enums/participationStatus.enums';
import { RSVPStatus } from '../interfaces/Invitation/rsvp.interface';

jest.mock('../models/event.models');
jest.mock('../models/user.models');
jest.mock('../models/Invitation/invitation.models');
jest.mock('../models/Invitation/rsvp.models');
jest.mock('../services/notification.service');
jest.mock('../services/event.service');

// Mock mongoose.Types.ObjectId.isValid to return true for our test IDs
mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

describe('InvitationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Valid 24-character hex strings for IDs
  const mockInvitorId = '507f1f77bcf86cd799439011';
  const mockInviteeId = '507f1f77bcf86cd799439022';
  const mockEventId = '507f1f77bcf86cd799439033';
  const mockInvitationId = '507f1f77bcf86cd799439044';
  const mockRsvpId = '507f1f77bcf86cd799439055';

  const mockEvent = {
    _id: mockEventId,
    title: 'Test Event',
    description: 'This is a test event',
    organizer: mockInvitorId,
    participants: [
      { userId: new mongoose.Types.ObjectId(mockInviteeId), status: ParticipationStatus.ACCEPTED }
    ],
    isDeleted: false,
  };

  const mockInvitation: any = {
    _id: mockInvitationId,
    sentAt: new Date(),
    content: 'Please join this event',
    eventId: mockEventId,
    invitorId: mockInvitorId,
    inviteeId: mockInviteeId,
    isDeleted: false,
    populate: jest.fn().mockReturnThis(),
    toString: () => mockInvitationId,
  };

  const mockRSVP = {
    _id: mockRsvpId,
    invitationId: mockInvitationId,
    response: RSVPStatus.ACCEPTED,
    respondedAt: new Date(),
    isDeleted: false,
  };

  describe('createInvitation', () => {
    it('should create an invitation successfully', async () => {
      // Mock dependencies
      (EventModel.findOne as jest.Mock).mockResolvedValue(mockEvent);
      (UserModel.findOne as jest.Mock).mockResolvedValue({ _id: mockInviteeId });
      (InvitationModel.findOne as jest.Mock).mockResolvedValue(null);
      (InvitationModel.create as jest.Mock).mockResolvedValue(mockInvitation);
      (NotificationService.createNotification as jest.Mock).mockResolvedValue({});
      (NotificationService.invitationNotificationContent as jest.Mock).mockReturnValue({
        title: 'Invitation',
        content: 'You have been invited to Test Event',
      });

      const result = await InvitationService.createInvitation(mockInvitorId, {
        content: 'Please join this event',
        eventId: mockEventId,
        inviteeId: mockInviteeId,
      });

      expect(EventModel.findOne).toHaveBeenCalledWith({
        _id: mockEventId,
        isDeleted: false,
      });
      expect(UserModel.findOne).toHaveBeenCalledWith({
        _id: mockInviteeId,
        isDeleted: false,
      });
      expect(InvitationModel.create).toHaveBeenCalledWith({
        sentAt: expect.any(Date),
        content: 'Please join this event',
        eventId: mockEventId,
        invitorId: mockInvitorId,
        inviteeId: mockInviteeId,
      });
      expect(NotificationService.createNotification).toHaveBeenCalled();
      expect(result).toEqual(mockInvitation);
    });

    it('should throw error if event not found', async () => {
      (EventModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(InvitationService.createInvitation(mockInvitorId, {
        content: 'Please join this event',
        eventId: mockEventId,
        inviteeId: mockInviteeId,
      })).rejects.toThrow(new HttpError('Event not found', 404, 'NOT_FOUND_EVENT'));
    });

    it('should throw error if not the organizer', async () => {
      const nonOrganizerEvent = { ...mockEvent, organizer: 'different-id' };
      (EventModel.findOne as jest.Mock).mockResolvedValue(nonOrganizerEvent);

      await expect(InvitationService.createInvitation(mockInvitorId, {
        content: 'Please join this event',
        eventId: mockEventId,
        inviteeId: mockInviteeId,
      })).rejects.toThrow(new HttpError('Only the organizer can send invitations', 403, 'FORBIDDEN'));
    });
  });

  describe('getReceivedInvitations', () => {
    it('should return invitations with pagination', async () => {
      const mockInvitations = [mockInvitation];
      
      (InvitationModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockInvitations),
      });
      (InvitationModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await InvitationService.getReceivedInvitations(mockInviteeId, 1, 10, 'desc');

      expect(InvitationModel.find).toHaveBeenCalledWith({
        $and: [{ inviteeId: mockInviteeId }, { isDeleted: false }],
      });
      expect(result.invitations).toEqual(mockInvitations);
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getInvitationById', () => {
    it('should return an invitation by ID', async () => {
      (InvitationModel.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockImplementation(function() {
          return {
            populate: jest.fn().mockImplementation(function() {
              return {
                populate: jest.fn().mockResolvedValue(mockInvitation)
              };
            })
          };
        }),
      });
      mockInvitation.invitorId = { toString: () => mockInvitorId };
      mockInvitation.inviteeId = { toString: () => mockInviteeId };

      const result = await InvitationService.getInvitationById(mockInvitorId, mockInvitationId);

      expect(InvitationModel.findOne).toHaveBeenCalledWith({ _id: mockInvitationId, isDeleted: false });
      expect(result).toEqual(mockInvitation);
    });

    it('should throw error if invitation not found', async () => {
      (InvitationModel.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockImplementation(function() {
          return {
            populate: jest.fn().mockImplementation(function() {
              return {
                populate: jest.fn().mockResolvedValue(null)
              };
            })
          };
        }),
      });

      await expect(InvitationService.getInvitationById(mockInvitorId, mockInvitationId))
        .rejects.toThrow(new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION'));
    });
  });

  describe('deleteInvitation', () => {
    it('should delete an invitation', async () => {
      mockInvitation.invitorId = { toString: () => mockInvitorId };
      (InvitationModel.findOne as jest.Mock).mockResolvedValue(mockInvitation);
      (InvitationModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ 
        ...mockInvitation, 
        isDeleted: true 
      });

      const result = await InvitationService.deleteInvitation(mockInvitorId, mockInvitationId);

      expect(InvitationModel.findOne).toHaveBeenCalledWith({ _id: mockInvitationId, isDeleted: false });
      expect(InvitationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockInvitationId,
        { $set: { isDeleted: true } },
        { new: true },
      );
      expect(result.isDeleted).toBe(true);
    });

    it('should throw error if not the invitor', async () => {
      mockInvitation.invitorId = { toString: () => 'different-id' };
      (InvitationModel.findOne as jest.Mock).mockResolvedValue(mockInvitation);

      await expect(InvitationService.deleteInvitation(mockInvitorId, mockInvitationId))
        .rejects.toThrow(new HttpError('Only the invitor can delete this invitation', 403, 'FORBIDDEN'));
    });
  });

  describe('createRSVP', () => {
    it('should create an RSVP successfully', async () => {
      mockInvitation.inviteeId = { toString: () => mockInviteeId };
      (InvitationModel.findOne as jest.Mock).mockResolvedValue(mockInvitation);
      (RSVPModel.findOne as jest.Mock).mockResolvedValue(null);
      (InvitationModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ eventId: mockEventId }),
      });
      (EventModel.findById as jest.Mock).mockResolvedValue(mockEvent);
      (RSVPModel.create as jest.Mock).mockResolvedValue(mockRSVP);
      (NotificationService.rsvpAcceptNotificationContent as jest.Mock).mockReturnValue({
        title: 'RSVP Accepted',
        content: 'Your invitation has been accepted',
      });
      (NotificationService.createNotification as jest.Mock).mockResolvedValue({});

      const result = await InvitationService.createRSVP(mockInviteeId, mockInvitationId, {
        response: RSVPStatus.ACCEPTED,
      });

      expect(InvitationModel.findOne).toHaveBeenCalledWith({ _id: mockInvitationId, isDeleted: false });
      expect(RSVPModel.findOne).toHaveBeenCalledWith({
        invitationId: mockInvitationId,
        isDeleted: false,
      });
      expect(RSVPModel.create).toHaveBeenCalledWith({
        invitationId: mockInvitationId,
        response: RSVPStatus.ACCEPTED,
        respondedAt: expect.any(Date),
      });
      expect(NotificationService.createNotification).toHaveBeenCalled();
      expect(result).toEqual(mockRSVP);
    });

    it('should throw error if RSVP already exists', async () => {
      mockInvitation.inviteeId = { toString: () => mockInviteeId };
      (InvitationModel.findOne as jest.Mock).mockResolvedValue(mockInvitation);
      (RSVPModel.findOne as jest.Mock).mockResolvedValue(mockRSVP);

      await expect(InvitationService.createRSVP(mockInviteeId, mockInvitationId, {
        response: RSVPStatus.ACCEPTED,
      })).rejects.toThrow(new HttpError('RSVP already exists for this invitation', 400, 'RSVP_EXISTS'));
    });
  });

  describe('getRSVPById', () => {
    it('should return an RSVP by ID', async () => {
      (RSVPModel.findOne as jest.Mock).mockResolvedValue(mockRSVP);
      mockInvitation.invitorId = { toString: () => mockInvitorId };
      mockInvitation.inviteeId = { toString: () => mockInviteeId };
      (InvitationModel.findById as jest.Mock).mockResolvedValue(mockInvitation);

      const result = await InvitationService.getRSVPById(mockInvitorId, mockRsvpId);

      expect(RSVPModel.findOne).toHaveBeenCalledWith({ _id: mockRsvpId, isDeleted: false });
      expect(result).toEqual(mockRSVP);
    });

    it('should throw error if RSVP not found', async () => {
      (RSVPModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(InvitationService.getRSVPById(mockInvitorId, mockRsvpId))
        .rejects.toThrow(new HttpError('RSVP not found', 404, 'NOT_FOUND_RSVP'));
    });
  });

  describe('deleteRSVP', () => {
    it('should delete an RSVP', async () => {
      (RSVPModel.findOne as jest.Mock).mockResolvedValue(mockRSVP);
      mockInvitation.inviteeId = { toString: () => mockInviteeId };
      (InvitationModel.findById as jest.Mock).mockResolvedValue(mockInvitation);
      (RSVPModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockRSVP, isDeleted: true });

      const result = await InvitationService.deleteRSVP(mockInviteeId, mockRsvpId);

      expect(RSVPModel.findOne).toHaveBeenCalledWith({ _id: mockRsvpId, isDeleted: false });
      expect(RSVPModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRsvpId,
        { $set: { isDeleted: true } },
        { new: true },
      );
      expect(result.isDeleted).toBe(true);
    });

    it('should throw error if not the invitee', async () => {
      (RSVPModel.findOne as jest.Mock).mockResolvedValue(mockRSVP);
      mockInvitation.inviteeId = { toString: () => 'different-id' };
      (InvitationModel.findById as jest.Mock).mockResolvedValue(mockInvitation);

      await expect(InvitationService.deleteRSVP(mockInviteeId, mockRsvpId))
        .rejects.toThrow(new HttpError('Only the invitee can delete this RSVP', 403, 'FORBIDDEN'));
    });
  });
});