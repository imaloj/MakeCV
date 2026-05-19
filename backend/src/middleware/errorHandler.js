import logger from '../utils/logger.js';
import {isDevelopment,isProduction} from '../config/env.js';

export class CustomError extends Error{
    constructor(message,code,statusCode=500,details={}){
        super(message);
        this.code =code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp =new Date().toISOString();

        Error.captureStackTrace(this, this.constructor);
    }
    toJSON(){
        return{
            error:this.code,
            message:this.message,
            statusCode:this.statusCode,
            details:this.details,
            timestamp:this.timestamp
        };
    }
}

export class ValidationError extends CustomError{
    constructor(message,details={}){
        super(message,'VALIDATION_ERROR',400,details);
    }
}

export class ParseError extends CustomError{
    constructor(message,details={}){
        super(message,'PARSE_ERROR',400,details);
    }
}

export class LLMError extends CustomError{
    constructor(message,details={}){
        super(message,'LLM_PROCESSING_ERROR',502,details);
    }
}
export class FileError extends CustomError{
    constructor(message,details={}){
        super(message,'FILE_ERROR',400,details);
    }
}

//Express error handler middleware
export const errorHandler=(err,req,res,next)=>{
    //log the error
    logger.error({
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR',
        statusCode: err.statusCode || 500,
        path: req.path,
        method: req.path,
        ip: req.ip,
        stack: isDevelopment()? err.stack:undefined
    });

    //handle multiple errors
    if(err.code === 'LIMIT_FILE_SIZE'){
        return res.status(400).json({
            error:'FILE_TOO_LARGE',
            message:`File size exceeds maximum allowed`,
            statusCode:400
        });
    }
    
    if(err.code === 'LIMIT_UNEXPECTED_FILE'){
        return res.status(400).json({
            error:'UNEXPECTED_FILE',
            message:`Unexpedted file field`,
            statusCode:400
        });
    }
    //Handles known custom errors
    if(err instanceof CustomError){
        const response={
            error: err.code,
            message:err.message,
            ...(Object.keys(err.details).length>0&&{details:err.details})
        };
        if(isDevelopment()){
            response.stack= err.stack;
        }
        return res.status(err.statusCode).json(response);
    }
    //unknown error
    const response={
        error:'INTERNAL_ERROR',
        message: isProduction()?'An unexpected error occured': err.message
    };
    if (isDevelopment()){
        response.stack=err.stack;
    }
    res.status(500).json(response);
};
//Async handler wrapper to avoid try/catch in every route
export const asyncHandler =(fn)=>(req,res,next)=>{
    Promise.resolve(fn(req,res,next)).catch(next);
};