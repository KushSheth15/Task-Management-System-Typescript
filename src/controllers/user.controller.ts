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
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from "../constants/messages.constant";


export interface MyUserRequest extends Request{
    token?: string;
    user?: User;
}

export const registerUser = asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{
    const {userName,email,password} = req.body;

    if(!userName || !email || !password){
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }

    try {

        const existingUser = await db.User.findOne({
            where:{
                [Op.or]:[{email,userName}]
            }
        });

        if (existingUser) {
            return next(new ApiError(400, ERROR_MESSAGES.EMAIL_OR_USERNAME_EXISTS));
        }

        const newUser = await db.User.create({
            userName,
            email,
            password
        });

        const response = new ApiResponse(201,newUser,SUCCESS_MESSAGES.USER_REGISTERED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const loginUser = asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{
    const {email,password} = req.body;

    if(!email ||!password){
        return next(new ApiError(400,ERROR_MESSAGES.EMAIL_AND_PASSWORD_REQUIRED));
    };

    try {
        const user = await db.User.findOne({where:{email}});
        if(!user){
            return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND));
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return next(new ApiError(401,ERROR_MESSAGES.INVALID_CREDENTIALS));
        };


        const accessToken = generateAccessToken({userId:user.id,email:user.email});
        const encryptedAccessToken = encryption.encryptWithAES(accessToken);

        const existingAccessToken = await db.AccessToken.findOne({
            where: {
                userId: user.id,
                tokenType: 'ACCESS'
            }
        });

        if (existingAccessToken) {
            // If an old access token exists, delete it
            await db.AccessToken.destroy({
                where: {
                    id: existingAccessToken.id
                }
            });
        }

        await db.AccessToken.create({
            tokenType:'ACCESS',
            token: encryptedAccessToken,
            userId: user.id,
            expiredAt: new Date(Date.now() + 60 * 60 * 1000), 
        });

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

        const response = new ApiResponse(201,{
            accessToken,
            refreshToken,
            user,
        },SUCCESS_MESSAGES.USER_LOGIN_SUCCESSFULLY);

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
});

export const logoutUser = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const token = req.token;
    if(!token){
        return next(new ApiError(401,ERROR_MESSAGES.UNAUTHORIZED_TOKEN_NOT_FOUND));
    }

    try {
        const deletedToken = await db.AccessToken.destroy({
            where:{token:encryption.encryptWithAES(token),tokenType:'ACCESS'}
        });

        if(deletedToken===0){
            return next(new ApiError(404,ERROR_MESSAGES.TOKEN_NOT_FOUND));
        }

        await db.AccessToken.destroy({
            where:{userId:req.user?.id,tokenType:'REFRESH'}
        });

        const response = new ApiResponse(200,null,SUCCESS_MESSAGES.USER_LOGOUT_SUCCESSFULLY);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
})