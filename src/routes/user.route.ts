import { Router } from "express";
import { registerUser,loginUser,logoutUser } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/jwt.middleware";
import validate from "../middlewares/validate.middleware";
import {USER_ROUTES} from "../constants/api.constant";
import { registerSchema,loginSchema } from "../validators/user.validators";

const router = Router();

router.post(USER_ROUTES.REGISTER, validate(registerSchema), registerUser);

router.post(USER_ROUTES.LOGIN,validate(loginSchema),loginUser);

router.post(USER_ROUTES.LOGOUT,verifyToken,logoutUser);

export default router;