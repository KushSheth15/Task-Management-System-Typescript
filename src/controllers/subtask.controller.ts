import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db from '../sequelize-client';
import { MyUserRequest } from './user.controller';

export const createSubTask = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const {title,description,statusId,taskId,dueDate} = req.body;
    const user = req.user;
    if(!user){
        throw new ApiError(401,'Unauthorized - User not found.');
    };

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task){
            throw new ApiError(404,'Task not found.');
        }

        const status = db.Status.findByPk(statusId);
        if(!status){
            throw new ApiError(400, 'Invalid status ID');
        }

        const newSubTask = await db.SubTask.create({
            title,
            description,
            statusId,
            taskId,
            dueDate
        });

        const response = new ApiResponse(201,newSubTask,"SubTask Created Successfully");
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,"Internal Server Error",[error]));
    }
});

export const updateTaskStatus = asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const {statusId} = req.body;

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task){
            return next(new ApiError(404,"Task not found"));
        }

        const status = await db.Status.findByPk(statusId);
        if(!status){
            return next(new ApiError(400,"Invalid status ID"));
        };

        task.statusId = statusId;
        await task.save();

        res.status(200).json({task});
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Internal Server Error', [error]));
    }
});

export const updateTaskDueDate = asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const {dueDate} = req.body;

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task) {
            throw new ApiError(404, 'Task not found');
        };

        task.dueDate = new Date(dueDate);
        await task.save();

        res.status(200).json({ message: 'Due date updated successfully', task });
    } catch (error) {
        console.error(error);
        next(new ApiError(500, 'Internal Server Error', [error]));
    }
})