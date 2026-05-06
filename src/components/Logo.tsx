'use client';

import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    textClassName?: string;
    iconClassName?: string;
}

const Logo: React.FC<LogoProps> = ({
    className = "",
    showText = true,
    textClassName = "text-2xl font-black text-white",
    iconClassName = "w-10 h-10"
}) => {
    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className={`${iconClassName} relative flex items-center justify-center`}>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    {/* Background orbital lines */}
                    <path
                        d="M20,40 Q50,20 80,40"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        className="opacity-60"
                    />
                    <path
                        d="M15,60 Q50,80 85,60"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        className="opacity-60"
                    />

                    {/* stylized A */}
                    <path
                        d="M35,75 L50,25"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <path
                        d="M50,25 L65,75"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <circle cx="35" cy="75" r="4" fill="#3b82f6" />
                    <circle cx="50" cy="25" r="4" fill="#3b82f6" />
                    <circle cx="65" cy="75" r="4" fill="#14b8a6" />

                    {/* Crossbar swoosh */}
                    <path
                        d="M25,55 Q50,45 75,55"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="opacity-80"
                    />
                </svg>
            </div>
            {showText && (
                <span className={`tracking-tight ${textClassName}`}>
                    AirFlow
                </span>
            )}
        </div>
    );
};

export default Logo;
