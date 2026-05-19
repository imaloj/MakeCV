import {AlertTriangle, X} from 'lucide-react'

export default function ErrorMessage({message,onDismiss}){
    if(!message) return null

    return(
        <div className="bg-red-50 border-red-200 rounded-lg p-4 flex items-start gap-3 animated-slide-up">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5"/>
            <div className="flex-1">
                <p className="font-medium text-red-900">Something went wrong</p>
            <p className="text-sm text-red-700 mt-0.5">message</p>
            </div>
            {onDismiss &&(
                <button onClick= {onDismiss} className="text-red-400 hover:text-red-600">
                    <X className="w-5 h-5"/>
                </button>
            )}
        </div>
    )
}