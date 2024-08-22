import { Router } from "express";
import { createSubTask,updateTaskStatus,updateTaskDueDate } from "../controllers/subtask.controller";
import { verifyToken } from "../middlewares/jwt.middleware";
import {authorizeRole} from "../middlewares/authorization.middleware";

const router = Router();

router.post('/create-subtask',verifyToken,authorizeRole(['ADMIN']), createSubTask);

router.put('/update-status/:id',verifyToken,authorizeRole(['ADMIN']), updateTaskStatus);

router.put('/update-due-date/:id',verifyToken,authorizeRole(['ADMIN']), updateTaskDueDate);

export default router;