import {Router} from "express";
import {EventController} from "../controllers/event.controllers";
import {authenticationToken} from "../middlewares/auth.middleware";

const eventRoutes = Router();
const event = new EventController();

eventRoutes.post("/add-event", authenticationToken, event.addEvent);
eventRoutes.get("/all-event", authenticationToken, event.getAllEvent);
eventRoutes.get("/my", authenticationToken, event.getMyEvent);
eventRoutes.post("/:eventId/join", authenticationToken, event.joinEvent);
eventRoutes.post("/:eventId/respond-join", authenticationToken, event.respondEvent);
eventRoutes.get("/:id", authenticationToken, event.getEventById);
eventRoutes.put("/:id", authenticationToken, event.updateEvent);
eventRoutes.delete("/:id", authenticationToken, event.deleteEvent);




// eventRoutes.get("//events/:id", auth.signUp);
// authRoutes.post("/sign-out", auth.signOut);

export default eventRoutes;