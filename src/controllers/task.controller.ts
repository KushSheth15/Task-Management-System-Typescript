import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db from '../sequelize-client';
// import User from '../models/user.model';
import { MyUserRequest } from './user.controller';


export const createTask = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const {title,description,statusId,dueDate} = req.body;
    const user = req.user;

    if(!user){
        return next(new ApiError(401,'Unauthorized - User not found.'));
    }

    try {
        const status = await db.Status.findOne({ where:{ id:statusId } })
        if(!status){
            return next(new ApiError(400,"Invalid status ID"));
        };

        const newTask = await db.Task.create({
            title,
            description,
            statusId:status.id,
            userId: user.id,
            dueDate
        });

        const response = new ApiResponse(201,newTask,"Task created successfully");
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,"Internal Server Error",[error]));
    }
});

export const getAllTasks = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    if(!user){
        return next(new ApiError(401,'Unauthorized - User not found.'));
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
            return next(new ApiError(404,"No tasks found"));
        }

        const response = new ApiResponse(200,getTask,"Tasks retrieved successfully");
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,"Internal Server Error",[error]));
    }
});

export const getTaskById = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const user = req.user;

    if(!user){
        return next(new ApiError(401,'Unauthorized - User not found.'));
    }

    try {
        const getTask = await db.Task.findOne({
            where:{id:taskId},
            attributes: ['id', 'title', 'description', 'dueDate'],
            include:[
                {model:db.Status,attributes:['status']}
            ]
        });

        const response = new ApiResponse(200,getTask,"Tasks retrieved successfully");
        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Internal Server Error", [error]));
    }
});

export const updateTask = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const user = req.user;
    if(!user){
        return next(new ApiError(401,'Unauthorized - User not found.'));
    }
    const {title,description,statusId,dueDate} = req.body;

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task){
            return next(new ApiError(404,"Task not found"));
        };

        if(task.userId !== user.id){
            return next(new ApiError(403,"Forbidden - You are not authorized to update this task"));
        };

        const status = await db.Status.findByPk(statusId);
        if (!status) {
            return next(new ApiError(400, "Invalid status ID"));
        }

        const updateTask = await task.update({
            title,
            description,
            statusId,
            dueDate
        });

        const response = new ApiResponse(200,updateTask,"Task updated successfully");
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,"Internal Server Error",[error]));
    }
});

export const deleteTask = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const taskId = req.params.id;
    const user = req.user;
    if(!user){
        return next(new ApiError(401,'Unauthorized - User not found.'));
    }

    try {
        const task = await db.Task.findByPk(taskId);
        if(!task){
            return next(new ApiError(404,"Task not found"));
        }

        if(task.userId!== user.id){
            return next(new ApiError(403,"Forbidden - You are not authorized to delete this task"));
        }

        await task.destroy();
        const response = new ApiResponse(200,null,"Task deleted successfully");
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,"Internal Server Error",[error]));
    }
})