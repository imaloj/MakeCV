// eslint-disable-next-line no-unused-vars
import React from 'react'
import {Settings, Wand2, ArrowUpDown,PenLine, Sparkles, FileText,FileDown, File } from 'lucide-react'
import {cn} from '../utils/cn.js'

const STRATEGIES = [
    {id:'smart-match',label:'Smart Match',icon:Wand2,desc:'Emphasize relevant skills & experiesnces'},
    {id:'reorder',label:'Reorder',icon: ArrowUpDown,desc:'Prioritize matching sections'},
    {id:'repharse',label:'Repharse',icon: PenLine,desc:'Use job description keywords'},
    {id:'full',label:'Full Custom',icon:Sparkles,desc:'Match+Reorder+Rephrase'},
]

const OUTPUT_FORMATS =[
   {id:'docx',label:'Word (DOCX))',icon:FileText,desc:'Editable Document'}, 
   {id:'pdf',label:'PDF',icon:FileDown,desc:'Ready to submit'} ,
   {id:'txt',label:'Plain Text',icon:File,desc:'ATS-friendly'}, 
]

export default function CustomizationOptions({options, onChange}){
    return(
        <div className='space-y-6'>
            <div className='flex item-center gap-2'>
                <Settings className='w-5 h-5 text-gray-2'/>
                <h2 className='text-lg font-semibold text-gray-900'>3. Customization Options</h2>
            </div>
            {/*strategy selection */}
            <div className='space-y-3'>
                <label className="label">Strategy</label>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {STRATEGIES.map((strategy)=>{
                        const Icon = strategy.icon
                        const isSelected= options.strategy=== strategy.id
                        return(
                            <button
                            key={strategy.id}
                            ionClick={()=>onChange({...options, strategy: strategy.id})}
                            className={cn('flex item-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-200',isSelected?
                                'border-primary-500 bg-primary-50'
                                :'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            )}
                            >
                                <Icon className={cn('w-5 h-5 my-0.5 shrink-0',
                                isSelected?'text-primary-600':'text-gray-400'
                            )}/>
                            <div>
                                <p className={cn('font-medium text-sm',
                                    isSelected?'text-primary-900':'text-gray-900'
                                )}>
                                    {strategy.label}
                                </p>
                                <p className='text-xs text-gray-500 mt-0.5'>{strategy.desc}</p>
                            </div>
                        </button>
                        )
                    })}
                </div>
            </div>
            {/*Output Format */}
            <div className='space-y-3'>
                <label className='label'>Output Format</label>
                <div className='flex gap-3'>
                    {OUTPUT_FORMATS.map((format)=>{
                        const Icon = format.icon
                        const isSelected= options.outputFormat=== format.id
                        return(
                            <button  key={format.id} onClick={()=>onChange({...options,outputFormat: format.id})}
                            className={cn(
                                'flex-1 flex flex-col item-center gap-2 p-4 rounded-lg border-2 transition-all duration-200',
                                isSelected
                                ?'border-primary-500 bg-primary-50'
                                :'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            )}
                            >
                                <Icon className={cn('w-6 h-6',
                                    isSelected?'text-primary-600':'text-gray-400'
                                )}/>
                                <div className='text-center'>
                                    <p className={cn(
                                        'font-medium text-sm',
                                        isSelected?'text-primary-900':'text-gray-900'
                                    )}>
                                        {format.label}
                                    </p>
                                    <p className='text-xs text-gray-500'>{format.desc}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/*Advanced options toggle */}
            <details className='group'>
                <summary className='flex item-center gap-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900'>
                    <span className='transition-transform group-open:route-90'></span>
                    Advanced Options
                </summary>
                <div className='mt-4 space-y-4 pl-4 border-1-2 border-gray-200'>
                    <div className='flex item-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-900'>Preserve Original</p>
                            <p className='text-xs text-gray-500'>Keep original content, only enhance</p>
                        </div>
                        <button
                        onClick={()=>onChange({...options, preserveOriginal:!options.preserveOriginal})}
                        className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            options.preserveOriginal?'bg-primary-600':"bg-gray-200"
                        )}
                    >
                        <span className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            options.preserveOriginal? 'translate-x-6':'translate-x-1'
                        )}/>
                    </button>
                    </div>
                    <div className='flex item-center justify-between'>
                        <div>
                        <p className='text-sm font-medium text-gray-900'>Highligh Changes</p>
                        <p className='text-xs text-gray-500'>Show what was modified</p>
                    </div>
                    <button onClick={()=> onChange({...options,highlightChanges:!options.highlightChanges})}
                    className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        options.highlightChanges?'bg-primary-600':'bg-gray-200'
                    )}
                    >
                        <span className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        options.highlightChanges?'translate-x-6': 'translate-x-1'
                        )}/>
                </button>
                </div>
             </div>
          </details>
        </div>
    )
}