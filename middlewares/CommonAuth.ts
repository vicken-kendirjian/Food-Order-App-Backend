import { AuthPayload } from "../dto";
import {Request, Response, NextFunction} from 'express';
import { ValdiateSignature } from "../utility";


declare global{
    namespace Express{
        interface Request{
            user?:AuthPayload
        }
    }
}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const validate = await ValdiateSignature(req);

    if(validate){
        next();
    }else{
        return res.json({"message":"User not authorized."})
    }
}


  