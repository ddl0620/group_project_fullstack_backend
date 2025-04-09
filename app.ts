import CookieParser from "cookie-parser";
import express, { Express, Request, Response, urlencoded } from "express";
import { PORT } from "./config/env";
import connectToDB from "./database/mongodb";
import errorMiddleware from "./middlewares/error.middlewares";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import discussionRoutes from "./routes/discussion.routes";
import http from "http";
import { Server } from "socket.io";
import { setSocketIOInstance } from "./controllers/discussion.controller";

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (adjust for production)
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(urlencoded({ extended: false }));
app.use(errorMiddleware);
app.use(CookieParser());
app.use(express.json());
app.use(
    cors({
        origin: "*", // Allow requests from the frontend
        methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
    })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/discussions", discussionRoutes);

// Set the Socket.IO instance in the discussion controller
setSocketIOInstance(io);

// WebSocket Connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for joining a chat room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Listen for leaving a chat room
    socket.on("leaveRoom", (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
    });

    // Listen for new messages and broadcast them to the room
    socket.on("sendMessage", (message) => {
        const { eventId, content, senderId } = message;
        console.log(`New message in room ${eventId}:`, content);

        // Broadcast the message to the room
        io.to(eventId).emit("newMessage", {
            eventId,
            senderId,
            content,
            send_at: new Date(),
        });
    });

    // Disconnect event
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// Root Route
app.get("/", (_req: Request, res: Response): void => {
    res.send("This is the backend of group project: Full Stack\n");
});

// Start the server
server.listen(PORT, async (): Promise<void> => {
    await connectToDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

export default app;
