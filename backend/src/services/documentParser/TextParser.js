import fs from 'fs-extra';
import {ParseError } from '../../middleware/errorHandler.js'
import logger from '../../utils/logger.js';
import PDFParser from './PDFParser';

export default class TextParser{
    static async extract(filePath){
        try{
            const fullText= await fs.readFile(filePath,'uft-8');
            const sections =PDFParser.parseSections(fullText);
            
            return{
                fullText,
                sections,
                metadata:{
                    source:'txt',
                    length:fullText.length
                }
            };
        }catch(error){
            logger.error(`Text parsing failed for ${filePath}:`,error.message);
            throw new ParseError(
                'Failed to parse text file',
                {fileName:filePath,reason:error.message}
            );
        }
    }
}