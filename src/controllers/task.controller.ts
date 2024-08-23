import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db from '../sequelize-client';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from "../constants/messages.constant";
import { MyUserRequest } from './user.controller';


export const createTask = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const {title,description,statusId,dueDate} = req.body;
    const user = req.user;

    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    try {
        const status = await db.Status.findOne({ where:{ id:statusId } })
        if(!status){
            return next(new ApiError(400,ERROR_MESSAGES.INVALID_STATUS_ID));
        };

        const newTask = await db.Task.create({
            title,
            description,
            statusId:status.id,
            userId: user.id,
            dueDate
        });

        const response = new ApiResponse(201,newTask,SUCCESS_MESSAGES.TASK_CREATED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const getAllTasks = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    try {
        const getTask = await db.Task.findAll({
            attributes:['title','description','dueDate'],
            include:[
                {model:db.Status,attributes:['status']},
                {model:db.User,attributes:['userName','email','role']}
            ]
        });
        if(getTask.length === 0){
            return next(new ApiError(404,ERROR_MESSAGES.TASK_NOT_FOUND));
        }

        const response = new ApiResponse(200,getTask,SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const getTaskById = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const user = req.user;

    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    try {
        const getTask = await db.Task.findOne({
            where:{id:taskId},
            attributes: ['id', 'title', 'description', 'dueDate'],
            include:[
                {model:db.Status,attributes:['status']}
            ]
        });

        const response = new ApiResponse(200,getTask,SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY);
        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const updateTask = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const user = req.user;
    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.UNAUTHORIZED_USER));
    }
    const {title,description,statusId,dueDate} = req.body;

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task){
            return next(new ApiError(404,ERROR_MESSAGES.TASK_NOT_FOUND));
        };

        if(task.userId !== user.id){
            return next(new ApiError(403,ERROR_MESSAGES.FORBIDDEN_UPDATE));
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

        const response = new ApiResponse(200,updateTask,SUCCESS_MESSAGES.TASK_UPDATED_SUCCESSFULLY);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const deleteTask = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const user = req.user;
    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task){
            return next(new ApiError(404,ERROR_MESSAGES.TASK_NOT_FOUND));
        }

        if(task.userId!== user.id){
            return next(new ApiError(403,ERROR_MESSAGES.FORBIDDEN_DELETE));
        }

        await task.destroy();
        const response = new ApiResponse(200,null,SUCCESS_MESSAGES.TASK_DELETED_SUCCESSFULLY);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const shareTask = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction) => {
    const {taskId,userId} = req.body;
    const user = req.user;

    if(!user){
        throw new ApiError(401,ERROR_MESSAGES.UNAUTHORIZED_USER);
    }

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task){
            throw new ApiError(404,ERROR_MESSAGES.TASK_NOT_FOUND);
        }

        const targetUser = await db.User.findByPk(userId);
        if(!targetUser){
            throw new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND);
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
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const moveTask = asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const {statusId} = req.body;

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task) {
            throw new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND);
        };

        const status = await db.Status.findByPk(statusId);
        if(!status) {
            throw new ApiError(400, ERROR_MESSAGES.INVALID_STATUS_ID);
        };

        await task.update({statusId});
        res.json(new ApiResponse(200,task,SUCCESS_MESSAGES.TASK_MOVED_SUCCESSFULLY));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const getTaskByStatus = asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{

    try {
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

         res.json(new ApiResponse(200, groupedTasks,SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
})