import mongoose, {Document} from "mongoose";
import {NotificationType} from "../enums/notificationType.enums";
import {UserInterface} from "./user.interfaces";
import {EventInterface} from "./event.interfaces";
import {IParticipantStatus} from "./participant.interfaces";

export interface NotificationInterface extends Document {
    // User ID of the recipient
    //
}