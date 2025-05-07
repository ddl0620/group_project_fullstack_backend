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
import { NotificationService } from './notification.service';
import { EventInterface } from '../interfaces/event.interfaces';
import {
    CreateInvitationInput,
    CreateRSVPInput,
    InvitationListResponse,
    RSVPListResponse,
} from '../types/invitation.types';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';
import { UserInterface } from '../interfaces/user.interfaces';

export class InvitationService {
    static async createInvitation(
        invitorId: string,
        input: CreateInvitationInput,
    ): Promise<InvitationInterface> {
        const { content, eventId, inviteeId } = input;

        const event: EventInterface | null = await EventModel.findOne({
            _id: eventId,
            isDeleted: false,
        });
        if (!event) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        if (event.organizer.toString() !== invitorId) {
            throw new HttpError(
                'Only the organizer can send invitations',
                StatusCode.FORBIDDEN,
                ErrorCode.FORBIDDEN,
            );
        }

        const invitee: UserInterface | null = await UserModel.findOne({
            _id: inviteeId,
            isDeleted: false,
        });

        if (!invitee) {
            throw new HttpError(
                'Invitee not found',
                StatusCode.NOT_FOUND,
                ErrorCode.USER_NOT_FOUND,
            );
        }

        if (
            !event.participants ||
            !event.participants.some(
                p => p.userId.toString() === inviteeId && p.status === ParticipationStatus.ACCEPTED,
            )
        ) {
            throw new HttpError(
                'Invitee must be an accepted participant of the event',
                StatusCode.BAD_REQUEST,
                ErrorCode.CAN_NOT_CREATE,
            );
        }

        const existingInvitation: InvitationInterface | null = await InvitationModel.findOne({
            eventId: eventId,
            inviteeId: inviteeId,
            isDeleted: false,
        });
        if (existingInvitation) {
            throw new HttpError(
                'Invitation already exists',
                StatusCode.BAD_REQUEST,
                ErrorCode.CAN_NOT_CREATE,
            );
        }

        try {
            const invitation: InvitationInterface | null = await InvitationModel.create({
                sentAt: new Date(),
                content,
                eventId: eventId,
                invitorId: invitorId,
                inviteeId: inviteeId,
            });

            await NotificationService.createNotification({
                ...NotificationService.invitationNotificationContent(event.title),
                userIds: [inviteeId],
            });

            return invitation;
        } catch (err: any) {
            throw new HttpError(
                `Failed to create invitation: ${err.message}`,
                StatusCode.BAD_REQUEST,
                ErrorCode.CAN_NOT_CREATE,
            );
        }
    }

    static async getReceivedInvitations(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<InvitationListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [{ inviteeId: userId }, { isDeleted: false }],
        };

        const invitations: InvitationInterface[] | null = await InvitationModel.find(query)
            .populate('eventId', '_id title description')
            .populate('invitorId', '_id name email')
            .populate('inviteeId', '_id name email')
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const total: number = await InvitationModel.countDocuments(query);

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
        const event: EventInterface = await EventService.getEventById(userId, eventId);

        if (!event) {
            throw new HttpError(
                'Event not found or you are not authorized',
                StatusCode.NOT_FOUND,
                ErrorCode.EVENT_NOT_FOUND,
            );
        }

        const invitation: InvitationInterface | null = await InvitationModel.findOne({
            inviteeId: userId,
            isDeleted: false,
            eventId: eventId,
        });

        if (!invitation) {
            throw new HttpError(
                'Invitation not found',
                StatusCode.NOT_FOUND,
                ErrorCode.INVITATION_NOT_FOUND,
            );
        }

        return invitation;
    }

    static async getInvitationById(
        userId: string,
        invitationId: string,
    ): Promise<InvitationInterface> {
        const invitation: InvitationInterface | null = await InvitationModel.findOne({
            _id: invitationId,
            isDeleted: false,
        })
            .populate('eventId', 'title description')
            .populate('invitorId', 'name email')
            .populate('inviteeId', 'name email');

        if (!invitation) {
            throw new HttpError(
                'Invitation not found',
                StatusCode.NOT_FOUND,
                ErrorCode.INVITATION_NOT_FOUND,
            );
        }

        if (
            invitation.invitorId.toString() !== userId &&
            invitation.inviteeId.toString() !== userId
        ) {
            throw new HttpError(
                'Access denied to this invitation',
                StatusCode.FORBIDDEN,
                ErrorCode.ACCESS_DENIED,
            );
        }

        return invitation;
    }

    static async deleteInvitation(
        userId: string,
        invitationId: string,
    ): Promise<InvitationInterface> {
        const invitation = await InvitationModel.findOne({ _id: invitationId, isDeleted: false });
        if (!invitation) {
            throw new HttpError(
                'Invitation not found',
                StatusCode.NOT_FOUND,
                ErrorCode.INVITATION_NOT_FOUND,
            );
        }

        if (invitation.invitorId.toString() !== userId) {
            throw new HttpError(
                'Only the invitor can delete this invitation',
                StatusCode.FORBIDDEN,
                ErrorCode.FORBIDDEN,
            );
        }

        const deletedInvitation: InvitationInterface | null =
            await InvitationModel.findByIdAndUpdate(
                invitationId,
                { $set: { isDeleted: true } },
                { new: true },
            );

        if (!deletedInvitation) {
            throw new HttpError(
                'Invitation not found',
                StatusCode.NOT_FOUND,
                ErrorCode.INVITATION_NOT_FOUND,
            );
        }

        return deletedInvitation;
    }

    static async createRSVP(
        userId: string,
        invitationId: string,
        input: CreateRSVPInput,
    ): Promise<RSVPInterface> {
        const invitation: InvitationInterface | null = await InvitationModel.findOne({
            _id: invitationId,
            isDeleted: false,
        });
        if (!invitation) {
            throw new HttpError(
                'Invitation not found',
                StatusCode.NOT_FOUND,
                ErrorCode.INVITATION_NOT_FOUND,
            );
        }

        if (invitation.inviteeId.toString() !== userId) {
            throw new HttpError(
                'Only the invitee can respond to this invitation',
                StatusCode.FORBIDDEN,
                ErrorCode.FORBIDDEN,
            );
        }

        const existingRSVP: RSVPInterface | null = await RSVPModel.findOne({
            invitationId: invitationId,
            isDeleted: false,
        });
        if (existingRSVP) {
            throw new HttpError(
                'RSVP already exists for this invitation',
                StatusCode.BAD_REQUEST,
                ErrorCode.CAN_NOT_CREATE,
            );
        }

        const tmpInvitation: InvitationInterface | null =
            await InvitationModel.findById(invitationId).select('eventId');
        const event: EventInterface | null = await EventModel.findById(tmpInvitation?.eventId);

        try {
            const rsvp: RSVPInterface | null = await RSVPModel.create({
                invitationId: invitationId,
                response: input.response,
                respondedAt: new Date(),
            });
            const notiContent =
                input.response === RSVPStatus.ACCEPTED
                    ? NotificationService.rsvpAcceptNotificationContent(event?.title || 'Event')
                    : NotificationService.rsvpDeniedNotificationContent(event?.title || 'Event');

            await NotificationService.createNotification({
                ...notiContent,
                userIds: [invitation.invitorId.toString()],
            });

            return rsvp;
        } catch (err: any) {
            throw new HttpError(
                `Failed to create RSVP: ${err.message}`,
                StatusCode.INTERNAL_SERVER_ERROR,
                ErrorCode.CAN_NOT_CREATE,
            );
        }
    }

    static async getRSVPs(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<RSVPListResponse> {
        const skip: number = (page - 1) * limit;
        const sortOrder: 1 | -1 = sortBy.toLowerCase() === 'asc' ? 1 : -1;

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
        const rsvp: RSVPInterface | null = await RSVPModel.findOne({
            _id: rsvpId,
            isDeleted: false,
        });
        if (!rsvp) {
            throw new HttpError('RSVP not found', StatusCode.NOT_FOUND, ErrorCode.RSVP_NOT_FOUND);
        }

        const invitation: InvitationInterface | null = await InvitationModel.findById(
            rsvp.invitationId,
        );
        if (!invitation) {
            throw new HttpError(
                'Associated invitation not found',
                StatusCode.NOT_FOUND,
                ErrorCode.INVITATION_NOT_FOUND,
            );
        }

        if (
            invitation.invitorId.toString() !== userId &&
            invitation.inviteeId.toString() !== userId
        ) {
            throw new HttpError(
                'Access denied to this RSVP',
                StatusCode.FORBIDDEN,
                ErrorCode.ACCESS_DENIED,
            );
        }

        return rsvp;
    }

    static async deleteRSVP(userId: string, rsvpId: string): Promise<RSVPInterface> {
        const rsvp: RSVPInterface | null = await RSVPModel.findOne({
            _id: rsvpId,
            isDeleted: false,
        });
        if (!rsvp) {
            throw new HttpError('RSVP not found', StatusCode.NOT_FOUND, ErrorCode.RSVP_NOT_FOUND);
        }

        const invitation: InvitationInterface | null = await InvitationModel.findById(
            rsvp.invitationId,
        );
        if (!invitation) {
            throw new HttpError(
                'Associated invitation not found',
                StatusCode.NOT_FOUND,
                ErrorCode.INVITATION_NOT_FOUND,
            );
        }

        if (invitation.inviteeId.toString() !== userId) {
            throw new HttpError(
                'Only the invitee can delete this RSVP',
                StatusCode.FORBIDDEN,
                ErrorCode.FORBIDDEN,
            );
        }

        const deletedRSVP: RSVPInterface | null = await RSVPModel.findByIdAndUpdate(
            rsvpId,
            { $set: { isDeleted: true } },
            { new: true },
        );

        if (!deletedRSVP) {
            throw new HttpError('RSVP not found', StatusCode.NOT_FOUND, ErrorCode.RSVP_NOT_FOUND);
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
        const event: EventInterface | null = await EventModel.findOne({
            _id: eventId,
            isDeleted: false,
        });
        if (!event) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        if (event.organizer.toString() !== userId) {
            throw new HttpError(
                'Only the organizer can view invitations for this event',
                StatusCode.FORBIDDEN,
                ErrorCode.FORBIDDEN,
            );
        }

        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [{ eventId: eventId }, { isDeleted: false }],
        };

        const invitations: InvitationInterface[] | null = await InvitationModel.find(query)
            .populate('eventId', 'title description')
            .populate('invitorId', 'name email')
            .populate('inviteeId', 'name email')
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const total: number = await InvitationModel.countDocuments(query);

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
        const invitation: InvitationInterface | null = await InvitationModel.findOne({
            _id: invitationId,
            $or: [{ inviteeId: userId }, { invitorId: userId }],
            isDeleted: false,
        });
        if (!invitation) {
            throw new HttpError(
                'Invitation not found or not authorized',
                StatusCode.NOT_FOUND,
                ErrorCode.INVITATION_NOT_FOUND,
            );
        }

        const rsvp: RSVPInterface | null = await RSVPModel.findOne({
            invitationId,
            isDeleted: false,
        }).populate({
            path: '_id',
            select: 'name email',
        });
        return rsvp || { invitationId, response: 'PENDING' };
    }
}
