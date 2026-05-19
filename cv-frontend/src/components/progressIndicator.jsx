import {Loader2,CheckCircle,Sparkles,FileSearch} from 'lucide-react'
import {cn} from '../utils/cn.js'

const STEPS=[
    {id:'upload',label:'Uploading',icon: FileSearch},
    {id:'analyze',label:'Analyzing',icon:Sparkles},
    {id:'customize',label:'Customizing',icon: Loader2},
    {id:'complete',label:'Complete',icon:CheckCircle},
]

export default function ProgressIndicator({progress}){
    if(!progress) return null

    const currentStepIndex =STEPS.findIndex(s=>s.id===progress.step)
    return(
        <div className='card animate-slide-up'>
            <div className='flex items-center gap-3 mb-4'>
                {progress.step==='customize'?(
                    <loader2 className="w-6 h-6 text-primary-600 animate-spin"/>
                ):progress.step==='complete'?(
                    <CheckCircle className='w-6 h-6 text-green-600'/>
                ):(<Sparkles className='w-6 h-6 text-primary-600 animate-pluse'/>
                )}
                <div>
                    <p className='font-medium text-gray-900'>{progress.message}</p>
                    <p className='text-sm text-gray-500'>Step {currentStepIndex+1} of {STEPS.length}</p>
                </div>
            </div>
            {/*Progress bar */}
            <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
                <div className='bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out'
                style={{width:`${((currentStepIndex+1)/STEPS.length)*100}%`}}/>
            </div>

            {/*Step indicator */}

        <div className='flex justify-between'>
            {STEPS.map((step,index)=>{
                const Icon=step.icon
                const isActive = index<= currentStepIndex
                const isCurrent = index === currentStepIndex

                return(
                    <div key={step.id} className='flex flex-col items-center gap-1'>
                        <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                            isCurrent && 'ring-2 rinf-primary-500 ring-offset-2',
                            isActive?'bg-primary-100 text-primary-700':'bg-gray-100 text-gray-400'
                        )}>
                            <Icon className={cn('w-4 h-4',isCurrent&& 'animate-spin')}/>
                        </div>
                        <span className={cn('text-xs font-medium'.isActive? 'text-gray-900':'text-gray-400')}>
                            {step.label}
                        </span>
                    </div>
                )
            })}

        </div>
    </div>
    )
}