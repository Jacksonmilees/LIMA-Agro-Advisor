import React, { useState } from 'react';
import { FarmRecord, MarketComparisonItem, CropType } from '../types';
import { generateMarketComparison } from '../services/geminiService';

interface AddRecordModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (r: FarmRecord) => void 
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({ isOpen, onClose, onSave }) => {
    const [crop, setCrop] = useState('Maize');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('Bags');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<'Sold' | 'Stored'>('Stored');
    const [soldPrice, setSoldPrice] = useState('');
    
    // Unused state left for future implementation or removal
    const [findingMarkets, setFindingMarkets] = useState(false);
    const [markets, setMarkets] = useState<MarketComparisonItem[]>([]);
    const [selectedMarket, setSelectedMarket] = useState<MarketComparisonItem | null>(null);

    if (!isOpen) return null;

    const handleSave = () => {
        const record: FarmRecord = { 
            id: Date.now().toString(), 
            crop, 
            amount: parseFloat(amount), 
            unit, 
            date, 
            status, 
            estimatedValue: status === 'Sold' ? parseFloat(soldPrice) : undefined, 
            marketName: selectedMarket?.marketName 
        };
        onSave(record);
        reset();
    };

    const reset = () => {
        setAmount(''); setMarkets([]); setSelectedMarket(null); onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-sm">
             <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto border border-white/50">
                 <div className="p-6">
                     <h3 className="font-bold text-lg mb-4 text-stone-800">Log Harvest</h3>
                     
                     <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Crop</label>
                            <select value={crop} onChange={e => setCrop(e.target.value)} className="w-full border p-3 rounded-xl bg-stone-50 outline-none">
                                {Object.values(CropType).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Amount</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-3 rounded-xl bg-stone-50 outline-none" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Unit</label>
                                <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full border p-3 rounded-xl bg-stone-50 outline-none">
                                    <option>Bags (90kg)</option>
                                    <option>Kg</option>
                                    <option>Crates</option>
                                    <option>Pieces</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Status</label>
                            <div className="flex gap-2">
                                <button onClick={() => setStatus('Stored')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${status === 'Stored' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>Stored</button>
                                <button onClick={() => setStatus('Sold')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${status === 'Sold' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>Sold</button>
                            </div>
                        </div>

                        {status === 'Sold' && (
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Total Sale Value (KES)</label>
                                <input type="number" value={soldPrice} onChange={e => setSoldPrice(e.target.value)} className="w-full border p-3 rounded-xl bg-stone-50 outline-none" placeholder="0" />
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700">Save Record</button>
                            <button onClick={reset} className="px-6 bg-stone-100 text-stone-600 p-3 rounded-xl font-bold hover:bg-stone-200">Cancel</button>
                        </div>
                     </div>
                 </div>
             </div>
        </div>
    )
};