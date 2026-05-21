import express from 'express';
import upload from '../middleware/upload.js';
import {validateCustomize} from '../middleware/validation.js';
import CVCustomizer from '../services/cvCustomizer.js';
import FileUtils from '../utils/fileUtils.js';
import {asyncHandler} from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/',
    upload.single('cv'),
    validateCustomize,
    asyncHandler(async(req,res)=>{
        if(!req.file){
            return res.status(400).json({
                error: 'NO_FILE',
                message: 'NO CV uploaded'
            });
        }
        const filePath = req.file.path;
        const fileType =req.file.originalname
        .split('.')
        .pop()
        .toLowerCase();
        const options =req.validatedBody;

        logger.info(`Customization request:${req.file.originalname}->${options.outputFormat}`);

        const customizer = new CVCustomizer({
            llmProvider:options.llmProvider
        });
        try{
            const result =await customizer.customize(
                filePath,
                fileType,
                options.jobDescription,
                options
            );
            //schedule file cleanup
            setTimeout(()=>{
                FileUtils.deleteFile(result.outputFile.path);},60*60*1000);

            //send file for download
            res.download(result.outputFile.path,result.outputFile.filename,(err)=>{
                if(err){
                    logger.error('Download error:',err.message);
                //if download fails,try sending JSON response
                if(!res.headersSent){
                    res.status(500).json({error:
                        'DOWNLOAD_FAILED',message: err.message });
                }
            }
            FileUtils.deleteFile(filePath);
            });
        }catch(error){
            await FileUtils.deleteFile(filePath);
            throw error;
        }
    })
);
 /**
 * POST /api/customize/preview
 * Returns customized CV as JSON without file generation
 */
router.post('/preview',upload.single('cv'),
validateCustomize,
asyncHandler(async (req,res)=>{
    if(!req.file){
        return res.status(400).json({error:'NO_FILE',message:'NO CV file uploaded'});
    }
    const filePath= req.file.path;
    const fileType = req.file.originalname.split('.').pop().toLowerCase();
    const options =req.validatedBody;
    const customizer = new CVCustomizer();

    try{
        const result =await customizer.customizePreview(
            filePath,
            fileType,
            options.jobDescription,
            options
        );
    res.json(result);
    }finally{
        await FileUtils.deleteFile(filePath);
    }
})
);
export default router;

