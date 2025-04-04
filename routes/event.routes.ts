import {Router} from "express";
import {EventController} from "../controllers/event.controllers";

const eventRoutes = Router();
const event = new EventController();

eventRoutes.get("/all", event.events);
// eventRoutes.get("//events/:id", auth.signUp);
// authRoutes.post("/sign-out", auth.signOut);

export default eventRoutes;