
import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { TourStep, Language } from '../types';
import { t } from '../utils/translations';

interface TourGuideProps {
    run: boolean;
    onFinish: () => void;
    steps: TourStep[];
    language: Language;
}

export const TourGuide: React.FC<TourGuideProps> = ({ run, onFinish, steps, language }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [position, setPosition] = useState<{top: number, left: number, width: number, height: number} | null>(null);

    useEffect(() => {
        if (!run) return;
        
        const updatePosition = () => {
            const step = steps[currentIndex];
            const element = document.getElementById(step.targetId);
            
            if (element) {
                const rect = element.getBoundingClientRect();
                setPosition({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        // Delay slightly to ensure rendering
        setTimeout(updatePosition, 500);
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [currentIndex, run, steps]);

    if (!run || !position) return null;

    const currentStep = steps[currentIndex];

    const handleNext = () => {
        if (currentIndex < steps.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Dark Overlay with cutout using clip-path or huge borders. Using huge borders method for simplicity or multiple divs */}
            {/* Simpler method: Semi-transparent backdrop everywhere except the target hole */}
            <div className="absolute inset-0 bg-black/60 transition-all duration-300" style={{
                clipPath: `polygon(
                    0% 0%, 
                    0% 100%, 
                    ${position.left}px 100%, 
                    ${position.left}px ${position.top}px, 
                    ${position.left + position.width}px ${position.top}px, 
                    ${position.left + position.width}px ${position.top + position.height}px, 
                    ${position.left}px ${position.top + position.height}px, 
                    ${position.left}px 100%, 
                    100% 100%, 
                    100% 0%
                )`
            }}></div>

            {/* Highlight Ring */}
            <div 
                className="absolute border-2 border-emerald-400 rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-all duration-300 ease-out"
                style={{
                    top: position.top - 4,
                    left: position.left - 4,
                    width: position.width + 8,
                    height: position.height + 8,
                }}
            ></div>

            {/* Tooltip Card */}
            <div 
                className={`absolute w-[calc(100%-2rem)] max-w-sm left-4 md:left-auto md:w-80 bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95`}
                style={{
                    top: currentStep.position === 'bottom' ? position.top + position.height + 20 : 
                         currentStep.position === 'top' ? position.top - 180 : 
                         '50%',
                    left: currentStep.position === 'center' ? '50%' : (window.innerWidth > 768 ? position.left : '1rem'),
                    transform: currentStep.position === 'center' ? 'translate(-50%, -50%)' : 'none'
                }}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-emerald-700 dark:text-emerald-400">{currentStep.title}</h3>
                    <button onClick={onFinish} className="text-stone-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-stone-600 dark:text-stone-300 mb-6 text-sm leading-relaxed">{currentStep.content}</p>
                
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-400">{currentIndex + 1} / {steps.length}</span>
                    <button 
                        onClick={handleNext}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 flex items-center"
                    >
                        {currentIndex === steps.length - 1 ? t('tour_finish', language) : t('tour_next', language)}
                        {currentIndex !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
