import rateLimit from "express-rate-limit";

export const registerUserLimit = rateLimit({
    windowMs:10*60*1000,
    max:5,
    message:'Too many registration attempts from this IP, please try again later.'
})

export const loginUserLimit = rateLimit({
    windowMs:10*60*1000,
    max:5,
    message:'Too many login attempts from this IP, please try again later.'
});