import { Router } from "express";
import { createReminder,updateReminder } from "../controllers/reminder.controller";
import { verifyToken } from "../middlewares/jwt.middleware";
import {REMINDER_ROUTES} from "../constants/api.constant";
import {authorizeRole} from "../middlewares/authorization.middleware";

const router = Router();

router.post(REMINDER_ROUTES.CREATE_REMINDER,verifyToken,authorizeRole(['ADMIN']),createReminder);

router.put(REMINDER_ROUTES.UPDATE_REMINDER,verifyToken,authorizeRole(['ADMIN']),updateReminder);

export default router;