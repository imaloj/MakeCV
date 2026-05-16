import apiClient from './api.js';

export const cvService={
//Upload a CV file and get parsed preview
async uploadCV(file){
    const formData =new FormData()
    formData.append('cv',file)
    
    const response =await apiClient.post('/upload',formData,{headers:{'Content-Type': 'multipart/form-data'}
    })
    return response.data
},
// customize CV and download result
async customizeCv(file,jobDescription,options={}){
    const formData=new FormData()
    formData.append('cv',file)
    formData.append('jobDescription',jobDescription)
    formData.append('strategy',options.strategy||'smart-match')
    formData.append('outputFormat',options.outputFormat||'docx')
    formData.append('preseveOriginal',String(options.preserveOriginal ?? true))
    formData.append('highlightChanges',String(options.highlightChanges ?? true))

    if(options.maxTokens){
        formData.append('maxTokens', String(options.maxTokens))
    }
    if(options.temperature!== undefined){
        formData.append('temperature', String(options.temperature))
    }

    const response = await apiClient.post('/customize', formData,{
        headers:{'Content-Type':'multipart/form-data'},
        responseType:'blob'
    })

    const blob= new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const contentDisposition =response.headers['content-disposition']
    const filename= contentDisposition?contentDisposition
       .split('filename=')[1]?.replace(/"/g,''):`customize_cv.${options.outputFormat|| 'docx'}`
    return {url,filename,blob}
},
//get preview of custiomzed cv (JSON response)
async previewCustomization(file, jobDescription, options  ={}){
    const formData =new FormData()
    formData.append('cv',file)
    formData.append('jobDescription',jobDescription)
    formData.append('strategy',options.strategy|| 'smart-match')
    formData.append('outputFormat',options.outputFormat||'docx')

    const response= await apiClient.post('/customize/preview',formData,{headers:{'Content-Type':'multipart/form-data'}
    })
    return response.data
},
//check api health
async checkHealth(){
    const response= await apiClient.get('/health')
    return response.data
}
}