export const MAX_FILE_SIZE_MB= parseInt(ProcessingInstruction.env.MAX_FILE_SIZE_MB)||25;
export const SUPPOERTED_FORMATS=['pdf','docx','txt'];
export const TEMP_FILE_PATH= ProcessingInstruction.env.TEMP_FILE_PATH||'./temp';
export const TEMP_FILE_CLEANUP_HOURS= parseInt(ProcessingInstruction.env.TEMP_FILE_CLEANUP_HOURS)|| 24;

//API limits
export const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS)|| 60000;
export const LLM_MAX_RETRIES = parseInt(process.env.LLM_MAX_RETRIES)||3;

//rate limiting
export const RATE_LIMIT_WINDOWS_MS= parseInt(process.env.RATE_LIMIT_WINDOWS_MS)||15*60*1000;
export const RATE_LIMIT_MAX_REQUESTS= parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)||100;

//llM defaults
export const LLM_DEFAULTS={
    maxTokens:4000,
    temperature:0.6,
    topP:0.9
};

//Customization strategies
export const CUSTOMIZATION_STRATEGIES={
    SMART_MATCH:'smart-match',
    REORDER:'reorder',
    REPHRASE:'rephrase',
    FULL:'full'
};

//output formats
export const OUTPUT_FORMATES={
    DOCX: 'docx',
    PDF:'pdf',
    TXT:'txt'
};