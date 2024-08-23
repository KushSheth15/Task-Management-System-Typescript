import { Router } from "express";
import { createSubTask,updateTaskStatus,updateTaskDueDate } from "../controllers/subtask.controller";
import { verifyToken } from "../middlewares/jwt.middleware";
import {SUBTASK_ROUTES} from "../constants/api.constant";
import {authorizeRole} from "../middlewares/authorization.middleware";

const router = Router();

router.post(SUBTASK_ROUTES.CREATE_SUBTASK,verifyToken,authorizeRole(['ADMIN']), createSubTask);

router.put(SUBTASK_ROUTES.UPDATE_STATUS,verifyToken,authorizeRole(['ADMIN']), updateTaskStatus);

router.put(SUBTASK_ROUTES.UPDATE_DUE_DATE,verifyToken,authorizeRole(['ADMIN']), updateTaskDueDate);

export default router;