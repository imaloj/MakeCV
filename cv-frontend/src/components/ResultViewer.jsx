import {Download, RotateCcw, CheckCircle, Lightbulb, TrendingUp} from 'lucide-react'

export default function ResultViewer({result, onReset}){
    const handleDownload=()=>{
        if(result.url){
            const link=document.createElement('a')
            link.herf=result.url
            link.download = result.filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
    
        }
    }

    //preview mode
    if(result.type==='preview'&result.data){
        const{preview,changes, matchScore, suggestions}= result.data
        return(
            <div className='card animate-slide-up space-y-6'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold text-gray-900'>Preview</h3>
                    <button onClick={onReset} className='btn-secondary text-sm py-2 px-4'>
                        <RotateCcw className='w-4 h-4 inline mr-1'/>
                        Start Over
                    </button>
                </div>
                {/*Match Score */}
                <div className='bg-primary-50 rounded-lg p-4 flex items-center gap-4'>
                    <div className='relative w-16 h-16'>
                        <svg className='w-16 h-16 transform -rotate-90'>
                            <circle cx='32' cy='32' r='28' stroke='currentColor' strokeWidth='4' fill='none'className='text-primary-200'/>
                            <circle cx='32' cy='32' r='28' stroke='currentColor' strokeWidth='4' fill='none' className='text-primary-600' strokeDasharray={`${(matchScore||0)*1.76}176`}
                            strokeLinecap='round' 
                            />
                        </svg>
                        <span className='absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-700'>
                            {matchScore || 0}%
                        </span>
                    </div>
                    <div>
                        <p className='font-medium text-primary-900'>Match Score</p>
                        <p className='text-sm text-primary-700'>How well your CV aligns with the job</p>
                    </div>
                </div>
                {/*Changes */}
                {changes && changes.length >0&&(
                    <div className='space-y-3'>
                        <h4 className='font-medium text-gray-900 flex items-center gap-2'>
                            <TrendingUp className='w-4 h-4'/>
                            Changes Made
                        </h4>
                        <div className='space-y-2'>
                            {changes.map((change,i)=>(
                            <div key={i} className='bg-gray-50 rounded-lg p-3 text-sm'>
                                <p className='font-medium text-gray-900'>{change.section}</p>
                                <p className='text-gray-600'>{change.change}</p>
                                {change.reason&&(
                                   <p className='text-gray-500 text-xs mt-1'>{change.reason}</p> 
                                )}
                            </div>
                            ))}
                        </div>
                    </div>
                )}
                {/*Suggestions */}
                {suggestions&& suggestions.length>0&&(
                    <div className='space-y-3'>
                        <h4 className='font-medium text-gray-900 flex items-center gap-2'>
                            <Lightbulb className='w-4 h-4'/>
                            Suggestions
                        </h4>
                        <ui className='space-y-2'>
                            {suggestions.map((suggestion,i)=>(
                            <li key={i} className='flex item-start gap-2 text-sm text-gray-700'>
                                <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 shrink-0'/>
                                {suggestion}
                            </li>
                            ))}
                        </ui>
                    </div>
                )}
                {/*CV Preview */}
                {preview &&(
                    <div className='space-y-3'>
                        <h4 className='font-medium text-gray-900'> Customized CV preview</h4>
                        <div className='bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto'>
                            {JSON.stringify(preview,null,2)}
                        </div>
                    </div>
                )}
            </div>
        )
    }
    //Download mode
    return(
        <div className='card animate-slide-up text-center space-y-6'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
                <CheckCircle className='w-8 h-8 text-green-600'/>
            </div>
            <div>
                <h3 className='text-xl font-semibold text-gray-900'> Your CV is Ready!</h3>
                <p className='text-gray-500 mt-1'>
                    Customized and optimized for the job description
                </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <button onClick={handleDownload} className='btn-primary flex items-center justify-center gap-2'>
                    <Download className='w-5 h-5'/>
                    Download {result.outputFormat?.toUpperCase()||'File'}
                </button>

                <button onClick={onReset} className='btn-secondary flex items-center justify-center gap-2'>
                    <RotateCcw className='w-5 h-5'/>
                    Customize Another
                </button>
            </div>

            <p className='text-xs text-gray-400'>
                {result.filename}
            </p>
        </div>
    )
}