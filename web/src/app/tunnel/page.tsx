'use client';

import React, { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function TunnelPage() {
    const { userInfo, updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleComplete = async () => {
        setLoading(true);
        try {
            await api.post('/api/tunnel/complete', { user_id: userInfo?.id });
            if (userInfo) {
                const updatedUser = { ...userInfo, is_tunnel_completed: true };
                updateUser(updatedUser);
                router.push('/dashboard');
            }
        } catch (err) {
            alert('Failed to complete setup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to junr!</h1>
                <p className="text-gray-500 mb-8">
                    Let's get your profile set up. This is a simplified onboarding for the web version.
                </p>

                <Button onClick={handleComplete} isLoading={loading} className="w-full">
                    Complete Setup & Go to Dashboard
                </Button>
            </div>
        </div>
    );
}
