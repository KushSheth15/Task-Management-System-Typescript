import { Router } from 'express';

import { USER_ROUTES } from '../constants/api.constant';
import {
  registerUser,
  loginUser,
  logoutUser,
} from '../controllers/user.controller';
import { verifyToken } from '../middlewares/jwt.middleware';
import {
  registerUserLimit,
  loginUserLimit,
} from '../middlewares/rate-limit.middleware';
import validate from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../validators/user.validators';

const router = Router();

router.post(
  USER_ROUTES.REGISTER,
  validate(registerSchema),
  registerUserLimit,
  registerUser,
);

router.post(
  USER_ROUTES.LOGIN,
  validate(loginSchema),
  loginUserLimit,
  loginUser,
);

router.post(USER_ROUTES.LOGOUT, verifyToken, logoutUser);

export default router;
