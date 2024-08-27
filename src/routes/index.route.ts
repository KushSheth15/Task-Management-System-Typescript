import { Router } from 'express';

import { API_ROUTES } from '../constants/api.constant';

import reminderRoutes from './reminder.route';
import subtaskRoutes from './subtask.route';
import taskRoutes from './task.route';
import userRoutes from './user.route';

const router = Router();

router.use(API_ROUTES.USERS, userRoutes);

router.use(API_ROUTES.TASK, taskRoutes);

router.use(API_ROUTES.SUBTASK, subtaskRoutes);

router.use(API_ROUTES.REMINDER, reminderRoutes);

export default router;
