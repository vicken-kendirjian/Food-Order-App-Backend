import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { VendorPayload } from '../dto';
import { APP_SECRET } from '../config';
import { AuthPayload } from '../dto/Auth.dto';
import {Request, Response, NextFunction} from 'express';


export const GenerateSalt = async () => {
    return await bcrypt.genSalt()
}

export const GeneratePassword = async (password: string, salt: string) => {
    return  bcrypt.hash(password, salt);
}

export const ValidatePassword = async(password:string, savedPassword: string, salt: string) => {

    return await GeneratePassword(password, salt) === savedPassword;
}


export const GenerateSignature = (payload: AuthPayload) => {

    return jwt.sign(payload, APP_SECRET, { expiresIn: '1d'})
    
}


export const ValdiateSignature = async (req: Request) => {

    const signature = req.get('Authorization');

    if(signature){
        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET) as AuthPayload;
        req.user = payload;
        return true;
    }
    return false;
}