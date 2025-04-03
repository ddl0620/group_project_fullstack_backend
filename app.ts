
import CookieParser from "cookie-parser";
import express, {Express, Request, Response, urlencoded} from "express";
import {PORT} from "./config/env";
import connectToDB from "./database/mongodb";
import errorMiddleware from "./middlewares/error.middlewares";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
const app: Express = express();

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
// app.use('/api/v1/user', userRoutes);
// app.use('/api/v1/order', orderRoutes);

app.get("/", (_req: Request, res: Response): void => {
    res.send("Hello World! This is the backend of the E-commerce app");
});

app.listen(PORT, async (): Promise<void> => {
    await connectToDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

export default app;
