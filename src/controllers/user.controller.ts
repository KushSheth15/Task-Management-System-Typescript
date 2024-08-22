import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db from '../sequelize-client';

import User from '../models/user.model';
import { Op } from 'sequelize';
import { generateAccessToken } from '../utils/jwt-tokens';
import { generateRefreshToken } from '../utils/jwt-tokens';
import encryption from '../utils/encryption';

export interface MyUserRequest extends Request{
    token?: string;
    user?: User;
}

export const registerUser = asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{
    const {userName,email,password} = req.body;

    if(!userName || !email || !password){
        return next(new ApiError(400,"All Fields are required"));
    }

    try {

        const existingUser = await db.User.findOne({
            where:{
                [Op.or]:[{email,userName}]
            }
        });

        if (existingUser) {
            return next(new ApiError(400, "Email or Username already exists"));
        }

        const newUser = await db.User.create({
            userName,
            email,
            password
        });

        const response = new ApiResponse(201,newUser,"User Registered successfully");
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,"Internal Server Error",[error]));
    }
});

export const loginUser = asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{
    const {email,password} = req.body;

    if(!email ||!password){
        return next(new ApiError(400,"Email and Password are required"));
    };

    try {
        const user = await db.User.findOne({where:{email}});
        if(!user){
            return next(new ApiError(404,"User not found"));
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return next(new ApiError(401,"Invalid Credentials"));
        };

        const accessToken = generateAccessToken({userId:user.id,email:user.email});

        let refreshTokenRecord = await db.AccessToken.findOne({
            where:{
                userId:user.id,
                tokenType:'REFRESH'
            }
        });

        let refreshToken: string;

        if(!refreshTokenRecord){
            refreshToken = generateRefreshToken({userId:user.id,email:user.email});
            const encryptedRefreshToken = encryption.encryptWithAES(refreshToken);

            refreshTokenRecord = await db.AccessToken.create({
                tokenType: 'REFRESH',
                token: encryptedRefreshToken,
                userId: user.id,
                expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              });
        }else{
            refreshToken = encryption.decryptWithAES(refreshTokenRecord.token);
        }
        
        const encryptedAccessToken = encryption.encryptWithAES(accessToken);
        
        await db.AccessToken.create({
            tokenType:'ACCESS',
            token: encryptedAccessToken,
            userId: user.id,
            expiredAt: new Date(Date.now() + 60 * 60 * 1000), 
        });

        const response = new ApiResponse(201,{
            accessToken,
            refreshToken,
            user,
        },"User Login Sucessfully");

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,"Internal Server Error",[error]));
    }
});

export const logoutUser = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const token = req.token;
    if(!token){
        return next(new ApiError(401,"Unauthorized-Token not found"));
    }

    try {
        const deletedToken = await db.AccessToken.destroy({
            where:{token:encryption.encryptWithAES(token),tokenType:'ACCESS'}
        });

        if(deletedToken===0){
            return next(new ApiError(404,"Token not found"));
        }

        await db.AccessToken.destroy({
            where:{userId:req.user?.id,tokenType:'REFRESH'}
        });

        const response = new ApiResponse(200,null,"User Logout Successfully");
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,"Internal Server Error",[error]));
    }
})