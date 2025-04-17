import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { InvitationService } from '../services/invitation.service';
import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";

export class InvitationController {
    async createInvitation(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const invitation = await InvitationService.createInvitation(req.user?.userId as string, req.body);

            HttpResponse.sendYES(res, 201, 'Invitation created successfully', { invitation });
        } catch (err) {
            next(err);
        }
    }

    async getInvitations(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await InvitationService.getInvitations(req.user?.userId as string, page, limit, sortBy);

            HttpResponse.sendYES(res, 200, 'Invitations fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getInvitationById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const invitation = await InvitationService.getInvitationById(req.user?.userId as string, req.params.id);

            HttpResponse.sendYES(res, 200, 'Invitation found successfully', { invitation });
        } catch (err) {
            next(err);
        }
    }

    async deleteInvitation(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const deletedInvitation = await InvitationService.deleteInvitation(req.user?.userId as string, req.params.id);

            HttpResponse.sendYES(res, 200, 'Invitation deleted successfully', { invitation: deletedInvitation });
        } catch (err) {
            next(err);
        }
    }

    async createRSVP(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const rsvp = await InvitationService.createRSVP(req.user?.userId as string, req.params.invitationId, req.body);

            HttpResponse.sendYES(res, 201, 'RSVP created successfully', { rsvp });
        } catch (err) {
            next(err);
        }
    }

    async getRSVPs(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await InvitationService.getRSVPs(req.user?.userId as string, page, limit, sortBy);

            HttpResponse.sendYES(res, 200, 'RSVPs fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getRSVPById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const rsvp = await InvitationService.getRSVPById(req.user?.userId as string, req.params.id);

            HttpResponse.sendYES(res, 200, 'RSVP found successfully', { rsvp });
        } catch (err) {
            next(err);
        }
    }

    async deleteRSVP(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const deletedRSVP = await InvitationService.deleteRSVP(req.user?.userId as string, req.params.id);

            HttpResponse.sendYES(res, 200, 'RSVP deleted successfully', { rsvp: deletedRSVP });
        } catch (err) {
            next(err);
        }
    }
}