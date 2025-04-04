import {Router} from "express";
import {UserController} from "../controllers/user.controllers";
import {authenticationToken} from "../middlewares/auth.middleware";
import {onlySelf} from "../middlewares/oneUser.middleware";

const userRoutes = Router();
const controller = new UserController();

userRoutes.get("/me", authenticationToken, controller.me);
userRoutes.put("/:id", authenticationToken, onlySelf, controller.updateInfor);


export default userRoutes;