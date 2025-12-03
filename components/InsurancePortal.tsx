
import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, FileCheck, Phone, Download, Umbrella, CheckCircle2, AlertTriangle, TrendingDown, Calculator, RefreshCw } from 'lucide-react';
import { InsurancePolicy, UserProfile } from '../types';
import { getInsurancePolicy } from '../services/climateService';

interface InsurancePortalProps {
    userProfile: UserProfile;
}

const InsurancePortal: React.FC<InsurancePortalProps> = ({ userProfile }) => {
    const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Simulator State
    const [simRainfall, setSimRainfall] = useState(50);
    const [simNDVI, setSimNDVI] = useState(0);

    useEffect(() => {
        setLoading(true);
        getInsurancePolicy(userProfile).then(p => {
            setPolicy(p);
            setLoading(false);
        });
    }, [userProfile]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!policy) return <div className="p-8 text-center text-stone-500">Insurance data unavailable.</div>;

    const calculateSimulatedPayout = () => {
        // Simple logic for simulation visualization
        if (!policy) return 0;
        let payout = 0;
        const maxPayout = policy.coverageAmount;
        
        // Rainfall trigger logic (Simulated)
        if (simRainfall < 50) {
            const severity = (50 - simRainfall) / 50; 
            payout = Math.max(payout, maxPayout * severity);
        }

        // NDVI trigger logic (Simulated)
        if (simNDVI < -20) {
            const severity = Math.min(1, Math.abs(simNDVI) / 40);
            payout = Math.max(payout, maxPayout * severity);
        }

        return Math.min(Math.round(payout), maxPayout);
    };

    return (
        <div className="flex flex-col h-full bg-transparent pb-32 md:pb-10">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 md:py-6 shadow-sm border-b border-white/40 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-stone-900 flex items-center">
                            <ShieldCheck className="mr-3 text-emerald-600" /> Insurance Portal
                        </h2>
                        <p className="text-xs md:text-sm text-stone-500 mt-1">Parametric Coverage Management.</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center ${
                        policy.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        policy.status === 'WARNING' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                        'bg-stone-200 text-stone-500'
                    }`}>
                        {policy.status === 'WARNING' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {policy.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {policy.status}
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
                
                {/* Policy Summary Card */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Policy Number</h3>
                                <p className="font-mono text-lg tracking-wider">{policy.id}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Provider</h3>
                                <p className="font-bold">{policy.provider}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div>
                                <span className="text-xs text-slate-400 block mb-1">Coverage</span>
                                <span className="text-xl font-bold text-emerald-400">KES {policy.coverageAmount.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block mb-1">Premium Paid</span>
                                <span className="text-xl font-bold">KES {policy.premium.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block mb-1">Crop</span>
                                <span className="text-xl font-bold">{policy.crop}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block mb-1">Time Remaining</span>
                                <span className="text-xl font-bold">{policy.daysRemaining} days</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-colors">
                                <Download className="w-4 h-4 mr-2" /> Certificate
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-colors">
                                <Phone className="w-4 h-4 mr-2" /> Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trigger Monitoring */}
                <h3 className="font-bold text-lg text-stone-800 mt-2">Trigger Monitoring</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {policy.triggers.map((trigger, idx) => (
                        <div key={idx} className={`bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border-2 transition-all ${
                            trigger.status === 'WARNING' ? 'border-orange-300 shadow-orange-100' : 
                            trigger.status === 'CRITICAL' ? 'border-red-300 shadow-red-100' :
                            'border-white/50'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-stone-700">{trigger.type}</h4>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                    trigger.status === 'WARNING' ? 'bg-orange-100 text-orange-700' :
                                    trigger.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                    'bg-emerald-100 text-emerald-700'
                                }`}>{trigger.status}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Current: <strong className="text-stone-800">{trigger.currentValue}</strong></span>
                                    <span className="text-stone-500">Trigger: <strong className="text-red-600">{trigger.threshold}</strong></span>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-stone-600">Progress to Trigger</span>
                                        <span className="font-bold text-stone-600">{trigger.progress}%</span>
                                    </div>
                                    <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${
                                                trigger.progress > 80 ? 'bg-red-500' :
                                                trigger.progress > 50 ? 'bg-orange-500' :
                                                'bg-emerald-500'
                                            }`} 
                                            style={{width: `${trigger.progress}%`}}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs text-stone-500 flex items-center">
                                    <TrendingDown className="w-4 h-4 mr-2 text-stone-400" />
                                    Trend is {trigger.trend}. Monitor closely.
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payout Simulator */}
                <div className="bg-emerald-50/50 backdrop-blur-md rounded-[2rem] border border-emerald-100 p-6">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                            <Calculator className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-emerald-900">Payout Simulator</h3>
                            <p className="text-xs text-emerald-700">Adjust sliders to see potential payouts.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div>
                                <label className="flex justify-between text-xs font-bold text-stone-500 mb-2">
                                    <span>Simulated Rainfall (30-day)</span>
                                    <span>{simRainfall} mm</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={simRainfall} 
                                    onChange={(e) => setSimRainfall(Number(e.target.value))}
                                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                                    <span>0mm (Severe)</span>
                                    <span>50mm (Trigger)</span>
                                    <span>100mm (Normal)</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="flex justify-between text-xs font-bold text-stone-500 mb-2">
                                    <span>Simulated NDVI Drop</span>
                                    <span>{simNDVI}%</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="-50" 
                                    max="0" 
                                    value={simNDVI} 
                                    onChange={(e) => setSimNDVI(Number(e.target.value))}
                                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                                    <span>-50% (Dead)</span>
                                    <span>-20% (Stress)</span>
                                    <span>0% (Healthy)</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 text-center border border-emerald-100 shadow-sm">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Estimated Payout</p>
                            <p className="text-3xl font-extrabold text-emerald-600">
                                KES {calculateSimulatedPayout().toLocaleString()}
                            </p>
                            <p className="text-xs text-stone-500 mt-2">
                                Based on current policy terms.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Claims History */}
                <div className="bg-white/70 backdrop-blur-md rounded-[2rem] shadow-lg border border-white/50 p-6">
                     <h3 className="font-bold text-lg text-stone-800 mb-4">Payout History</h3>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-stone-600">
                             <thead className="text-xs text-stone-400 uppercase bg-stone-50/50">
                                 <tr>
                                     <th className="px-4 py-3 rounded-l-xl">Date</th>
                                     <th className="px-4 py-3">Event</th>
                                     <th className="px-4 py-3">Amount</th>
                                     <th className="px-4 py-3 rounded-r-xl">Status</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {policy.claimsHistory.map((claim, i) => (
                                     <tr key={i} className="border-b border-stone-100 hover:bg-stone-50/50">
                                         <td className="px-4 py-3 font-medium">{claim.date}</td>
                                         <td className="px-4 py-3">{claim.trigger}</td>
                                         <td className="px-4 py-3 font-bold text-emerald-600">KES {claim.amount.toLocaleString()}</td>
                                         <td className="px-4 py-3">
                                             <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{claim.status}</span>
                                         </td>
                                     </tr>
                                 ))}
                                 {policy.claimsHistory.length === 0 && (
                                     <tr>
                                         <td colSpan={4} className="px-4 py-6 text-center text-stone-400 italic">No claims filed yet.</td>
                                     </tr>
                                 )}
                             </tbody>
                         </table>
                     </div>
                </div>

            </div>
        </div>
    );
};

export default InsurancePortal;
