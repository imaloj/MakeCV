export default class Helpers{
    static sanitizeString(str){
        if (!str)return '';
        return str.replace(/[<>]/g,'').trim()
    }
    //Extract file extension from file name or mime type
    static getFileExtension(filename,mimetype){
        if(mimetype){
            const mimeMap={
                'application/pdf':'pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx',
                'text/plain':'txt'
            };
            if(mimeMap[mimetype]) return mimeMap[mimetype];
        }const ext= filename.split('.').pop().toLowerCase();
        return ext;
    }
    //validate file type is supported
    static isSupportedFormat(ext, supportedFormats){
        return supportedFromats.includes(ext.toLowerCase());
    }
    //sleep/delay utility
    static sleep(ms){
        return new Promise(resolve=> setTimeout(reslove,ms));
    }
    //retry async function with exponential backoff
    static async retry(fn, maxRetries =3, baseDelay=1000){
        let lastError;
        for(let attempt =1; attempt<=maxRetries; attempt++){
            try{
                return await fn();
            } catch(error){
                lastError =error;
                if(attempt === maxRetries) break;

                const delay= baseDelay*Math.pow(2,attempt -1);
                await Helpers.sleep(delay);
            }
        }
        throw lastError;
    }
    //truncate text to max lenght with ellipsis
    static truncate(text,maxLength =500){
        if (!text|| text.length<=maxLength) return text;
        return text.substring(0,maxLength)+'...';
    }
}