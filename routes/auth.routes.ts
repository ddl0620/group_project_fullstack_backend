import {Router} from "express";
import {AuthControllers} from "../controllers/auth.controllers";

const authRoutes = Router();
const auth = new AuthControllers();

authRoutes.post("/sign-in", auth.signIn);
authRoutes.post("/sign-up", auth.signUp);
// authRoutes.post("/sign-out", auth.signOut);

export default authRoutes;