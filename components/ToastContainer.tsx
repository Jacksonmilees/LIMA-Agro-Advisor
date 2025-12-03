import React from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Toast } from '../types';

interface ToastContainerProps { 
    toasts: Toast[]; 
    removeToast: (id: string) => void 
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-20 md:top-auto md:bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4 md:px-0">
            {toasts.map(toast => (
                <div 
                    key={toast.id} 
                    className={`flex items-center p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-top-full md:slide-in-from-right-full duration-300 pointer-events-auto ${
                        toast.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' :
                        toast.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-800' :
                        'bg-blue-50/95 border-blue-200 text-blue-800'
                    }`}
                >
                    {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />}
                    {toast.type === 'error' && <AlertCircle className="w-5 h-5 mr-3 shrink-0" />}
                    {toast.type === 'info' && <Info className="w-5 h-5 mr-3 shrink-0" />}
                    <p className="text-sm font-bold tracking-wide">{toast.message}</p>
                    <button onClick={() => removeToast(toast.id)} className="ml-auto opacity-50 hover:opacity-100 p-1"><X className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
    );
};