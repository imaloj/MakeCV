import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import * as env from './config/env.js';
import * as constants from './config/constants.js';
import {errorHandler} from './middleware/errorHandler.js';
import FileUtils from './utils/fileUtils.js';
import logger from './utils/logger.js';

//Routes imports
import healthRoutes from './routes/health.js';
import uploadRoutes from './routes/upload.js';
import customizeRoutes from './routes/customize.js';

const app = express();

app.use(helmet({
    crossOriginEmbedderPolicy:{policy:'credentialless'}
}));

app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials:true
}));

const limiter= rateLimit({
    windowMs:constants.RATE_LIMIT,
    max:constants.RATE_LIMIT_MAX,
    message:{
        error:'RATE_LIMIT',
        message:'Too many request, please try again later'
    },
    standardHeaders:true,
    legacyHeaders:false
});
app.use(limiter);

const customizeLimiter = rateLimit({
    windowMs: 15*60*1000, //15 minutes
    max:10,
    message:{
        error:'RATE_LIMIT',
        message:'Customization limit reached, please try again in 15 minutes'
    }
});

//body parsing
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true, limit:'10mb'}));

//Request logging
app.use(morgan(env.isDevelopment()?'dev':'combined',{
    stream:{write:msg=> logger.info(msg.trim()) }
}));

//ensure temp dir exists
FileUtils.ensureTempDir();

//api routes
app.use('/api/health',healthRoutes);
app.use('/api/upload',uploadRoutes);
app.use('/api/customize',customizeLimiter,customizeRoutes);

//root endpoint
app.get('/',(req,res)=>{
    res.json({
        name:'CV Customizer API',
        version:'1.0.0',
        status: 'running',
        endpoints:{
            health:'/api/health',
            upload:'/api/upload',
            customize:'/api/customize',
            preview:'/api/customize/preview'
        }
    });
});

//404 handler
app.use((req,res)=>{
    res.status(404).json({
        error:'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`
    });
});

//Global error handler (must be last)
app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT,()=>{
    logger.info(`CV Customizer API running on port ${PORT}`);
    logger.info(`Environment:${env.NODE_ENV}`);
    logger.info(`CORS origin:${env.CORS_ORIGIN}`);
    logger.info(`LLM Provider: ${env.LLM_PROVIDER}`);
});

//GRACEFUL SHUTDOWN
process.on('SIGTERM',async()=>{
    logger.info('SIGTERM received, shuttting down');
    process.exit(0);
});
process.on('SIGINT',async()=>{
    logger.info('SIGINT received, shuttting down');
    process.exit(0);
});

export default app;

