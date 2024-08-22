import { Router } from "express";
import { registerUser,loginUser,logoutUser } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/jwt.middleware";
import validate from "../middlewares/validate.middleware";
import { registerSchema,loginSchema } from "../validators/user.validators";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);

router.post("/login",validate(loginSchema),loginUser);

router.post("/logout",verifyToken,logoutUser);

export default router;