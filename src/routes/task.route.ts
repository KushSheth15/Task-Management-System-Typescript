import { Router } from 'express';

import { TASK_ROUTES } from '../constants/api.constant';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
  shareTask,
  moveTask,
  getTaskByStatus,
  getFilteredTasks,
  bulkCreateTasks,
  bulkAssignTask,
  bulkDeleteTasks,
} from '../controllers/task.controller';
import { authorizeRole } from '../middlewares/authorization.middleware';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(
  TASK_ROUTES.CREATE_TASK,
  verifyToken,
  authorizeRole(['ADMIN']),
  createTask,
);

router.get(TASK_ROUTES.GET_TASKS, verifyToken, getAllTasks);

router.get(TASK_ROUTES.GET_TASK_BY_ID, verifyToken, getTaskById);

router.put(
  TASK_ROUTES.UPDATE_TASK,
  verifyToken,
  authorizeRole(['ADMIN']),
  updateTask,
);

router.delete(
  TASK_ROUTES.DELETE_TASK,
  verifyToken,
  authorizeRole(['ADMIN']),
  deleteTask,
);

router.post(
  TASK_ROUTES.SHARE_TASK,
  verifyToken,
  authorizeRole(['ADMIN']),
  shareTask,
);

router.put(TASK_ROUTES.MOVE_TASK, verifyToken, moveTask);

router.get(TASK_ROUTES.GET_LIST_GROUPED, getTaskByStatus);

router.get(TASK_ROUTES.FILTER_TASK, getFilteredTasks);

router.post(
  TASK_ROUTES.CREATE_BULK_TASK,
  verifyToken,
  authorizeRole(['ADMIN']),
  bulkCreateTasks,
);

router.post(
  TASK_ROUTES.ASSIGN_BULK_TASK,
  verifyToken,
  authorizeRole(['ADMIN']),
  bulkAssignTask,
);

router.delete(
  TASK_ROUTES.DELETE_BULK_TASK,
  verifyToken,
  authorizeRole(['ADMIN']),
  bulkDeleteTasks,
);

export default router;
