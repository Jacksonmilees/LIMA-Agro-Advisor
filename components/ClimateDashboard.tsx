
import React, { useEffect, useState } from 'react';
import { CloudRain, Sun, Thermometer, AlertTriangle, ArrowUpRight, Droplets, Leaf, Info, Map, ChevronRight, FileText, ArrowLeft, BarChart3, Wind } from 'lucide-react';
import { ClimateRiskData } from '../types';
import { getClimateRiskData } from '../services/climateService';

interface ClimateDashboardProps {
    location: string;
}

const ClimateDashboard: React.FC<ClimateDashboardProps> = ({ location }) => {
    const [data, setData] = useState<ClimateRiskData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        setLoading(true);
        getClimateRiskData(location).then(res => {
            setData(res);
            setLoading(false);
        });
    }, [location]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="text-stone-500 text-sm animate-pulse">Contacting satellites & weather stations...</p>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-stone-500">Climate data unavailable.</div>;

    const getRiskColor = (score: number) => {
        if (score < 40) return 'text-emerald-500';
        if (score < 60) return 'text-yellow-500';
        if (score < 80) return 'text-orange-500';
        return 'text-red-500';
    };

    const getRiskBg = (score: number) => {
        if (score < 40) return 'bg-emerald-500';
        if (score < 60) return 'bg-yellow-500';
        if (score < 80) return 'bg-orange-500';
        return 'bg-red-500';
    };

    // Detailed Report View
    if (showReport) {
        return (
            <div className="flex flex-col h-full bg-stone-50 pb-32 md:pb-10 animate-in slide-in-from-right">
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 md:py-6 shadow-sm border-b border-white/40 sticky top-0 z-20 flex items-center gap-4">
                    <button onClick={() => setShowReport(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-stone-600" />
                    </button>
                    <div>
                         <h2 className="text-xl font-bold text-stone-900">Climate Risk Report</h2>
                         <p className="text-xs text-stone-500">Executive Analysis for {location}</p>
                    </div>
                </div>
                
                <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
                    {/* Executive Summary */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4 border-b border-stone-100 pb-4">
                            <div>
                                <h3 className="font-bold text-lg text-stone-800">Executive Summary</h3>
                                <p className="text-sm text-stone-500">Assessment Period: Next 30 Days</p>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-xs font-bold text-white ${getRiskBg(data.score)}`}>
                                RISK: {data.level} ({data.score}/100)
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">Key Findings</h4>
                                <ul className="space-y-2 text-sm text-stone-700">
                                    <li className="flex items-start"><span className="mr-2">•</span> Rainfall Deficit: {data.factors.drought.rainfallDeficit}% below normal</li>
                                    <li className="flex items-start"><span className="mr-2">•</span> Vegetation Stress: {data.factors.vegetation.stressLevel} ({data.factors.vegetation.ndviDrop}% drop)</li>
                                    <li className="flex items-start"><span className="mr-2">•</span> Soil Moisture: {data.factors.soil.moisture}% ({data.factors.soil.label})</li>
                                </ul>
                            </div>
                             <div>
                                <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">Immediate Action</h4>
                                <div className={`p-4 rounded-xl border-l-4 ${data.score > 60 ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'}`}>
                                    <p className="font-bold text-stone-800 text-sm">
                                        {data.score > 60 ? "DELAY PLANTING / CONSERVE WATER" : "OPTIMAL PLANTING WINDOW OPEN"}
                                    </p>
                                    <p className="text-xs text-stone-600 mt-1">
                                        {data.score > 60 
                                            ? "Critical risk factors identified. Insurance triggers are approaching." 
                                            : "Conditions are favorable for crop establishment."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Analysis Charts (Simulated Bars) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                            <h4 className="font-bold text-stone-800 mb-4 flex items-center"><CloudRain className="w-4 h-4 mr-2"/> Rainfall Analysis</h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Current Season Cumulative</span>
                                        <span className="font-bold">55mm</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full" style={{width: '40%'}}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Historical Average</span>
                                        <span className="font-bold">142mm</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full"><div className="bg-stone-400 h-2 rounded-full" style={{width: '90%'}}></div></div>
                                </div>
                                <p className="text-xs text-red-500 mt-2 font-medium">Deficit: -87mm ({data.factors.drought.rainfallDeficit}%)</p>
                            </div>
                        </div>

                         <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                            <h4 className="font-bold text-stone-800 mb-4 flex items-center"><Leaf className="w-4 h-4 mr-2"/> Vegetation Health (NDVI)</h4>
                            <div className="space-y-4">
                                <div className="flex items-end justify-between h-24 gap-2">
                                    {[0.65, 0.62, 0.58, 0.55, 0.52, 0.51].map((val, i) => (
                                        <div key={i} className="w-full bg-emerald-100 rounded-t-lg relative group">
                                            <div 
                                                className={`absolute bottom-0 w-full rounded-t-lg transition-all ${i === 5 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                                style={{height: `${val * 100}%`}}
                                            ></div>
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] text-stone-400 uppercase font-bold">
                                    <span>3 Months Ago</span>
                                    <span>Today</span>
                                </div>
                                <p className="text-xs text-orange-600 mt-2 font-medium">Stress Detected: {data.factors.vegetation.ndviDrop}% Drop</p>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-all">
                        <FileText className="w-4 h-4" /> Download Full PDF Report
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-transparent pb-32 md:pb-10">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 md:py-6 shadow-sm border-b border-white/40 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-stone-900 flex items-center">
                            <CloudRain className="mr-3 text-emerald-600" /> Climate Intelligence
                        </h2>
                        <p className="text-xs md:text-sm text-stone-500 mt-1">Real-time satellite monitoring for {location}.</p>
                    </div>
                    <div className="bg-stone-100 px-3 py-1 rounded-full text-xs font-bold text-stone-500 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Live
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
                
                {/* Top Section: Risk Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gauge Card */}
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/50 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-full h-2 ${getRiskBg(data.score)}`}></div>
                        <h3 className="text-stone-500 font-bold uppercase text-xs tracking-widest mb-4">Composite Risk Score</h3>
                        
                        <div className="relative w-40 h-40 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#f5f5f4" strokeWidth="12" fill="none" />
                                <circle 
                                    cx="80" 
                                    cy="80" 
                                    r="70" 
                                    stroke="currentColor" 
                                    strokeWidth="12" 
                                    fill="none" 
                                    strokeDasharray="440" 
                                    strokeDashoffset={440 - (440 * data.score) / 100} 
                                    className={`${getRiskColor(data.score)} transition-all duration-1000 ease-out`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-extrabold ${getRiskColor(data.score)}`}>{data.score}</span>
                                <span className="text-xs font-bold text-stone-400">/ 100</span>
                            </div>
                        </div>
                        
                        <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wide ${getRiskBg(data.score)}`}>
                            {data.level} RISK
                        </div>
                        <p className="text-xs text-stone-400 mt-2 flex items-center">
                            Trend: {data.trend === 'increasing' ? '↗️ Worsening' : data.trend === 'decreasing' ? '↘️ Improving' : '→ Stable'}
                        </p>
                    </div>

                    {/* Risk Factors */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white/70 p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg"><CloudRain className="w-4 h-4 text-blue-600" /></div>
                                <span className="font-bold text-stone-700 text-sm">Drought</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-stone-500">Deficit</span>
                                    <span className="font-bold text-red-500">-{data.factors.drought.rainfallDeficit}%</span>
                                </div>
                                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full" style={{width: `${data.factors.drought.score}%`}}></div>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-1">{data.factors.drought.daysSinceRain} days since rain</p>
                            </div>
                        </div>

                        <div className="bg-white/70 p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between hover:border-green-200 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg"><Leaf className="w-4 h-4 text-green-600" /></div>
                                <span className="font-bold text-stone-700 text-sm">Vegetation</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-stone-500">NDVI Drop</span>
                                    <span className="font-bold text-orange-500">{data.factors.vegetation.ndviDrop}%</span>
                                </div>
                                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full" style={{width: `${data.factors.vegetation.score}%`}}></div>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-1">{data.factors.vegetation.label}</p>
                            </div>
                        </div>

                        <div className="bg-white/70 p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between hover:border-amber-200 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-amber-100 rounded-lg"><Droplets className="w-4 h-4 text-amber-600" /></div>
                                <span className="font-bold text-stone-700 text-sm">Soil Moisture</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-stone-500">Moisture</span>
                                    <span className="font-bold text-amber-600">{data.factors.soil.moisture}%</span>
                                </div>
                                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full" style={{width: `${data.factors.soil.score}%`}}></div>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-1">Wilting in {data.factors.soil.wiltingDays} days</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations & Forecast */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recommendations */}
                    <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-lg border border-white/50 p-6 flex flex-col">
                        <h3 className="font-bold text-stone-800 mb-4 flex items-center justify-between">
                            <span className="flex items-center"><Info className="w-5 h-5 mr-2 text-emerald-600" /> Smart Recommendations</span>
                        </h3>
                        <div className="space-y-3 flex-1">
                            {data.recommendations.map(rec => (
                                <div key={rec.id} className={`p-4 rounded-xl border-l-4 ${
                                    rec.priority === 'CRITICAL' ? 'bg-red-50 border-red-500' :
                                    rec.priority === 'HIGH' ? 'bg-orange-50 border-orange-500' :
                                    'bg-blue-50 border-blue-500'
                                }`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                            rec.priority === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                                            rec.priority === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                                            'bg-blue-200 text-blue-800'
                                        }`}>{rec.priority}</span>
                                    </div>
                                    <p className="font-bold text-stone-800 text-sm">{rec.action}</p>
                                    <p className="text-xs text-stone-500 mt-1">{rec.reason}</p>
                                    <p className="text-xs font-medium mt-2 flex items-center gap-1 opacity-80">
                                        <ArrowUpRight className="w-3 h-3" /> Impact: {rec.impact}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 7-Day Forecast */}
                    <div className="flex flex-col gap-6">
                         <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-[2rem] shadow-lg p-6 flex flex-col relative overflow-hidden flex-1">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                             <h3 className="font-bold mb-6 flex items-center relative z-10">
                                 <Sun className="w-5 h-5 mr-2 text-yellow-400" /> 7-Day Forecast
                             </h3>
                             <div className="flex-1 overflow-x-auto pb-2 relative z-10 custom-scrollbar">
                                 <div className="flex justify-between min-w-[300px] gap-2">
                                     {data.forecast.map((day, idx) => (
                                         <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-white/10 border border-white/10 min-w-[60px]">
                                             <span className="text-xs font-medium opacity-70 mb-2">{day.day}</span>
                                             {day.rainProb > 50 ? <CloudRain className="w-6 h-6 mb-2 text-blue-300" /> : <Sun className="w-6 h-6 mb-2 text-yellow-300" />}
                                             <span className="font-bold text-lg">{day.temp}°</span>
                                             <div className="mt-2 text-[10px] flex items-center bg-black/20 px-1.5 py-0.5 rounded-full">
                                                 <Droplets className="w-2 h-2 mr-1 text-blue-300" /> {day.rainProb}%
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                        </div>

                        {/* Interactive Map Button */}
                        <div 
                            onClick={() => setShowReport(true)}
                            className="bg-stone-200 rounded-[2rem] h-32 relative overflow-hidden group cursor-pointer border-4 border-white shadow-lg transition-transform active:scale-[0.98]"
                        >
                            <img src="https://images.unsplash.com/photo-1524055988636-436cfa46e59e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Satellite Map" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white group-hover:bg-black/50 transition-colors">
                                <FileText className="w-8 h-8 mb-2 text-emerald-400" />
                                <h3 className="font-bold text-lg">View Full Report</h3>
                                <p className="text-xs opacity-90 flex items-center">Tap to see detailed analysis <ChevronRight className="w-3 h-3 ml-1" /></p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClimateDashboard;
