/**
 * File: components/ui/UnsupportedScreen.tsx
 * Version: 1.8.23
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import React from 'react';
import { useUI } from '../AppContext';

export const UnsupportedScreen: React.FC = () => {
    const { t } = useUI();
    return (
        <div className="min-h-[100dvh] bg-black flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-6 animate-fade-in-up">
                <h1 className="text-4xl font-black text-red-400">{t?.unsupportedTitle || 'Browser Not Supported'}</h1>
                <p className="text-gray-300 leading-relaxed">
                    {t?.unsupportedText || 'Aura Flux requires modern browser features (like microphone access) that are not available. Please update to a recent version of Chrome, Firefox, or Safari.'}
                </p>
            </div>
        </div>
    );
};