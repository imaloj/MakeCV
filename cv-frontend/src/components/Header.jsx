/* eslint-disable no-unused-vars */
import React from 'react'
import {FileText, Zap} from 'lucide-react'

export default function Header(){
    return(
        <header className='bg-white border-b border-gray-200'>
            <div className='max-w-4xl mx-auto px-4 py-5'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-primary-100 rounded-lg'>
                        <FileText className='w-7 h-7 text-primary-600'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-gray-900'>AFNO CV</h1>
                        <p className='text-sm text-gray-500 flex-items-center gap-1'>
                            <Zap className='w-3.5 h-3.5'/>
                            AI-Powered Resume Tailoring
                        </p>
                    </div>
                </div>
            </div>
        </header>
    )
}