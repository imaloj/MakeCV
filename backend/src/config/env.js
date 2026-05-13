import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars=[];

//only require the currently selected LLm Provider key
const llmProvider = process.env.LLM_PROVIDER||'openai';

const providerKeyMap={
    openai:'OPENAI_API_KEY',
    anthropic:'ANTHROPIC_API_KEY',
    google:'GOOGLE_API_KEY'
};
if(providerKeyMap[llmProvider]){
    requiredEnvVars.push(providerKeyMap[llmProvider]);
}
//validate required variables
const missing= requiredEnvVars.filter(key=>!process.env[key]);
if(missing.length>0){
    console.warn(`[ENV] Missing optional environment variables:${missing.join(',')}`);
}
export const NODE_ENV=process.env.NODE_ENV||'development';
export const PORT=process.env.PORT||5000;
export const CORS_ORIGIN=process.env.CORS_ORIGIN||'http://localhost:3000';

export const LLM_PROVIDER=llmProvider;
export const OPENAI_API_KEY=process.env.OPENAI_API_KEY;
export const ANTHROPIC_API_KEY=process.env.ANTHROPIC_API_KEY;
export const GOOGLE_API_KEY=process.env.GOOGLE_API_KEY;


export const TEMP_FILE_PATH=process.env.TEMP_FILE_PATH||'./temp';
export const MAX_FILE_SIZE_MB=parseInt(process.env.MAX_FILE_SIZE_MB)||25;

export const RATE_LIMIT_WINDOW_MS=parseInt(process.env.RATE_LIMIT_WINDOW_MS)||15*60*1000;
export const RATE_LIMIT_MAX_REQUEST=parseInt(process.env.RATE_LIMIT_MAX_REQUEST)||100;

export const REQUEST_TIMEOUT_MS=parseInt(process.env.REQUEST_TIMEOUT_MS)||6000;
export const LLM_MAX_RERIES=parseInt(process.env.LLM_MAX_RERIES)||3;
export const TEMP_FILE_CLEANUP_HOURS=parseInt(process.env.TEMP_FILE_CLEANUP_HOURS)||24;

export const isDevelopment=()=>process.env.NODE_ENV==='development';
export const isProduction=()=>process.env.NODE_ENV==='production';




