import {Router} from "express";
import {UserController} from "../controllers/user.controllers";
import {authenticationToken} from "../middlewares/auth.middleware";

const userRoutes = Router();
const controller = new UserController();

userRoutes.get("/me", authenticationToken, controller.me);


export default userRoutes;