
import CookieParser from "cookie-parser";
import express, {Express, Request, Response, urlencoded} from "express";
import {PORT} from "./config/env";
import connectToDB from "./database/mongodb";
import errorMiddleware from "./middlewares/error.middlewares";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
const app: Express = express();

//notification routes
import notificationRoutes from "./routes/notification.routes";

//websocket for notification
import io from "./websocket";
import { createServer } from "http";
const server = createServer(app);
io.attach(server);


app.use(urlencoded({ extended: false }));
app.use(errorMiddleware)
app.use(CookieParser());
app.use(express.json());
app.use(cors({
    origin: "*", // Allow requests from the frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/event', eventRoutes);
app.use('/api/v1/notification', notificationRoutes);
// app.use('/api/v1/order', orderRoutes);

app.get("/", (_req: Request, res: Response): void => {
    res.send("This is the backend of group project: Full Stack\n");
});

app.listen(PORT, async (): Promise<void> => {
    await connectToDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

export default app;
