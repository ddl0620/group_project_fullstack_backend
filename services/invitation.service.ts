import mongoose from 'mongoose';
import { EventModel } from '../models/event.models';
import { UserModel } from '../models/user.models';
import { ParticipationStatus } from '../enums/participationStatus.enums';
import { RSVPInterface, RSVPStatus } from '../interfaces/Invitation/rsvp.interface';
import { InvitationInterface } from '../interfaces/Invitation/invitation.interface';
import { HttpError } from '../helpers/httpsError.helpers';
import { InvitationModel } from '../models/Invitation/invitation.models';
import { RSVPModel } from '../models/Invitation/rsvp.models';
import { EventService } from './event.service';

interface CreateInvitationInput {
    content?: string;
    eventId: string;
    inviteeId: string;
}

interface CreateRSVPInput {
    response: RSVPStatus;
}

interface InvitationListResponse {
    invitations: InvitationInterface[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
}

interface RSVPListResponse {
    rsvps: RSVPInterface[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalRSVP: number;
    };
}

export class InvitationService {
    static async createInvitation(
        invitorId: string,
        input: CreateInvitationInput,
    ): Promise<InvitationInterface> {
        const { content, eventId, inviteeId } = input;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(inviteeId)) {
            throw new HttpError('Invalid invitee ID format', 400, 'INVALID_INVITEE_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(invitorId)) {
            throw new HttpError('Invalid invitor ID format', 400, 'INVALID_INVITOR_ID');
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false });
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (event.organizer.toString() !== invitorId) {
            throw new HttpError('Only the organizer can send invitations', 403, 'FORBIDDEN');
        }

        const invitee = await UserModel.findOne({
            _id: inviteeId,
            isDeleted: false,
        });
        if (!invitee) {
            throw new HttpError('Invitee not found', 404, 'NOT_FOUND_USER');
        }

        if (
            !event.participants ||
            !event.participants.some(
                p => p.userId.toString() === inviteeId && p.status === ParticipationStatus.ACCEPTED,
            )
        ) {
            throw new HttpError(
                'Invitee must be an accepted participant of the event',
                400,
                'INVALID_INVITEE',
            );
        }

        const existingInvitation = await InvitationModel.findOne({
            eventId: eventId,
            inviteeId: inviteeId,
            isDeleted: false,
        });
        if (existingInvitation) {
            throw new HttpError('Invitation already exists', 400, 'INVITATION_EXISTS');
        }

        try {
            const invitation = await InvitationModel.create({
                sentAt: new Date(),
                content,
                eventId: eventId,
                invitorId: invitorId,
                inviteeId: inviteeId,
            });
            return invitation;
        } catch (err: any) {
            throw new HttpError(
                `Failed to create invitation: ${err.message}`,
                500,
                'CREATE_INVITATION_FAILED',
            );
        }
    }

    static async getReceivedInvitations(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<InvitationListResponse> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [{ inviteeId: userId }, { isDeleted: false }],
        };

        const invitations = await InvitationModel.find(query)
            .populate('eventId', '_id title description')
            .populate('invitorId', '_id name email')
            .populate('inviteeId', '_id name email')
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const total = await InvitationModel.countDocuments(query);

        return {
            invitations,
            pagination: {
                total,
                page,
                limit,
            },
        };
    }

    static async getReceivedInvitationById(
        userId: string,
        eventId: string,
    ): Promise<InvitationInterface> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const event = await EventService.getEventById(userId, eventId);

        if (!event) {
            throw new HttpError(
                'Event not found or you are not authorized',
                404,
                'NOT_FOUND_EVENT',
            );
        }

        const invitation = await InvitationModel.findOne({
            inviteeId: userId,
            isDeleted: false,
            eventId: eventId,
        });

        if (!invitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        return invitation;
    }

    static async getInvitationById(
        userId: string,
        invitationId: string,
    ): Promise<InvitationInterface> {
        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            throw new HttpError('Invalid invitation ID format', 400, 'INVALID_INVITATION_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const invitation = await InvitationModel.findOne({ _id: invitationId, isDeleted: false })
            .populate('eventId', 'title description')
            .populate('invitorId', 'name email')
            .populate('inviteeId', 'name email');

        if (!invitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        if (
            invitation.invitorId.toString() !== userId &&
            invitation.inviteeId.toString() !== userId
        ) {
            throw new HttpError('Access denied to this invitation', 403, 'ACCESS_DENIED');
        }

        return invitation;
    }

    static async deleteInvitation(
        userId: string,
        invitationId: string,
    ): Promise<InvitationInterface> {
        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            throw new HttpError('Invalid invitation ID format', 400, 'INVALID_INVITATION_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const invitation = await InvitationModel.findOne({ _id: invitationId, isDeleted: false });
        if (!invitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        if (invitation.invitorId.toString() !== userId) {
            throw new HttpError('Only the invitor can delete this invitation', 403, 'FORBIDDEN');
        }

        const deletedInvitation = await InvitationModel.findByIdAndUpdate(
            invitationId,
            { $set: { isDeleted: true } },
            { new: true },
        );

        if (!deletedInvitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        return deletedInvitation;
    }

    static async createRSVP(
        userId: string,
        invitationId: string,
        input: CreateRSVPInput,
    ): Promise<RSVPInterface> {
        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            throw new HttpError('Invalid invitation ID format', 400, 'INVALID_INVITATION_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        if (!Object.values(RSVPStatus).includes(input.response)) {
            throw new HttpError('Invalid RSVP response', 400, 'INVALID_RSVP_RESPONSE');
        }

        const invitation = await InvitationModel.findOne({ _id: invitationId, isDeleted: false });
        if (!invitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        if (invitation.inviteeId.toString() !== userId) {
            throw new HttpError(
                'Only the invitee can respond to this invitation',
                403,
                'FORBIDDEN',
            );
        }

        const existingRSVP = await RSVPModel.findOne({
            invitationId: invitationId,
            isDeleted: false,
        });
        if (existingRSVP) {
            throw new HttpError('RSVP already exists for this invitation', 400, 'RSVP_EXISTS');
        }

        try {
            const rsvp = await RSVPModel.create({
                invitationId: invitationId,
                response: input.response,
                respondedAt: new Date(),
            });
            return rsvp;
        } catch (err: any) {
            throw new HttpError(`Failed to create RSVP: ${err.message}`, 500, 'CREATE_RSVP_FAILED');
        }
    }

    static async getRSVPs(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<RSVPListResponse> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const pipeline: mongoose.PipelineStage[] = [
            {
                $match: {
                    inviteeId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                },
            },
            {
                $lookup: {
                    from: 'rsvps',
                    localField: '_id',
                    foreignField: 'invitationId',
                    as: 'rsvp',
                },
            },
            {
                $unwind: {
                    path: '$rsvp',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $match: {
                    'rsvp.isDeleted': false,
                },
            },
            {
                $sort: {
                    'rsvp.createdAt': sortOrder,
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    _id: '$rsvp._id',
                    invitationId: '$rsvp.invitationId',
                    response: '$rsvp.response',
                    respondedAt: '$rsvp.respondedAt',
                    isDeleted: '$rsvp.isDeleted',
                    createdAt: '$rsvp.createdAt',
                    updatedAt: '$rsvp.updatedAt',
                },
            },
        ];

        const rsvps = await InvitationModel.aggregate(pipeline).exec();

        const totalRSVP = await RSVPModel.countDocuments({
            invitationId: {
                $in: (
                    await InvitationModel.find({ inviteeId: userId, isDeleted: false }).select(
                        '_id',
                    )
                ).map(inv => inv._id),
            },
            isDeleted: false,
        });

        return {
            rsvps,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalRSVP / limit),
                totalRSVP,
            },
        };
    }

    static async getRSVPById(userId: string, rsvpId: string): Promise<RSVPInterface> {
        if (!mongoose.Types.ObjectId.isValid(rsvpId)) {
            throw new HttpError('Invalid RSVP ID format', 400, 'INVALID_RSVP_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const rsvp = await RSVPModel.findOne({ _id: rsvpId, isDeleted: false });
        if (!rsvp) {
            throw new HttpError('RSVP not found', 404, 'NOT_FOUND_RSVP');
        }

        const invitation = await InvitationModel.findById(rsvp.invitationId);
        if (!invitation) {
            throw new HttpError('Associated invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        if (
            invitation.invitorId.toString() !== userId &&
            invitation.inviteeId.toString() !== userId
        ) {
            throw new HttpError('Access denied to this RSVP', 403, 'ACCESS_DENIED');
        }

        return rsvp;
    }

    static async deleteRSVP(userId: string, rsvpId: string): Promise<RSVPInterface> {
        if (!mongoose.Types.ObjectId.isValid(rsvpId)) {
            throw new HttpError('Invalid RSVP ID format', 400, 'INVALID_RSVP_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const rsvp = await RSVPModel.findOne({ _id: rsvpId, isDeleted: false });
        if (!rsvp) {
            throw new HttpError('RSVP not found', 404, 'NOT_FOUND_RSVP');
        }

        const invitation = await InvitationModel.findById(rsvp.invitationId);
        if (!invitation) {
            throw new HttpError('Associated invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        if (invitation.inviteeId.toString() !== userId) {
            throw new HttpError('Only the invitee can delete this RSVP', 403, 'FORBIDDEN');
        }

        const deletedRSVP = await RSVPModel.findByIdAndUpdate(
            rsvpId,
            { $set: { isDeleted: true } },
            { new: true },
        );

        if (!deletedRSVP) {
            throw new HttpError('RSVP not found', 404, 'NOT_FOUND_RSVP');
        }

        return deletedRSVP;
    }

    static async getInvitationsByEventId(
        userId: string,
        eventId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<InvitationListResponse> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false });
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }
        if (event.organizer.toString() !== userId) {
            throw new HttpError(
                'Only the organizer can view invitations for this event',
                403,
                'FORBIDDEN',
            );
        }

        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [{ eventId: eventId }, { isDeleted: false }],
        };

        const invitations = await InvitationModel.find(query)
            .populate('eventId', 'title description')
            .populate('invitorId', 'name email')
            .populate('inviteeId', 'name email')
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const total = await InvitationModel.countDocuments(query);
        console.log('Backend total:', total); // Debug

        return {
            invitations,
            pagination: {
                total,
                page,
                limit,
            },
        };
    }

    static async getRSVPByInvitationId(
        userId: string,
        invitationId: string,
    ): Promise<RSVPInterface | { invitationId: string; response: string }> {
        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            throw new HttpError('Invalid invitation ID format', 400, 'INVALID_INVITATION_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const invitation = await InvitationModel.findOne({
            _id: invitationId,
            $or: [{ inviteeId: userId }, { invitorId: userId }],
            isDeleted: false,
        });
        if (!invitation) {
            throw new HttpError(
                'Invitation not found or not authorized',
                404,
                'INVITATION_NOT_FOUND',
            );
        }

        const rsvp = await RSVPModel.findOne({ invitationId, isDeleted: false }).populate({
            path: '_id',
            select: 'name email',
        });
        return rsvp || { invitationId, response: 'PENDING' };
    }
}
