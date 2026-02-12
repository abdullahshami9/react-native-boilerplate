'use client';

import { motion } from 'framer-motion';

interface StandardLoaderProps {
    transparent?: boolean; // If true, just the spinner inline. If false, full screen overlay.
    color?: string;
    size?: 'small' | 'medium' | 'large';
}

export function StandardLoader({
    transparent = false,
    color = '#4A9EFF',
    size = 'medium'
}: StandardLoaderProps) {

    const sizeClasses = {
        small: 'w-6 h-6 border-2',
        medium: 'w-10 h-10 border-[3px]',
        large: 'w-16 h-16 border-4'
    };

    const spinner = (
         <motion.div
            className={`rounded-full ${sizeClasses[size]}`}
            style={{
                borderColor: 'rgba(0,0,0,0.1)',
                borderTopColor: color
            }}
            animate={{ rotate: 360 }}
            transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    );

    if (transparent) {
        return (
            <div className="flex items-center justify-center p-4">
                {spinner}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                {spinner}
            </div>
        </div>
    );
}
