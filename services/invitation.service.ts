import mongoose from 'mongoose';
import { EventModel } from '../models/event.models';
import { UserModel } from '../models/user.models';

import { ParticipationStatus } from '../enums/participationStatus.enums';
import {RSVPInterface, RSVPStatus} from "../interfaces/Invitation/rsvp.interface";
import {InvitationInterface} from "../interfaces/Invitation/invitation.interface";
import {HttpError} from "../helpers/httpsError.helpers";
import {InvitationModel} from "../models/Invitation/invitation.models";
import {RSVPModel} from "../models/Invitation/rsvp.models";

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
    // Tạo lời mời mới
    static async createInvitation(
        invitorId: string,
        input: CreateInvitationInput
    ): Promise<InvitationInterface> {
        const { content, eventId, inviteeId } = input;

        // Kiểm tra event tồn tại và invitor là organizer
        const event = await EventModel.findOne({ _id: eventId, isDeleted: false });
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (event.organizer.toString() !== invitorId) {
            throw new HttpError('Only the organizer can send invitations', 403, 'FORBIDDEN');
        }

        // Kiểm tra invitee tồn tại
        const invitee = await UserModel.findOne({
            _id: inviteeId,
            isDeleted: false,
        });
        if (!invitee) {
            throw new HttpError('Invitee not found', 404, 'NOT_FOUND_USER');
        }

        // Kiểm tra invitee đã là participant và có trạng thái ACCEPTED
        const isParticipant = event.participants?.some(
            (p) => p.userId.toString() === inviteeId && p.status === ParticipationStatus.ACCEPTED
        );
        if (!isParticipant) {
            throw new HttpError('Invitee must be an accepted participant of the event', 400, 'INVALID_INVITEE');
        }

        // Kiểm tra xem lời mời đã tồn tại chưa
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
                sent_at: new Date(),
                content,
                event_id: eventId,
                invitor_id: invitorId,
                invitee_id: inviteeId
            });
            return invitation;
        } catch (err) {
            console.log(err)
            throw new HttpError('Failed to create invitation', 500, 'CREATE_INVITATION_FAILED');
        }
    }

    // Lấy danh sách lời mời của user (những lời mời gửi đến user)
    static async getInvitations(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc'
    ): Promise<InvitationListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [
                { invitee_id: userId },
                { isDeleted: false },
            ],
        };

        const invitations = await InvitationModel.find(query)
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

    // Lấy lời mời theo ID
    static async getInvitationById(userId: string, invitationId: string): Promise<InvitationInterface> {
        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            throw new HttpError('Invalid invitation ID format', 400, 'INVALID_INVITATION_ID');
        }

        const invitation = await InvitationModel.findOne({ _id: invitationId, isDeleted: false });
        if (!invitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        // Chỉ cho phép invitor hoặc invitee xem lời mời
        if (
            invitation.invitor_id.toString() !== userId &&
            invitation.invitee_id.toString() !== userId
        ) {
            throw new HttpError('Access denied to this invitation', 403, 'ACCESS_DENIED');
        }

        return invitation;
    }

    // Xóa lời mời (soft delete)
    static async deleteInvitation(userId: string, invitationId: string): Promise<InvitationInterface> {
        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            throw new HttpError('Invalid invitation ID format', 400, 'INVALID_INVITATION_ID');
        }

        const invitation = await InvitationModel.findOne({ _id: invitationId, isDeleted: false });
        if (!invitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        // Chỉ invitor (organizer) được xóa lời mời
        if (invitation.invitor_id.toString() !== userId) {
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

    // Tạo RSVP (phản hồi lời mời)
    static async createRSVP(
        userId: string,
        invitationId: string,
        input: CreateRSVPInput
    ): Promise<RSVPInterface> {
        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            throw new HttpError('Invalid invitation ID format', 400, 'INVALID_INVITATION_ID');
        }

        // Kiểm tra lời mời tồn tại
        const invitation = await InvitationModel.findOne({ _id: invitationId, isDeleted: false });
        if (!invitation) {
            throw new HttpError('Invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        // Chỉ invitee được phản hồi
        if (invitation.invitee_id.toString() !== userId) {
            throw new HttpError('Only the invitee can respond to this invitation', 403, 'FORBIDDEN');
        }

        // Kiểm tra xem đã có RSVP chưa
        const existingRSVP = await RSVPModel.findOne({ invitation_id: invitationId, isDeleted: false });
        if (existingRSVP) {
            throw new HttpError('RSVP already exists for this invitation', 400, 'RSVP_EXISTS');
        }

        try {
            const rsvp = await RSVPModel.create({
                invitation_id: invitationId,
                response: input.response,
                responded_at: new Date(),
            });
            return rsvp;
        } catch (err) {
            throw new HttpError('Failed to create RSVP', 500, 'CREATE_RSVP_FAILED');
        }
    }

    // Lấy danh sách RSVP của user
    static async getRSVPs(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc'
    ): Promise<RSVPListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        // Lấy danh sách RSVP của user (dựa trên invitation mà user là invitee)
        const invitations = await InvitationModel.find({ invitee_id: userId, isDeleted: false });
        const invitationIds = invitations.map((inv) => inv._id);

        const query = {
            $and: [
                { invitation_id: { $in: invitationIds } },
                { isDeleted: false },
            ],
        };

        const rsvps = await RSVPModel.find(query)
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalRSVP = await RSVPModel.countDocuments(query);

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

    // Lấy RSVP theo ID
    static async getRSVPById(userId: string, rsvpId: string): Promise<RSVPInterface> {
        if (!mongoose.Types.ObjectId.isValid(rsvpId)) {
            throw new HttpError('Invalid RSVP ID format', 400, 'INVALID_RSVP_ID');
        }

        const rsvp = await RSVPModel.findOne({ _id: rsvpId, isDeleted: false });
        if (!rsvp) {
            throw new HttpError('RSVP not found', 404, 'NOT_FOUND_RSVP');
        }

        // Kiểm tra quyền truy cập: Chỉ invitor hoặc invitee của invitation liên quan được xem RSVP
        const invitation = await InvitationModel.findById(rsvp.invitation_id);
        if (!invitation) {
            throw new HttpError('Associated invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        if (
            invitation.invitor_id.toString() !== userId &&
            invitation.invitee_id.toString() !== userId
        ) {
            throw new HttpError('Access denied to this RSVP', 403, 'ACCESS_DENIED');
        }

        return rsvp;
    }

    // Xóa RSVP (soft delete)
    static async deleteRSVP(userId: string, rsvpId: string): Promise<RSVPInterface> {
        if (!mongoose.Types.ObjectId.isValid(rsvpId)) {
            throw new HttpError('Invalid RSVP ID format', 400, 'INVALID_RSVP_ID');
        }

        const rsvp = await RSVPModel.findOne({ _id: rsvpId, isDeleted: false });
        if (!rsvp) {
            throw new HttpError('RSVP not found', 404, 'NOT_FOUND_RSVP');
        }

        // Kiểm tra quyền: Chỉ invitee được xóa RSVP của họ
        const invitation = await InvitationModel.findById(rsvp.invitation_id);
        if (!invitation) {
            throw new HttpError('Associated invitation not found', 404, 'NOT_FOUND_INVITATION');
        }

        if (invitation.invitee_id.toString() !== userId) {
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
}