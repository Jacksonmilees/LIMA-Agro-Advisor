import React, { useState } from 'react';
import { ExpenseRecord } from '../types';

interface AddExpenseModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (e: ExpenseRecord) => void 
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseRecord['category']>('Other');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            id: Date.now().toString(),
            category,
            amount: parseFloat(amount) || 0,
            date,
            note
        });
        setAmount(''); setNote(''); onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <h3 className="font-bold text-lg mb-4 text-stone-800">Log Expense</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Amount (KES)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-3 rounded-xl bg-stone-50 outline-none" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full border p-3 rounded-xl bg-stone-50 outline-none">
                                <option>Seeds</option>
                                <option>Fertilizer</option>
                                <option>Labor</option>
                                <option>Transport</option>
                                <option>Equipment</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Note (Optional)</label>
                            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border p-3 rounded-xl bg-stone-50 outline-none" placeholder="Details..." />
                        </div>
                         <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700">Save Expense</button>
                            <button onClick={onClose} className="px-6 bg-stone-100 text-stone-600 p-3 rounded-xl font-bold hover:bg-stone-200">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};