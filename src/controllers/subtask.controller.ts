import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db from '../sequelize-client';
import { MyUserRequest } from './user.controller';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages.constant";
import redisClient from '../utils/redis-client';

export const createSubTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const { title, description, statusId, taskId, dueDate } = req.body;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER);
    };

    try {
        const task = await db.Task.findByPk(taskId);
        if (!task) {
            throw new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND);
        }

        const status = db.Status.findByPk(statusId);
        if (!status) {
            throw new ApiError(400, ERROR_MESSAGES.INVALID_STATUS_ID);
        }

        const newSubTask = await db.SubTask.create({
            title,
            description,
            statusId,
            taskId,
            dueDate
        });

        const response = new ApiResponse(201, newSubTask, SUCCESS_MESSAGES.SUBTASK_CREATED);
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const taskId = req.params.id;
    const { statusId } = req.body;

    try {
        const task = await db.Task.findByPk(taskId);
        if (!task) {
            return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
        }

        const status = await db.Status.findByPk(statusId);
        if (!status) {
            return next(new ApiError(400, ERROR_MESSAGES.INVALID_STATUS_ID));
        };

        task.statusId = statusId;
        await task.save();

        await redisClient.del('tasks_by_status');

        const response = new ApiResponse(200, task, SUCCESS_MESSAGES.TASK_STATUS_UPDATED);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const updateTaskDueDate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const taskId = req.params.id;
    const { dueDate } = req.body;

    try {
        const task = await db.Task.findByPk(taskId);
        if (!task) {
            throw new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND);
        };

        task.dueDate = new Date(dueDate);
        await task.save();

        const response = new ApiResponse(200, task, SUCCESS_MESSAGES.TASK_DUE_DATE_UPDATED);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
})