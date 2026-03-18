'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function PaymentPage() {
    const { userInfo, updateUser } = useContext(AuthContext);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const completeTunnel = async () => {
        setLoading(true);
        try {
            // Complete the tunnel setup
            await api.post('/api/tunnel/complete', { user_id: userInfo?.id });

            // Update local state to reflect tunnel completion
            if (userInfo) {
                updateUser({ ...userInfo, is_tunnel_completed: true });
            }

            // Redirect to home/discover page
            router.push('/');

        } catch (error) {
            console.error('Tunnel completion error:', error);
            alert('Failed to complete setup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">

                <div className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mb-6">
                    <CreditCard className="w-10 h-10" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Setup Complete</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Your account and 3D Avatar are ready. You can add payment methods later when you shop.
                </p>

                <Button
                    className="w-full"
                    onClick={completeTunnel}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter App'}
                </Button>
            </div>
        </div>
    );
}
