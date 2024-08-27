import { Response, NextFunction } from 'express';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../constants/messages.constant';
import db from '../sequelize-client';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import { sendEmail } from '../utils/mailer';

import { MyUserRequest } from './user.controller';

export const createReminder = asyncHandler(
  async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const { taskId, reminderDate } = req.body;
    const user = req.user;

    if (!user) {
      throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER);
    }

    if (!taskId || isNaN(Number(taskId))) {
      return next(
        new ApiError(400, ERROR_MESSAGES.INVALID_TASK_ID_FORMAT),
      );
    }

    if (!reminderDate || isNaN(Date.parse(reminderDate))) {
      return next(
        new ApiError(400, ERROR_MESSAGES.INVALID_REMINDER_DATE),
      );
    }

    try {
      const task = await db.Task.findByPk(taskId, {
        include: [
          {
            model: db.TaskShare,
            as: 'sharedUsers',
            include: [
              {
                model: db.User,
                as: 'user',
                attributes: ['email'],
              },
            ],
          },
        ],
      });

      if (!task) {
        throw new ApiError(400, ERROR_MESSAGES.INVALID_TASK_ID_FORMAT);
      }

      const newReminder = await db.Reminder.create({
        taskId,
        reminderDate,
      });

      const emailOptions = {
        to: [] as string[],
        subject: 'Reminder Created',
        text: `A reminder has been set for your task "${task.title}". Due date: ${task.dueDate}.`,
      };

      // Add shared users' emails
      if (task.sharedUsers) {
        for (const taskShare of task.sharedUsers) {
          if (taskShare.user) {
            emailOptions.to.push(taskShare.user.email);
          }
        }
      }

      // Remove duplicate emails
      emailOptions.to = [...new Set(emailOptions.to)];

      // Send email notifications
      if (emailOptions.to.length > 0) {
        await sendEmail({
          to: emailOptions.to.join(', '),
          subject: emailOptions.subject,
          text: emailOptions.text,
        });
      }

      const response = new ApiResponse(
        201,
        newReminder,
        SUCCESS_MESSAGES.REMINDER_CREATED,
      );
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [
          error,
        ]),
      );
    }
  },
);

export const updateReminder = asyncHandler(
  async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { taskId, reminderDate } = req.body;
    const user = req.user;

    if (!user) {
      return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    if (reminderDate && isNaN(Date.parse(reminderDate))) {
      return next(
        new ApiError(400, ERROR_MESSAGES.INVALID_REMINDER_DATE),
      );
    }

    try {
      const reminder = await db.Reminder.findByPk(id);
      if (!reminder) {
        return next(
          new ApiError(404, ERROR_MESSAGES.REMINDER_NOT_FOUND),
        );
      }

      await reminder.update({
        taskId,
        reminderDate,
      });

      const task = await db.Task.findByPk(taskId, {
        include: [
          {
            model: db.User,
            as: 'user',
          },
          {
            model: db.TaskShare,
            as: 'sharedUsers',
            include: [
              {
                model: db.User,
                as: 'user',
                attributes: ['email'],
              },
            ],
          },
        ],
      });

      if (!task) {
        throw new ApiError(400, ERROR_MESSAGES.INVALID_TASK_ID_FORMAT);
      }

      const emailOptions = {
        to: [] as string[],
        subject: 'Reminder Updated',
        text: `The reminder for your task "${task.title}" has been updated. Due date: ${task.dueDate}.`,
      };

      // Add shared users' emails
      if (task.sharedUsers) {
        for (const taskShare of task.sharedUsers) {
          if (taskShare.user) {
            emailOptions.to.push(taskShare.user.email);
          }
        }
      }

      // Remove duplicate emails
      emailOptions.to = [...new Set(emailOptions.to)];

      // Send email notifications
      if (emailOptions.to.length > 0) {
        await sendEmail({
          to: emailOptions.to.join(', '),
          subject: emailOptions.subject,
          text: emailOptions.text,
        });
      }

      const response = new ApiResponse(
        200,
        reminder,
        SUCCESS_MESSAGES.REMINDER_UPDATED,
      );
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [
          error,
        ]),
      );
    }
  },
);
