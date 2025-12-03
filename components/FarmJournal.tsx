

import React, { useState } from 'react';
import { Calendar, Droplets, Bug, Sprout, Leaf, Save, Plus, Clock, FileText, Trash2, CalendarDays, Loader2, X } from 'lucide-react';
import { FarmActivity, Language, Reminder, CropType } from '../types';
import { generateCropCalendar } from '../services/geminiService';
import { t } from '../utils/translations';

interface FarmJournalProps {
    activities: FarmActivity[];
    onAddActivity: (activity: FarmActivity) => void;
    onDeleteActivity: (id: string) => void;
    onAddReminders?: (reminders: Reminder[]) => void;
    language: Language;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const FarmJournal: React.FC<FarmJournalProps> = ({ activities, onAddActivity, onDeleteActivity, onAddReminders, language, showToast }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    
    // Form State
    const [type, setType] = useState<FarmActivity['type']>('Scouting');
    const [details, setDetails] = useState('');
    const [quantity, setQuantity] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // Planner State
    const [plannerCrop, setPlannerCrop] = useState<string>('Maize');
    const [plannerDate, setPlannerDate] = useState(new Date().toISOString().split('T')[0]);
    const [generatingSchedule, setGeneratingSchedule] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newActivity: FarmActivity = {
            id: Date.now().toString(),
            type,
            details,
            quantity: quantity || undefined,
            date,
            notes: notes || undefined
        };
        onAddActivity(newActivity);
        setIsFormOpen(false);
        setDetails(''); setQuantity(''); setNotes('');
        showToast(t('save_entry', language), "success");
    };

    const handleGenerateSchedule = async () => {
        setGeneratingSchedule(true);
        try {
            const tasks = await generateCropCalendar(plannerCrop, plannerDate, "Kenya", language);
            if (tasks && tasks.length > 0 && onAddReminders) {
                const newReminders: Reminder[] = tasks.map((t: any) => ({
                    id: Date.now().toString() + Math.random().toString(),
                    text: t.text,
                    date: t.date,
                    type: 'Task',
                    completed: false
                }));
                onAddReminders(newReminders);
                showToast(`Generated ${tasks.length} tasks!`, "success");
                setIsPlannerOpen(false);
            } else {
                showToast("Could not generate schedule.", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to connect to AI.", "error");
        } finally {
            setGeneratingSchedule(false);
        }
    };

    const getTypeIcon = (type: FarmActivity['type']) => {
        switch(type) {
            case 'Pesticide': return <Bug className="w-4 h-4 text-red-500" />;
            case 'Fertilizer': return <Sprout className="w-4 h-4 text-amber-500" />;
            case 'Irrigation': return <Droplets className="w-4 h-4 text-blue-500" />;
            case 'Planting': return <Leaf className="w-4 h-4 text-emerald-500" />;
            case 'Scouting': return <Clock className="w-4 h-4 text-purple-500" />;
            default: return <FileText className="w-4 h-4 text-stone-500" />;
        }
    };

    // Fix for sorting: Ensure we don't mutate original array if strict mode is on
    const sortedActivities = [...activities].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="flex flex-col bg-transparent pb-32 md:pb-10 min-h-full">
            {/* Header - Glass */}
            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md p-4 md:p-6 shadow-sm sticky top-0 z-20 border-b border-white/40 dark:border-white/10 transition-colors">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center">
                            <Calendar className="mr-3 text-emerald-600" /> 
                            {t('journal_title', language)}
                        </h2>
                        <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-1">Record activities for AI insights.</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsPlannerOpen(true)}
                            className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-600/20 flex items-center hover:bg-purple-700 transition-all active:scale-95 text-xs md:text-sm"
                        >
                            <CalendarDays className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">{t('plan_season', language)}</span>
                        </button>
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-700/20 flex items-center hover:bg-emerald-800 transition-all active:scale-95 text-xs md:text-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('add_entry', language)}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6 flex-1 overflow-visible">
                
                {/* AI Planner Modal */}
                {isPlannerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
                        <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-2xl w-full max-w-md p-6 border border-white/50 dark:border-stone-700 animate-in zoom-in-95">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-purple-900 dark:text-purple-300 flex items-center">
                                    <CalendarDays className="w-5 h-5 mr-2" /> AI Season Planner
                                </h3>
                                <button onClick={() => setIsPlannerOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2">Crop</label>
                                    <select 
                                        value={plannerCrop}
                                        onChange={(e) => setPlannerCrop(e.target.value)}
                                        className="w-full border border-stone-200 dark:border-stone-700 p-3 rounded-xl bg-stone-50 dark:bg-stone-900 outline-none dark:text-stone-200"
                                    >
                                        {Object.values(CropType).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2">Planting Date</label>
                                    <input 
                                        type="date"
                                        value={plannerDate}
                                        onChange={(e) => setPlannerDate(e.target.value)}
                                        className="w-full border border-stone-200 dark:border-stone-700 p-3 rounded-xl bg-stone-50 dark:bg-stone-900 outline-none dark:text-stone-200"
                                    />
                                </div>
                                <button 
                                    onClick={handleGenerateSchedule}
                                    disabled={generatingSchedule}
                                    className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-600/20 active:scale-[0.98] flex items-center justify-center"
                                >
                                    {generatingSchedule ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating Schedule...</>
                                    ) : (
                                        "Generate Schedule"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Entry Form */}
                {isFormOpen && (
                    <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl border border-white/50 dark:border-stone-700 animate-in slide-in-from-top-4">
                        <h3 className="font-bold text-lg mb-6 text-stone-800 dark:text-stone-100">New Journal Entry</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2">Activity Type</label>
                                <select 
                                    value={type} 
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full border border-stone-200 dark:border-stone-600 p-3 rounded-xl bg-white/50 dark:bg-stone-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none dark:text-white"
                                >
                                    <option>Scouting</option>
                                    <option>Pesticide</option>
                                    <option>Fertilizer</option>
                                    <option>Irrigation</option>
                                    <option>Planting</option>
                                    <option>Harvesting</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2">Date</label>
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border border-stone-200 dark:border-stone-600 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/50 dark:bg-stone-700 dark:text-white" 
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2">Details</label>
                                <input 
                                    type="text" 
                                    value={details} 
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="e.g. Sprayed Dude 450..."
                                    className="w-full border border-stone-200 dark:border-stone-600 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/50 dark:bg-stone-700 dark:text-white" 
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2">Quantity</label>
                                <input 
                                    type="text" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="e.g. 50kg"
                                    className="w-full border border-stone-200 dark:border-stone-600 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/50 dark:bg-stone-700 dark:text-white" 
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2">Notes</label>
                                <input 
                                    type="text" 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g. Windy day..."
                                    className="w-full border border-stone-200 dark:border-stone-600 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/50 dark:bg-stone-700 dark:text-white" 
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-4 mt-2">
                                <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-[0.98]">{t('save_entry', language)}</button>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-200 font-bold py-3.5 rounded-xl hover:bg-stone-200">{t('cancel', language)}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Timeline */}
                <div className="space-y-4 pb-20">
                    {sortedActivities.length === 0 ? (
                        <div className="text-center py-12 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-700">
                            <FileText className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
                            <p className="text-stone-400 dark:text-stone-500 font-medium">{t('no_entries', language)}</p>
                        </div>
                    ) : (
                        sortedActivities.map(activity => (
                            <div key={activity.id} className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white/50 dark:border-stone-700 flex gap-4 md:gap-5 group hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all">
                                <div className="flex flex-col items-center">
                                    <div className="p-2.5 bg-white dark:bg-stone-700 rounded-xl border border-stone-100 dark:border-stone-600 shadow-sm shrink-0">
                                        {getTypeIcon(activity.type)}
                                    </div>
                                    <div className="h-full w-0.5 bg-stone-100 dark:bg-stone-700 mt-3 rounded-full"></div>
                                </div>
                                <div className="flex-1 pb-2 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">{activity.date}</p>
                                            <h4 className="font-bold text-stone-800 dark:text-stone-200 text-base md:text-lg leading-snug break-words">{activity.details}</h4>
                                        </div>
                                        <div className="flex items-center gap-2 pl-2">
                                            <span className="hidden md:inline-block px-2.5 py-1 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs rounded-lg font-bold uppercase tracking-wide shadow-sm">{activity.type}</span>
                                            <button onClick={() => onDeleteActivity(activity.id)} className="text-stone-300 hover:text-red-400 md:opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3 text-xs md:text-sm text-stone-600 dark:text-stone-400">
                                        <span className="md:hidden px-2 py-0.5 bg-stone-100 dark:bg-stone-700 rounded text-[10px] font-bold uppercase">{activity.type}</span>
                                        {activity.quantity && (
                                            <span className="flex items-center bg-stone-50 dark:bg-stone-700/50 border border-stone-100 dark:border-stone-600 px-2 py-1 rounded-lg">
                                                <span className="font-bold mr-1">Qty:</span> {activity.quantity}
                                            </span>
                                        )}
                                        {activity.notes && (
                                            <span className="flex items-center italic text-stone-500 dark:text-stone-500 bg-stone-50/50 dark:bg-stone-900/30 px-2 py-1 rounded-lg truncate max-w-full">
                                                "{activity.notes}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmJournal;
