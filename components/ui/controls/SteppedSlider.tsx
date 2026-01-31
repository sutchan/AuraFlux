/**
 * File: components/ui/controls/SteppedSlider.tsx
 * Version: 1.8.32
 * Author: Sut
 * Updated: 2025-03-24 19:10 - Fix interactivity
 */

import React, { memo } from 'react';
import { TooltipArea } from './Tooltip';

interface SteppedSliderProps {
    label: string; 
    value: number; 
    min: number; 
    max: number; 
    step: number; 
    onChange: (val: number) => void; 
    options?: {value: number, label: string}[]; 
    hintText?: string;
}

export const SteppedSlider = memo(({ label, value, min, max, step, onChange, options, hintText }: SteppedSliderProps) => {
    const isDiscrete = options && options.length > 1;
    const safeValue = value ?? 0;
    const percentage = ((safeValue - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newVal = parseFloat(e.target.value);
        if (isDiscrete && options) {
            const closest = options.reduce((prev, curr) => 
                Math.abs(curr.value - newVal) < Math.abs(prev.value - newVal) ? curr : prev
            );
            newVal = closest.value;
        }
        onChange(newVal);
    };

    let displayLabel = safeValue.toString();
    if (options) {
        const match = options.find(o => o.value === safeValue);
        if (match) displayLabel = match.label;
        else if (!isDiscrete && options.length === 1) displayLabel = options[0].label;
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <TooltipArea text={hintText}>
                    <span className="text-xs font-bold uppercase text-white/60 tracking-wider ml-1">{label}</span>
                </TooltipArea>
                <span className="text-xs font-mono text-white/80">{displayLabel}</span>
            </div>
            <div className="relative flex items-center h-6 w-full group">
                <input 
                    type="range" 
                    min={min} max={max} step={step} 
                    value={safeValue} 
                    onChange={handleChange} 
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20 m-0 p-0 touch-auto accent-blue-500"
                    aria-label={label}
                />
                
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative pointer-events-none">
                    <div 
                        className="absolute top-0 left-0 h-full bg-blue-500 transition-[width] duration-150 ease-out" 
                        style={{ width: `${percentage}%` }} 
                    />
                </div>

                {isDiscrete && options && (
                    <div className="absolute w-full h-full pointer-events-none flex justify-between px-1">
                        {options.map(o => (
                            <div 
                                key={o.value} 
                                className={`w-0.5 h-1.5 rounded-full transition-colors ${o.value <= safeValue ? 'bg-white/50' : 'bg-white/10'}`} 
                                style={{ 
                                    left: `${((o.value - min) / (max - min)) * 100}%`, 
                                    position: 'absolute',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }} 
                            />
                        ))}
                    </div>
                )}

                <div 
                    className="absolute pointer-events-none z-10 transition-[left] duration-150 ease-out"
                    style={{ 
                        left: `${percentage}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="h-3 w-3 bg-white rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)] ring-2 ring-blue-500/20 transition-transform group-hover:scale-125" />
                </div>
            </div>
        </div>
    );
});