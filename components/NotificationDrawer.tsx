import React from 'react';
import { X, Bell, Clock } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDrawerProps { 
    isOpen: boolean; 
    onClose: () => void; 
    notifications: AppNotification[]; 
    onClear: () => void 
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, notifications, onClear }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose}></div>
            <div className="fixed bottom-0 md:top-0 md:right-0 md:bottom-0 md:w-96 w-full h-[80vh] md:h-full bg-white/90 backdrop-blur-xl shadow-2xl z-[70] rounded-t-3xl md:rounded-none md:rounded-l-3xl border-l border-white/50 flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
                <div className="p-6 border-b border-stone-200/50 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-stone-800 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-emerald-600" /> Notifications
                    </h3>
                    <div className="flex items-center gap-2">
                         {notifications.length > 0 && (
                            <button onClick={onClear} className="text-xs font-bold text-stone-400 hover:text-red-500 px-3 py-1 rounded-full hover:bg-red-50 transition-colors">
                                Clear All
                            </button>
                         )}
                         <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full"><X className="w-5 h-5 text-stone-500" /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-60">
                            <Bell className="w-12 h-12 mb-3 stroke-1" />
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div key={notif.id} className="p-4 bg-white/50 border border-white/60 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm text-stone-800">{notif.title}</h4>
                                    <span className="text-[10px] text-stone-400 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-600 leading-relaxed">{notif.message}</p>
                                <div className={`mt-2 h-1 w-full rounded-full ${
                                    notif.type === 'activity' ? 'bg-emerald-100' : 
                                    notif.type === 'alert' ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                    <div className={`h-full rounded-full w-1/3 ${
                                        notif.type === 'activity' ? 'bg-emerald-400' : 
                                        notif.type === 'alert' ? 'bg-red-400' : 'bg-blue-400'
                                    }`}></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}