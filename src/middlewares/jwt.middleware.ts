/* eslint-disable security/detect-possible-timing-attacks */
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config/config';
import {
  ERROR_MESSAGES,
} from '../constants/messages.constant';
import User from '../models/user.model';
import db from '../sequelize-client';
import ApiError from '../utils/api-error';
import asyncHandler from '../utils/async-handler';
import encryption from '../utils/encryption';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
}

export const verifyToken = asyncHandler(
  async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(
        new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_TOKEN_NOT_FOUND),
      );
    }

    try {
      const decoded = jwt.verify(token, config.JWT.SECRET as string) as {
                userId: string;
            };

      const encryptedToken = await db.AccessToken.findOne({
        where: {
          userId: decoded.userId,
          tokenType: 'ACCESS',
        },
      });

      if (!encryptedToken) {
        return next(
          new ApiError(
            401,
            ERROR_MESSAGES.TOKEN_NOT_FOUND_OR_EXPIRED,
          ),
        );
      }

      const decryptedToken = encryption.decryptWithAES(
        encryptedToken.token,
      );

      if (decryptedToken !== token) {
        return next(new ApiError(401, ERROR_MESSAGES.TOKEN_MISMATCH));
      }

      const user = await db.User.findOne({
        where: { id: decoded.userId },
      });

      if (!user) {
        return next(
          new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER),
        );
      }

      req.token = token;
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      return next(new ApiError(401, ERROR_MESSAGES.INVALID_TOKEN));
    }
  },
);
