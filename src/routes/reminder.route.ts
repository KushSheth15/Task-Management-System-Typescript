import { Router } from 'express';

import { REMINDER_ROUTES } from '../constants/api.constant';
import {
  createReminder,
  updateReminder,
} from '../controllers/reminder.controller';
import { authorizeRole } from '../middlewares/authorization.middleware';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(
  REMINDER_ROUTES.CREATE_REMINDER,
  verifyToken,
  authorizeRole(['ADMIN']),
  createReminder,
);

router.put(
  REMINDER_ROUTES.UPDATE_REMINDER,
  verifyToken,
  authorizeRole(['ADMIN']),
  updateReminder,
);

export default router;
