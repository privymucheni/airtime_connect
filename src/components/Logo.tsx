'use client';

import React from 'react';
import { Wind } from 'lucide-react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    textClassName?: string;
    iconClassName?: string;
}

const Logo: React.FC<LogoProps> = ({
    className = "",
    showText = true,
    textClassName = "text-2xl font-black",
    iconClassName = "w-8 h-8"
}) => {
    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className={`bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50 ${iconClassName}`}>
                <Wind className="text-white w-2/3 h-2/3 stroke-[3px]" />
            </div>
            {showText && (
                <span className={`tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent ${textClassName}`}>
                    AirFlow
                </span>
            )}
        </div>
    );
};

export default Logo;
