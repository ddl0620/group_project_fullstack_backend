import {Router} from "express";
import {AuthControllers} from "../controllers/auth.controllers";
import {EventController} from "../controllers/event.controllers";

const eventRoutes = Router();
const auth = new EventController();

eventRoutes.get("/all", auth.events);
// eventRoutes.get("//events/:id", auth.signUp);
// authRoutes.post("/sign-out", auth.signOut);

export default eventRoutes;