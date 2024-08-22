import { Router } from "express";
import { createTask,deleteTask,getAllTasks,getTaskById,updateTask,shareTask } from "../controllers/task.controller";
import { verifyToken } from "../middlewares/jwt.middleware";
import {authorizeRole} from "../middlewares/authorization.middleware";

const router = Router();

router.post('/create-task',verifyToken,authorizeRole(['ADMIN']), createTask);

router.get('/get-tasks', verifyToken, authorizeRole(['ADMIN', 'USER']), getAllTasks);

router.get('/get-task/:id',verifyToken,getTaskById);

router.put('/update-task/:id',verifyToken,authorizeRole(['ADMIN']),updateTask);

router.delete('/delete-task/:id',verifyToken,authorizeRole(['ADMIN']),deleteTask);

router.post('/shared-task',verifyToken,authorizeRole(['ADMIN']),shareTask);

export default router;