import winston from 'winston';
import {isDevelopment} from '../config/env.js';

export const logger = winston.createLogger({
    level: isDevelopment()?'debug':'info',
    format:winston.format.combine(
        winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
        winston.format.errors({stack:true}),
        winston.format.json()
    ),
    defaultMeta:{service:'cv-customizer-backend'},
    transports:[
        new winston.transports.Console({
            format:winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({level,message,timestamp,stack,...meta})=>{
                    let msg = `${timestamp}[${level}]:${message}`;
                    if (Object.keys(meta).length>0&& meta.service){
                        const{service,...rest}=meta;
                        if (Object.keys(rest).length>0){
                            msg+=`${JSON.stringify(rest)}`;
                        }
                    }
                        if(stack)msg +=`\n${stack}`;
                        return msg;
                    })
             )
        })
    ]
});
export default logger;