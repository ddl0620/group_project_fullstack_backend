import CookieParser from "cookie-parser";
import express, { Express, Request, Response, urlencoded } from "express";
import { PORT } from "./config/env";
import connectToDB from "./database/mongodb";
import errorMiddleware from "./middlewares/error.middlewares";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import notificationRoutes from "./routes/notification.routes"; // Import notification routes
import discussionPostRoutes from "./routes/discussionPost.routes";
import discussionReplyRoutes from "./routes/discussionReply.routes";
import http from "http"; // Import HTTP server
import invitationRoutes from "./routes/invitation.routes"; // Import Socket.IO instance setter
import imageDiscussionRoutes from "./routes/imageDiscussion.routes";

const app: Express = express();
const server = http.createServer(app); // Tạo HTTP server

// Middleware
app.use(urlencoded({ extended: false }));
app.use(express.static('public'));
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
app.use("/api/v1/invitation", invitationRoutes);
app.use("/api/v1/notification", notificationRoutes)
app.use("/api/v1/discussion-posts", discussionPostRoutes);
app.use("/api/v1/discussion-replies", discussionReplyRoutes);
app.use("/api/v1/images", imageDiscussionRoutes);

app.use(errorMiddleware);

// Root Route
app.get("/", (_req: Request, res: Response): void => {
    res.send("This is the backend of group project: Full Stack\n");
});

// Start server
server.listen(PORT, async (): Promise<void> => {
    await connectToDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

export default app;
