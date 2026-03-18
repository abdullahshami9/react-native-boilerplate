'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function TunnelPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/tunnel/avatar-setup');
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg p-4 transition-colors duration-300">
            <Loader2 className="w-12 h-12 text-junr-blue animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Preparing your virtual experience...</p>
        </div>
    );
}
