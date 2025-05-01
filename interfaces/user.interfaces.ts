import { Document } from 'mongoose';

export interface UserInterface extends Document {
    name: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    role: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;

    //Note: no need to declare methods in UserInterface, CRUD in UserServices
}
