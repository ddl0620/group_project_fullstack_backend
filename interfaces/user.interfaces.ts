import { Document } from "mongoose";
import { USER_TYPE } from "../enums/userType.enums";

export interface UserInterface extends Document {
    avatar?: string;
    name: string;
    email: string;
    dob: Date;
    gender: boolean;
    password: string;
    role: USER_TYPE;
    createdAt: Date;
    updatedAt: Date;
}
