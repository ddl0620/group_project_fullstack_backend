import { Server } from "socket.io";
import { NotificationInterface } from "./interfaces/notification.interfaces";

const io = new Server({
    cors: {
        origin: "*", // Adjust this to your frontend's origin
    },
});

// Store connected users and their socket IDs
const connectedUsers: Map<string, string> = new Map();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Authenticate the user and store their socket ID
    socket.on("authenticate", (userId: string) => {
        console.log(`User authenticated: ${userId}`);
        connectedUsers.set(userId, socket.id);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
    });
});

// Emit a notification to a specific user
export const sendNotification = (userId: string, notification: NotificationInterface) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit("notification", notification);
    }
};

export default io;