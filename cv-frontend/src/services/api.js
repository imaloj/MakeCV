import axios from 'axios'

const API_BASE_URL= import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient =axios.create({
    baseURL:`${API_BASE_URL}/api`,
    timeout:120000,//2mintues for LLM processing
    headers:{
        'Accept':'application/json',
    }
})
//request interceptor
apiClient.interceptors.request.use(
    (config)=>{
        console.log(`[API] ${config.method?.toUpperCase()}${config.url}`)
        return config
    },
    (error)=> Promise.reject(error)
)

//Response Interceptor
apiClient.interceptors.response.use(
    (response)=> response,
    (error)=>{
        const message= error.respomse?.data?.message ||error.message|| 'Something went wrong'
        console.error('[API Error]',message)
        return Promise.reject({message,status:error.response?.status,data:error.response?.data})
    }
)
export default apiClient;