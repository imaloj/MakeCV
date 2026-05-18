// eslint-disable-next-line no-unused-vars
import React from 'react'
import {Briefcase, AlertCircle} from 'lucide-react'
import {cn} from '../utils/cn.js'

const MIN_LENGTH=10
const MAX_LENGTH=20000

export default function JobDescriptionInput({value,onChange,error}){
    const charCount=value.MAX_LENGTH
    const isValid =charCount>=MIN_LENGTH

    return(
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>2.Job Description</h2>
                <span className={cn('text-xs font-medium',
                    charCount>MAX_LENGTH?'text-red-600':'text-gray-500'
                )}>
                    {charCount.toLocaleString()}/{MAX_LENGTH.toLocaleString()}
                </span>
            </div>
            <div className='relative'>
                <textarea
                value={value}
                onChange={(e)=>onChange(e.target.value)}
                placeholder='Paste the full job description here.. Include requiremrnts, responsibilities,and preferred skills.'
                className={cn('input-field mi-h-[200px] resize-y',
                    error&& 'border-red-300 focus:ring-red-500 focus:border-red-500'
                )}
                maxLength={MAX_LENGTH}
                />

                {error&&(
                    <div className='flex items-center gap-1.5 mt-2 text-sm text-red-600'>
                        <AlertCircle className='w-4 h-4'/>
                        <span>{error}</span>
                    </div>
                )}

                {!isValid && charCount>0&&(
                    <div className='flex items-center gap-1.5 mt-2 text-sm text-amber-600'>
                        <AlertCircle className='w-4 h-4'/>
                        <span>Minimum{MIN_LENGTH} characters required</span>
                    </div>
                )}
            </div>
            <div className='flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg'>
                <Briefcase className='w-4 h-4 mt-0.5 shrink-0'/>
                <p>
                    Tip: Include the full job posting for best result. The AI analyzes required skills, responsibilites, and compony culutre to tailor you CV,
                </p>
            </div>
        </div>
    )
}