import { Router } from "express";
import { createTask,deleteTask,getAllTasks,getTaskById,updateTask,shareTask,moveTask,getTaskByStatus } from "../controllers/task.controller";
import { verifyToken } from "../middlewares/jwt.middleware";
import {TASK_ROUTES} from "../constants/api.constant";
import {authorizeRole} from "../middlewares/authorization.middleware";

const router = Router();

router.post(TASK_ROUTES.CREATE_TASK,verifyToken,authorizeRole(['ADMIN']), createTask);

router.get(TASK_ROUTES.GET_TASKS, verifyToken, authorizeRole(['ADMIN', 'USER']), getAllTasks);

router.get(TASK_ROUTES.GET_TASK_BY_ID,verifyToken,getTaskById);

router.put(TASK_ROUTES.UPDATE_TASK,verifyToken,authorizeRole(['ADMIN']),updateTask);

router.delete(TASK_ROUTES.DELETE_TASK,verifyToken,authorizeRole(['ADMIN']),deleteTask);

router.post(TASK_ROUTES.SHARE_TASK,verifyToken,authorizeRole(['ADMIN']),shareTask);

router.put(TASK_ROUTES.MOVE_TASK,verifyToken,moveTask);

router.get(TASK_ROUTES.GET_LIST_GROUPED,getTaskByStatus);

export default router;