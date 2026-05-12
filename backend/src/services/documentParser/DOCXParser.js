import mammoth from 'mammoth';
import {ParseError} from '../../middleware/errorHandler.js';
import logger from '../../utils/logger.js';
import PDFParser from'./PDFParser.js';

export default class DOCXParser{
    static async extract(filePath){
        try{
            const result =await mammoth.extractRawText({path:filePath});
            const fullText = result.value || '';
            const sections = this.parseSections(fullText);

            return {
                fullText,
                sections,
                metadata:{
                    message:result.messages,
                    source:'docx'
                }
            };
        } catch (error){
            logger.error(`DOCX parsing failed for ${filePath}:`, error.message);
            throw new ParseError(
                'Failed to parse DOCX file',{fileName:filePath, reason:error.message}
            );
        }
    }
    static parseSections(text){
        //Reuse same heuristic parsing as PDF
        return PDFParser.parseSections(text);
    }
}