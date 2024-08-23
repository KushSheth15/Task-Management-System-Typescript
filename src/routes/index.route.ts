import { Router } from "express";
import userRoutes from "./user.route";
import taskRoutes from "./task.route";
import subtaskRoutes from './subtask.route';
import {API_ROUTES} from "../constants/api.constant"

const router = Router();

router.use(API_ROUTES.USERS, userRoutes);

router.use(API_ROUTES.TASK, taskRoutes);

router.use(API_ROUTES.SUBTASK, subtaskRoutes);

export default router;