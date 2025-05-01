import { USER_ROLE } from '../enums/role.enum';

export type SignInType = {
    email: string;
    password: string;
};

export type SignUpType = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: USER_ROLE;
    dateOfBirth: Date;
};
