import { Router } from "express";
import userRoutes from "./user.route";
import taskRoutes from "./task.route";
import subtaskRoutes from './subtask.route';

const router = Router();

router.use("/users", userRoutes);
router.use("/task", taskRoutes);
router.use("/subtask", subtaskRoutes);

export default router;