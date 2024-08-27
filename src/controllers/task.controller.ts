import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db from '../sequelize-client';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages.constant";
import { MyUserRequest } from './user.controller';
import { Op } from 'sequelize';
import redisClient from '../utils/redis-client';

export const createTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const { title, description, statusId, dueDate } = req.body;
    const user = req.user;

    if (!user) {
        return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    if (!title || !statusId || !dueDate) {
        return next(new ApiError(400, ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }

    try {
        const status = await db.Status.findOne({ where: { id: statusId } })
        if (!status) {
            return next(new ApiError(400, ERROR_MESSAGES.INVALID_STATUS_ID));
        };

        const newTask = await db.Task.create({
            title,
            description,
            statusId: status.id,
            userId: user.id,
            dueDate
        });

        await redisClient.del('all_tasks');

        const response = new ApiResponse(201, newTask, SUCCESS_MESSAGES.TASK_CREATED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const getAllTasks = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    const cacheKey = 'all_tasks';
    try {

        const cachedTasks = await redisClient.get(cacheKey);

        if (cachedTasks) {
            const tasks = JSON.parse(cachedTasks);
            const response = new ApiResponse(200, tasks, SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY);
            return res.status(200).json(response);
        }
        const getTask = await db.Task.findAll({
            attributes: ['title', 'description', 'dueDate'],
            include: [
                { model: db.Status, attributes: ['status'] },
                { model: db.User, as: 'user', attributes: ['userName', 'email', 'role'] }
            ]
        });
        if (getTask.length === 0) {
            return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
        }

        await redisClient.setex(cacheKey, 3600, JSON.stringify(getTask));

        const response = new ApiResponse(200, getTask, SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY);
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const getTaskById = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const taskId = req.params.id;
    const user = req.user;

    if (!user) {
        return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    if (!taskId) {
        return next(new ApiError(400, ERROR_MESSAGES.TASK_NOT_FOUND));
    }

    try {
        const getTask = await db.Task.findOne({
            where: { id: taskId },
            attributes: ['id', 'title', 'description', 'dueDate'],
            include: [
                { model: db.Status, attributes: ['status'] }
            ]
        });

        const response = new ApiResponse(200, getTask, SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY);
        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const updateTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const taskId = req.params.id;
    const user = req.user;
    if (!user) {
        return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }
    const { title, description, statusId, dueDate } = req.body;

    try {
        const task = await db.Task.findByPk(taskId);
        if (!task) {
            return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
        };

        if (task.userId !== user.id) {
            return next(new ApiError(403, ERROR_MESSAGES.FORBIDDEN_UPDATE));
        };

        const status = await db.Status.findByPk(statusId);
        if (!status) {
            return next(new ApiError(400, ERROR_MESSAGES.INVALID_STATUS_ID));
        }

        const updateTask = await task.update({
            title,
            description,
            statusId,
            dueDate
        });

        await redisClient.del('all_tasks');

        const response = new ApiResponse(200, updateTask, SUCCESS_MESSAGES.TASK_UPDATED_SUCCESSFULLY);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const deleteTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const taskId = req.params.id;
    const user = req.user;
    if (!user) {
        return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    if (!taskId) {
        return next(new ApiError(400, ERROR_MESSAGES.INVALID_TASK_ID));
    }

    try {
        const task = await db.Task.findByPk(taskId);
        if (!task) {
            return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
        }

        if (task.userId !== user.id) {
            return next(new ApiError(403, ERROR_MESSAGES.FORBIDDEN_DELETE));
        }

        await task.destroy();
        const response = new ApiResponse(200, null, SUCCESS_MESSAGES.TASK_DELETED_SUCCESSFULLY);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const shareTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const { taskId, userId } = req.body;
    const user = req.user;

    if (!user) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER);
    }

    try {
        const task = await db.Task.findByPk(taskId);
        if (!task) {
            throw new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND);
        }

        if (!taskId || !userId) {
            return next(new ApiError(400, ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
        }

        const targetUser = await db.User.findByPk(userId);
        if (!targetUser) {
            throw new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const existingShare = await db.TaskShare.findOne({
            where: { taskId, userId }
        });
        if (existingShare) {
            return next(new ApiError(400, ERROR_MESSAGES.TASK_ALREADY_SHARED));
        }

        const taskShare = await db.TaskShare.create({
            taskId,
            userId
        });

        const response = new ApiResponse(201, taskShare, SUCCESS_MESSAGES.TASK_SHARED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const moveTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const taskId = req.params.id;
    const { statusId } = req.body;
    const user = req.user;

    if (!user) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER);
    }

    try {
        const task = await db.Task.findByPk(taskId);
        if (!task) {
            throw new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND);
        };

        const taskAssignment = await db.TaskShare.findOne({
            where: { taskId, userId: user.id }
        });

        if (user.role !== 'ADMIN' && !taskAssignment) {
            throw new ApiError(403, 'Forbidden - User does not have the required role');
        }

        const status = await db.Status.findByPk(statusId);
        if (!status) {
            throw new ApiError(400, ERROR_MESSAGES.INVALID_STATUS_ID);
        };

        await task.update({ statusId });
        res.json(new ApiResponse(200, task, SUCCESS_MESSAGES.TASK_MOVED_SUCCESSFULLY));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const getTaskByStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = 'tasks_by_status';
    try {
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            // Data is cached, send it as the response
            const groupedTasks = JSON.parse(cachedData);
            return res.json(new ApiResponse(200, groupedTasks, SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY));
        }

        const statuses = await db.Status.findAll();

        if (!statuses.length) {
            throw new ApiError(404, ERROR_MESSAGES.NO_STATUSES_FOUND);
        }

        const groupedTasks: { [key: string]: any[] } = {};

        for (const status of statuses) {
            const tasks = await db.Task.findAll({
                where: { statusId: status.id },
                include: [{ model: db.Status, attributes: ['status'] }],
            });

            // Add tasks to the groupedTasks object with status as the key
            groupedTasks[status.status] = tasks;
        }

        await redisClient.setex(cacheKey, 3600, JSON.stringify(groupedTasks));

        res.json(new ApiResponse(200, groupedTasks, SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const getFilteredTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { statusId, dueDate, assigneeId, shared, page = 1, limit = 4, sortBy = 'createdAt', order = "DESC" } = req.query;

        const whereCondition: any = {};
        if (statusId) {
            whereCondition.statusId = statusId;
        }

        if (dueDate) {
            whereCondition.dueDate = { [Op.lte]: new Date(dueDate as string) }
        };

        if (assigneeId) {
            whereCondition.userId = assigneeId;
        }

        if (shared) {
            const sharedUserId = shared as string;

            const sharedTasks = await db.TaskShare.findAll({
                attributes: ['taskId'],
                where: {
                    userId: sharedUserId
                }
            });

            if (sharedTasks.length === 0) {
                return next(new ApiError(404, ERROR_MESSAGES.NO_SHARED_TASKS_FOUND));
            }

            whereCondition.id = {
                [Op.in]: sharedTasks.map((task: any) => task.taskId)
            };
        }

        const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
        const limitValue = parseInt(limit as string, 10);

        const tasks = await db.Task.findAndCountAll({
            where: whereCondition,
            order: [[sortBy as string, order as string]],
            offset: offset,
            limit: limitValue
        });

        res.json({
            tasks: tasks.rows,
            totalPages: Math.ceil(tasks.count / limitValue),
            currentPage: parseInt(page as string, 10),
            totalTasks: tasks.count
        });

    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});


export const bulkCreateTasks = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {

    const user = req.user;

    if (!user) {
        return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    try {
        const tasks = req.body.tasks;

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return next(new ApiError(400, ERROR_MESSAGES.NO_TASK_PROVIDED));
        }

        const tasksWithUserId = tasks.map(task => ({
            ...task,
            userId: user.id
        }));

        const createdTasks = await db.Task.bulkCreate(tasksWithUserId, { returning: true });
        res.json(new ApiResponse(201, createdTasks, SUCCESS_MESSAGES.TASK_CREATED_SUCCESSFULLY))
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const bulkAssignTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    try {
        const { taskAssignment } = req.body;
        if (!Array.isArray(taskAssignment) || taskAssignment.length === 0) {
            return next(new ApiError(400, ERROR_MESSAGES.NO_TASK_ASSIGNMENTS_PROVIDED));
        };

        taskAssignment.forEach((assignment: any) => {
            if (!assignment.taskId || !assignment.userId) {
                throw new ApiError(400, ERROR_MESSAGES.MISSING_TASK_ID_OR_USER_ID);
            }
        });

        await db.TaskShare.bulkCreate(taskAssignment, { returning: true });

        res.status(200).json(new ApiResponse(200, null, SUCCESS_MESSAGES.TASKS_ASSIGNED_SUCCESSFULLY));

    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});

export const bulkDeleteTasks = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    try {
        const { taskIds } = req.body;
        if (!Array.isArray(taskIds) || taskIds.length === 0) {
            return next(new ApiError(400, ERROR_MESSAGES.NO_TASK_PROVIDED));
        }

        const deletedTasks = await db.Task.destroy({
            where: {
                id: taskIds
            }
        });

        if (deletedTasks === 0) {
            return next(new ApiError(404, ERROR_MESSAGES.NO_TASKS_FOUND_TO_DELETE));
        }

        res.status(200).json(new ApiResponse(200, null, SUCCESS_MESSAGES.TASK_DELETED_SUCCESSFULLY));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
})