import { Zap} from 'lucide-react';
import logo from "../assets/AfnoCVlogo.png"

export default function Header(){
    return(
        <header className='bg-indigo-600 border-b border-gray-200'>
            <div className='max-w-10xl mx-auto px-4 py-5'>
                <div className='flex items-center gap-3'>
                    <img
                    src={logo}
                    alt="AFNO CV Logo"
                    className='w-16 h-16 object-contain'/>
                    <div>
                        <h1 className='text-xl font-bold text-white'>AFNO CV</h1>
                        <p className='text-sm text-white flex items-center gap-1'>
                            <Zap className='w-3.5 h-3.5'/>
                            AI-Powered Resume Tailoring
                        </p>
                    </div>
                </div>
            </div>
        </header>
    )
}