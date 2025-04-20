import mongoose from 'mongoose';
import { EventModel } from '../models/event.models';
import { UserModel } from '../models/user.models';
import { ParticipationStatus } from '../enums/participationStatus.enums';
import { RSVPInterface, RSVPStatus } from '../interfaces/Invitation/rsvp.interface';
import { InvitationInterface } from '../interfaces/Invitation/invitation.interface';
import { HttpError } from '../helpers/httpsError.helpers';
import { InvitationModel } from '../models/Invitation/invitation.models';
import { RSVPModel } from '../models/Invitation/rsvp.models';

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
        page: number;
        limit: number;
        totalPages: number;
        totalInvitations: number;
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
    /**
     * Create a new invitation
     * @param invitorId ID of the user sending the invitation
     * @param input Invitation details
     * @returns Created invitation
     */
    static async createInvitation(
        invitorId: string,
        input: CreateInvitationInput
    ): Promise<InvitationInterface> {
        const { content, eventId, inviteeId } = input;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(inviteeId)) {
            throw new HttpError('Invalid invitee ID format', 400, 'INVALID_INVITEE_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(invitorId)) {
            throw new HttpError('Invalid invitor ID format', 400, 'INVALID_INVITOR_ID');
        }

        // Check if event exists and invitor is the organizer
        const event = await EventModel.findOne({ _id: eventId, isDeleted: false });
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (event.organizer.toString() !== invitorId) {
            throw new HttpError('Only the organizer can send invitations', 403, 'FORBIDDEN');
        }

        // Check if invitee exists
        const invitee = await UserModel.findOne({
            _id: inviteeId,
            isDeleted: false,
        });
        if (!invitee) {
            throw new HttpError('Invitee not found', 404, 'NOT_FOUND_USER');
        }

        // Check if invitee is an accepted participant
        if (
            !event.participants ||
            !event.participants.some(
                (p) => p.userId.toString() === inviteeId && p.status === ParticipationStatus.ACCEPTED
            )
        ) {
            throw new HttpError('Invitee must be an accepted participant of the event', 400, 'INVALID_INVITEE');
        }

        // Check if invitation already exists
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
            // Send notification to the invitee (optional)
            return invitation;
        } catch (err: any) {
            throw new HttpError(
                `Failed to create invitation: ${err.message}`,
                500,
                'CREATE_INVITATION_FAILED'
            );
        }
    }

    /**
     * Get list of invitations for a user
     * @param userId ID of the user
     * @param page Page number
     * @param limit Number of items per page
     * @param sortBy Sort order ('asc' or 'desc')
     * @returns List of invitations with pagination
     */
    static async getInvitations(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc'
    ): Promise<InvitationListResponse> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [
                { inviteeId: userId },
                { isDeleted: false },
            ],
        };

        const invitations = await InvitationModel.find(query)
            .populate('eventId', 'title description')
            .populate('invitorId', 'name email')
            .populate('inviteeId', 'name email')
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalInvitations = await InvitationModel.countDocuments(query);

        return {
            invitations,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalInvitations / limit),
                totalInvitations,
            },
        };
    }

    /**
     * Get an invitation by ID
     * @param userId ID of the user
     * @param invitationId ID of the invitation
     * @returns Invitation details
     */
    static async getInvitationById(userId: string, invitationId: string): Promise<InvitationInterface> {
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

        // Only invitor or invitee can view the invitation
        if (
            invitation.invitorId.toString() !== userId &&
            invitation.inviteeId.toString() !== userId
        ) {
            throw new HttpError('Access denied to this invitation', 403, 'ACCESS_DENIED');
        }

        return invitation;
    }

    /**
     * Delete an invitation (soft delete)
     * @param userId ID of the user
     * @param invitationId ID of the invitation
     * @returns Deleted invitation
     */
    static async deleteInvitation(userId: string, invitationId: string): Promise<InvitationInterface> {
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

        // Only invitor can delete the invitation
        if (invitation.invitorId.toString() !== userId) {
            throw new HttpError('Only the invitor can delete this invitation', 403, 'FORBIDDEN');
        }

        const deletedInvitation = await InvitationModel.findByIdAndUpdate(
            invitationId,
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!deletedInvitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        return deletedInvitation;
    }

    /**
     * Create an RSVP for an invitation
     * @param userId ID of the user
     * @param invitationId ID of the invitation
     * @param input RSVP details
     * @returns Created RSVP
     */
    static async createRSVP(
        userId: string,
        invitationId: string,
        input: CreateRSVPInput
    ): Promise<RSVPInterface> {
        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            throw new HttpError('Invalid invitation ID format', 400, 'INVALID_INVITATION_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        // Validate RSVP response
        if (!Object.values(RSVPStatus).includes(input.response)) {
            throw new HttpError('Invalid RSVP response', 400, 'INVALID_RSVP_RESPONSE');
        }

        // Check if invitation exists
        const invitation = await InvitationModel.findOne({ _id: invitationId, isDeleted: false });
        if (!invitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        // Only invitee can respond
        if (invitation.inviteeId.toString() !== userId) {
            throw new HttpError('Only the invitee can respond to this invitation', 403, 'FORBIDDEN');
        }

        // Check if RSVP already exists
        const existingRSVP = await RSVPModel.findOne({ invitationId: invitationId, isDeleted: false });
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

    /**
     * Get list of RSVPs for a user
     * @param userId ID of the user
     * @param page Page number
     * @param limit Number of items per page
     * @param sortBy Sort order ('asc' or 'desc')
     * @returns List of RSVPs with pagination
     */
    static async getRSVPs(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc'
    ): Promise<RSVPListResponse> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        // Define the aggregation pipeline with explicit types
        const pipeline: mongoose.PipelineStage[] = [
            {
                $match: {
                    inviteeId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                },
            },
            {
                $lookup: {
                    from: 'rsvps', // Collection name in MongoDB
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

        // Calculate total RSVPs for pagination
        const totalRSVP = await RSVPModel.countDocuments({
            invitationId: {
                $in: (
                    await InvitationModel.find({ inviteeId: userId, isDeleted: false }).select('_id')
                ).map((inv) => inv._id),
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

    /**
     * Get an RSVP by ID
     * @param userId ID of the user
     * @param rsvpId ID of the RSVP
     * @returns RSVP details
     */
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

        // Check access: Only invitor or invitee of the related invitation can view RSVP
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

    /**
     * Delete an RSVP (soft delete)
     * @param userId ID of the user
     * @param rsvpId ID of the RSVP
     * @returns Deleted RSVP
     */
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

        // Check access: Only invitee can delete their RSVP
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
            { new: true }
        );

        if (!deletedRSVP) {
            throw new HttpError('RSVP not found', 404, 'NOT_FOUND_RSVP');
        }

        return deletedRSVP;
    }

    /**
     * Get list of invitations sent for a specific event (organizer only)
     * @param userId ID of the user (must be organizer)
     * @param eventId ID of the event
     * @param page Page number
     * @param limit Number of items per page
     * @param sortBy Sort order ('asc' or 'desc')
     * @returns List of invitations with pagination
     */
    static async getInvitationsByEventId(
        userId: string,
        eventId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc'
    ): Promise<InvitationListResponse> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        // Check if event exists and user is the organizer
        const event = await EventModel.findOne({ _id: eventId, isDeleted: false });
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }
        if (event.organizer.toString() !== userId) {
            throw new HttpError('Only the organizer can view invitations for this event', 403, 'FORBIDDEN');
        }

        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [
                { eventId: eventId },
                { isDeleted: false },
            ],
        };

        const invitations = await InvitationModel.find(query)
            .populate('eventId', 'title description')
            .populate('invitorId', 'name email')
            .populate('inviteeId', 'name email')
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalInvitations = await InvitationModel.countDocuments(query);

        return {
            invitations,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalInvitations / limit),
                totalInvitations,
            },
        };
    }
}