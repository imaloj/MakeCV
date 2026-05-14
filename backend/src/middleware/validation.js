import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

const schemas={
    customize:Joi.object({
    jobDescription:Joi.string()
    .min(10)
    .max(20000)
    .required()
    .messages({
        'string.min': 'Job description must be at least 10 characters',
        'string.max':'Job description must not exceed 20000 characters',
        'any.required':'Job description is required'}),
        
        strategy: Joi.string().valid('smart-match','reorder','rephrase','full').default('smart-match'),
        preserveOriginal: Joi.boolean().default(true),
        highlightChanges: Joi.boolean().default(true),
        outputFormat: Joi.string().valid('docx','pdf','txt').default('docx'),
        maxTokens: Joi.number().integer().min(500).max(8000).default(4000),
        temperature: Joi.number().min(0).max(2).default(0.6)
    }),
    upload: Joi.object({
        fileType:Joi.string().valid('pdf','docx',
            'txt').optional()
    })
};

export const validateCustomize=(req,res,next)=>{
    //handles multipart form data (jobdescription arrives as string)
    const payload={
        ...req.body,
        strategy:req.body.strategy || 'smart-match',
        preserveOriginal:req.body.preserveOriginal==='true'|| req.body.preserveOriginal===true,highlightChanges:req.body.highlightChanges==='true'||req.body.highlightChanges===true,
        outputFormat:req.body.outputFormat||'docx',
        maxTokens:req.body.maxTokens? parseInt(req.body.maxTokens):4000,
        temperature:req.body.temperature?parseFloat(req.body.temperature):0.6
    };
    const{error,value}=schemas.customize.validate(payload);
    if(error){
        throw new ValidationError(
            'Validation failed',{fields:error.details.map(d=>({field:d.path[0],message: d.message}))}
        );
    }
    req.validatedBody=value;
    next();
};
export {schemas};
