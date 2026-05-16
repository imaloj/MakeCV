import {useState} from 'react'
import {ArrowRight, Loader2} from 'lucide-react'
import {useCV} from '../hooks/useCV.js'
import Header from '../components/Header.jsx'
import FileUploader from '../components/FileUploader.jsx'
import JobDescriptionInput from '../components/JobDescriptionInput.jsx'
import CustomizationOptions from '../components/CustomizationOptions.jsx'
import ProgressIndicator from '../components/ProgressIndicator.jsx'
import ResultViewer from '../components/ResultViewer.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

const DEFAULT_OPTIONS={
    strategy: 'smart-match',
    outputFormat:'docx',
    preserveOriginal: true,
    highlightChanges:true,
}

export default function Home(){
    const[file, setFile]= useState(null)
    const [jobDescription, setJobDescrition]= useState('')
    const [options, setOptions]= useState(DEFAULT_OPTIONS)

    const{
        isLoading,
        error,
        progress,
        result,
        parsedFile,
        uploadFile,
        customize,
        reset
    }= useCV()

    const handleFileSelect = async (selectedFile)=>{
        setFile(selectedFile)
        try {
            await uploadFile(selectedFile)
        } catch {
            //error handle in hook
        }
    }
    const handleClear=() =>{
        setFile(null)
        setJobDescrition('')
        setOptions(DEFAULT_OPTIONS)
        reset()
    }
    
    const handleCustomize = async()=>{
        if(!file||!jobDescription.trim()) return
        try{
            await customize(file, jobDescription, options)
        } catch{
            //error handle in hook
        }
    }
    const canSubmit = file && jobDescription.trim().length >= 10 && !isLoading

    return(
        <div className="min-h-screen bg-gray-50">
            <Header/>
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Error */}
                {error &&(
                    <ErrorMessage message={error} onDismiss={()=>{}}/>
                )}

                {/*Progress */}
                {progress && <ProgressIndicator progress={progress}/>}
                
                {/*result */}
                {result &&(
                    <ResultViewer 
                    result={result}
                    onReset={handleClear}/>
                )}
                {/*main form*/}
                {!result&&(
                    <div className="space-y-6">
                        <div className="card">
                            <FileUploader 
                            file={file} 
                            onFileSelect={handleFileSelect}
                            parsedData={parsedFile}
                            onClear={handleClear}
                        />
                    </div>
                    {file &&(
                        <div className="card animate-slide-up">
                            <JobDescriptionInput
                            value={jobDescription}
                            onChange={setJobDescrition}
                            error={error?.includes('description')?error:null}
                            />
                        </div>
                    )}
                    {file && jobDescription.length>=10&&(
                        <div claaName="card animate-slide-up">
                            <CustomizationOptions
                            options={options}
                            onChange={setOptions}
                            />
                        </div>
                    )}
                    {/*Submit Button */}
                    {file &&(
                        <div className="flex justify-end">
                            <button 
                            onClick={handleCustomize}
                            disable={!canSubmit}
                            className="btn primary flex items-center gap-2 text-lg py-3 px-8"
                            >
                                {isLoading?(
                                    <>
                                    <Loader2 className="w-5 h-5 animate-spin"/>
                                     Processing...
                                    </>
                                ):(
                                <>
                                Cumstomize My CV
                                <ArrowRight className="w-5 h-5"/>
                                </>
                            )}
                            </button>
                        </div>
                    )}
                    </div>
                )}
        {/*Info footer*/}
        {!result &&(
                    <div className="text-center text-xs text-gray-400 py-4">
                        <p> Your data is processed securely and never stored permanently.</p>
                        <p className="mt-1">Supported formats:PDF, DOCX,TXT • Max file size: 25MB</p>
                    </div>
                )}
            
            </main>
        </div>
    )
}