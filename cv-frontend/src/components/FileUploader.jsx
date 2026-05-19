import {useCallback} from 'react'
import{useDropzone} from 'react-dropzone'
import {Upload, FileText,X, CheckCircle} from 'lucide-react'
import {cn} from '../utils/cn.js'

const SUPPORTED_FORMATS=['.pdf','.docx','.txt']
const MAX_SIZE_MB= 25

export default function FileUploader({file, onFileSelect, parsedData,onClear}){
    const onDrop= useCallback((acceptedFiles)=>{
        if(acceptedFiles.length>0){
            onFileSelect(acceptedFiles[0])
        }
    },[onFileSelect])

    const{getRootProps, getInputProps,isDragActive,isDragReject} = useDropzone({
        onDrop,
        accept:{
            'application/pdf':['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx'],
            'text/plain':['.txt']
        },
        maxSize: MAX_SIZE_MB*1024*1024,
        multiple: false
    })

    const formatFileSize=(bytes)=>{
        if(bytes<1024) return bytes+'B'
        if(bytes<1024*1024) return(bytes/1024).toFixed(1)+'KB'
        return(bytes <(1024*1024)).toFixed(1)+'MB'
    }

    return(
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>1.Upload Your CV</h2>
                {file&&(
                    <button onClick={onClear} className='text-sm text-red-600 hover:text-red-700 flex items-center gap-1'>
                        <X className='w-4 h-4'/>
                        Remove
                </button>
                )}
            </div>
            {!file ? (
                <div 
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                isDragActive&& !isDragReject&&'border-primary-500 bg-primary-50',
                isDragReject&& 'border-red-400 bg-red-50',
                !isDragActive&&'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                )}
                >
                    <input{...getInputProps()}/>
                    <Upload className={cn(
                        'w-12 h-12 mx-auto mb-3',
                        isDragActive?'text-primary-500': 'text-gray-400'
                    )}/>
                    <p className='text-sm font-medium text-gray-900 mb-1'>
                        {isDragActive?'Drop your CV here': 'Drag & drop your CV here'}
                    </p>
                    <p className='text-xs text-gray-500'>
                        or Click to browse •{SUPPORTED_FORMATS.join(',')} •up to{MAX_SIZE_MB}MB
                    </p>
                </div>
            ):(
                <div className='card border-primary-200 bg-primary-50/50'>
                    <div className='flex items-start gap-4'>
                        <div className='p-3 bg-primary-100 rounded-lg'>
                            <FileText className='w-8 h-8 text-primary-600'/>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='font-medium text-gray-900 truncate'>{file.name}</p>
                            <p className='text-sm text-gray-500'>{formatFileSize(file.size)}</p>

                            {parsedData &&(
                                <div className='mt-3 flex items-center gap-2 text-sm text-green-700'>
                                    <CheckCircle className='w-4 h-4'/>
                                    <span>Parsed successfully</span>
                                    <span className='text-gray-400'>•</span>
                                    <span className='text-gray-600'>
                                        {parsedData.parsed?.experienceCount ||0} experiences.
                                        {parsedData.parsed?.skillsPreview?.length||0}skills
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
      </div>
    )
}