import mongoose from "mongoose";
import {DB_URI} from "../config/env";

if(!DB_URI){
    throw new Error("Please add a MongoDB URI to .env file");
}

const connectToDB = async (): Promise<void> => {
    try {
        await mongoose.connect(DB_URI as string);
        console.log("✅ Successfully connected to database");
    } catch (e) {
        //log
        console.error("❌ Error connecting to database:", e);
        process.exit(1);
    }
}

export default connectToDB;