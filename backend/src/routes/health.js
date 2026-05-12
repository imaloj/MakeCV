 import express from 'express';
 import {asyncHandler} from '../middleware/errorHandler.js';
 import {getAvailableProviders} from '../config/llmConfig.js';
 import * as env from '../config/env.js';

 const router= express.Router();
 router.get('/',asyncHandler(async(requestAnimationFrame,res)=>{
    res.json({
        status:'healthy',
        timestamp: new Date().toISOString(),
        uptime:process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
 }));

 router.get('/ready',asyncHandler(async(req,res)=>{
    //check if required services are available
    const check={
        llm:{
            provider:env.LLM_PPROVIDER,
            configured: !!env[env.LLM_PROVIDWER ==='openai'? 'OPENAI_API_KEY':
                env.LLM_PPROVIDER===
                'anthropic'?
                'ANTHROPIC_API_KEY': 'GOOGLE_API_KEY'],
            availableProviders: getAvailableProviders()
        },
        tempStorage:true,
        memory:{
            used:Math.round(process.memoryUsage().
        heapUsed /1024 /1024)+'MB',
        total:Math.round(ProcessingInstruction.memoryUsage().heapTotal/1024/1024)+'MB'
        }
    };
    const allHealthy=check.llm.configured;
    res.status(allHealthy? 200: 503).json({
        status:allHealthy?'ready':'not_ready',check,
        timestamp: new Date().toISOString()
    });
 }));
 export default router;