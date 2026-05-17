import { useState, useCallback } from 'react'
import {cvService} from '../services/cvService.js'

export function useCV(){
    const [isLoading,setIsLoading]=useState(false)
    const [error,setError]=useState(null)
    const[progress,setProgress]=useState(null)
    const[result,setResult]=useState(null)
    const[parsedFile,setParsedFile] =useState(null)

    const uploadFile= useCallback(async(file)=>{
        setIsLoading(true)
        setError(null)
        setProgress({step:'upload',message:'Uploading and parsing your CV...'})
        
        try {
            const data=await cvService.uploadCV(file)
            setParsedFile(data)
            setProgress(null)
            return data
        } catch (err) {
            setError(err.message||'Failed to Upload CV')
            setProgress(null)
            throw err
        } finally{
            setIsLoading(false)
        }
    },[])
    const customize= useCallback(async(file,jobDescription,options)=>{
        setIsLoading(true)
        setError(null)
        setResult(null)
        
        try {
            //step1: preview
            setProgress({step:'analyze',message:'Analyzing job description...'})
            await new Promise(r=>setTimeout(r,500))//UX delay

            //step2: customize
            setProgress({step:'customize',message:'AI is tailoring your CV....'})
            const downloadData= await cvService.customizeCv(file,jobDescription,options)
            setResult({
                type:'download',
                ...downloadData,
                outputFormat:options.outputFormat
            })
            setProgress({step:'complete',message:'Your customized CV is ready!'})
            return downloadData
        } catch (err) {
            setError(err.message||'Failed to customize CV')
            setProgress(null)
            throw err
        }finally{
            setIsLoading(false)
        }
    },[])
    const preview= useCallback(async(file,jobDescription,options)=>{
        setIsLoading(true)
        setError(null)

        try {
            const data = await cvService.previewCustomization(file,jobDescription,options)
            setResult({type:'preview',data})
            return data
        } catch (err) {
            setError(err.message||'Failed to generate preview')
            throw err
        }finally{
            setIsLoading(false)
        }
    },[])
    const reset = useCallback(()=>{
        setIsLoading(false)
        setError(null)
        setProgress(null)
        setResult(null)
        setParsedFile(null)
    },[])

    return{
        isLoading,
        error,
        progress,
        result,
        parsedFile,
        uploadFile,
        customize,
        preview,
        reset
    }
}