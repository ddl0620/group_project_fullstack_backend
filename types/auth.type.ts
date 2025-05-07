import { USER_ROLE } from '../enums/role.enum';
import { UserInterface } from '../interfaces/user.interfaces';

export type SignInType = {
    email: string;
    password: string;
};

export type SignInResponse = {
    user: Partial<UserInterface>;
    token: string;
};

export type SignUpType = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: USER_ROLE;
    dateOfBirth: Date;
};

export type SignUpResponse = {
    user: Partial<UserInterface>;
    token: string;
};
