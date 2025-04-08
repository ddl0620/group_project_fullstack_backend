import { Router } from "express";
import { EventController } from "../controllers/event.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";

const eventRoutes = Router();
const event = new EventController();

eventRoutes.post("/add-event", authenticationToken, event.addEvent);
eventRoutes.get("/all-event", authenticationToken, event.getEvent);
eventRoutes.get("/:id", authenticationToken, event.getEventById);
eventRoutes.put("/:id", authenticationToken, event.updateEvent);
eventRoutes.delete("/:id", authenticationToken, event.deleteEvent);

export default eventRoutes;
