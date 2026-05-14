import multer from 'multer';
import path from 'path';
import FileUtils from '../utils/fileUtils.js';
import {MAX_FILE_SIZE_MB, SUPPORTED_FORMATS} from '../config/constants.js';
import{FileError} from './errorHandler.js';

//Configure storage
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        FileUtils.ensureTempDir();
        cb(null,FileUtils.getTempPath(''));
    },
    filename:(req,file,cb)=>{
        const uniqueName=FileUtils.generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
    }
});

//File Filter for support formats
const fileFilter= (req,file,cb)=>{
    const ext =path.extname(file.originalname).toLowerCase().replace('.','');
    const mimetype=file.mimetype;

    const validExts= ['pdf','docx','txt'];
    const validMimes=[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    if(validExts.includes(ext)||validMimes.includes(mimetype)){
        cb(null,true);
    }else{
        cb(new FileError(
            `Unsupported file format:${ext|| mimetype}`,{supportedFormats:SUPPORTED_FORMATS}
        ),false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: MAX_FILE_SIZE_MB*1024 *1024, files:1
    }
});
 export default upload;