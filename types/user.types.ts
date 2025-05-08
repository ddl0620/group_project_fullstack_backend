import { UserInterface } from '../interfaces/user.interfaces';

export type UpdatePasswordInput = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export type UpdateUserInput = {
    name?: string;
    email?: string;
    dateOfBirth?: Date;
    password?: string;
    role?: string;
    maxEventCreate?: number;
    maxParticipantPerEvent?: number;
    isDeleted?: boolean;
};

export type UserListResponse = {
    users: UserInterface[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalUsers: number;
    };
};
