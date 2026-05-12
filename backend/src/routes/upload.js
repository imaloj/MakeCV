import express from 'express';
import upload from '../middleware/upload.js';
import { DocumentParserService } from '../services/documentParser/index.js';
import FileUtils from '../utils/fileUtils.js';
import {asyncHandler} from "../middleware/errorHandler.js";
import logger from '../utils/logger.js';

const router = express.Router();
/**
 * POST /api/upload
 * Upload a CV file and return parsed preview
 */
router.post('/',upload.single('cv'),asyncHandler(async(req,res)=>{
    if(!req.file){
        return res.status(400).json({
            error:'NO_FILE',
            message:'No file uploaded'
        });
    }
const filePath =req.file.path;
const fileType= req.file.originalname.split('.').pop().toLowerCase();

logger.info(`File uploaded:${req.file.originalname}(${req.file.size}bytes)`);

try{
    //parse the document
    const parsed= await DocumentParserService.parse(filePath,fileType);
    //return parsed data(without full text to keep response small)
    res.json({
        success: true,
        file:{
            originalName: req.file.originalname,
            size:req.file.size,
            type: fileType
    },
    parsed:{
        header:parsed.sections.header,
        summaryPreview:parsed.sections.summary?.substring(0,200),
        experienceCount:parsed.sections.skills?.slice(0,10),
        educationCount:parsed.sections.education?.length,
        textLength:parsed.fullText?.lenght
    }
    });
}catch (error){
    //clean up file on error
    await FileUtils.deleteFile(filePath);
    throw error;
}
}));
 export default router;
