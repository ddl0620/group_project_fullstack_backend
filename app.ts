import CookieParser from "cookie-parser";
import express, { Express, Request, Response, urlencoded } from "express";
import { PORT } from "./config/env";
import connectToDB from "./database/mongodb";
import errorMiddleware from "./middlewares/error.middlewares";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import http from "http"; // Import HTTP server

const app: Express = express();
const server = http.createServer(app); // Tạo HTTP server

// Middleware
app.use(urlencoded({ extended: false }));
app.use(express.static('public'));
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
