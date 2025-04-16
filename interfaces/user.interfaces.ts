import { Document } from 'mongoose';

export interface UserInterface extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;

    //Note: no need to declare methods in UserInterface, CRUD in UserServices
}