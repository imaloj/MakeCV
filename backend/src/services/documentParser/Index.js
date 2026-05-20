import PDFParser from './PDFParser.js';
import DOMParser from './DOCXParser.js';
import TextParser from './TextParser.js';
import {ParseError} from '../../middleware/errorHandler.js';
import logger from '../../utils/logger.js';
import DOCXParser from './DOCXParser.js';

//Parser registry -easy to add new formats
const PARSERS={
    pdf:PDFParser,
    docx: DOCXParser,
    txt: TextParser,
    text: TextParser
};

export class ParseFactory{
    static getParser(fileType){
        const parser = PARSERS[fileType.toLowerCase()];
        if (!parser){
            throw new ParserError(
                `No Parser available for file type :${fileType}`,
                { supportedTypes: Object.keys(PARSERS)}
            );
        }
        return parser;
    }
    static getSupportedTypes(){
        return Object.keys(PARSERS);
    }
}

export class DocumentParserService{
   /*
   * @param{string} filePath -Path to the file
    *@param {string} fileType- file extension/type
    *@returns{Promise<Object>}*/
    

    static async parse(filePath, fileType){
        logger.info(`Parsing document:${filePath}(type:${fileType})`);

        const parser = ParseFactory.getParser(fileType);
        const result = await parser. extract(filePath);

        logger.info(`Successfully parsed document:${result.sections?.header?.name|| 'Unknown'} (${result.fullText?.length|| 0}chars)`);
        return result;
    }
}
export {PARSERS};

