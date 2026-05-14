import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import {v4 as uuidv4} from 'uuid';
import logger from './logger.js';
import {TEMP_FILE_PATH, TEMP_FILE_CLEANUP_HOURS} from '../config/constants.js';

const __filename=fileURLToPath(import.meta.url);
const __dirname= path.dirname(__filename);

export default class FileUtils{
    //check temp directory exists
    static ensureTempDir(){
        fs.ensureDirSync(TEMP_FILE_PATH);
    }
    //generate a unique filename with original extension

    static generateUniqueFilename(originalName){
        const ext=path.extname(originalName)||'.tmp';
        return `${uuidv4()}${ext}`;
    }

    //get full path for a temp file
    static getTempPath(filename){
        return path.join(TEMP_FILE_PATH,filename);
    }
    //delete a file if exists
    static async deleteFile(filePath){
        try{
            if(await fs.pathExists(filePath)){
                await fs.remove(filePath);
                logger.debug(`Delete temp file:${filePath}`);
            }
        }catch(error){
            logger.error(`Failed to delete file ${filePath}:`,error.messsage);
        }
    }
    //clean up old temp files
    static async cleanupOldFiles(){
        try {
            const files= await fs.readdir(TEMP_FILE_PATH);
            const now =Date.now();
            const maxAge= TEMP_FILE_CLEANUP_HOURS*60*60*1000;

            for(const file of files){
                const filePath =path.join(TEMP_FILE_PATH,file);
                const stats =await fs.stat (filePath);
                if(now - stats.mtimeMs>maxAge){
                    await fs.remove(filePath);
                    logger.debug(`Cleaned up old file:${file}`);
                }
            }    
        } catch (error) {
            logger.debug('Cleanup error:,error.messsage');
        }
    }
    static async readFile(filePath){
        return fs.readFile(filePath);
    }
    //write buffer to file
    static async writeFile(filePath,data){
        await fs.writeFile(filePath,data);
    }
}
