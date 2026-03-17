'use client';

import React, { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Briefcase, User, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TunnelPage() {
    const { userInfo, updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleSelect = async (type: 'Individual' | 'Business' | 'Guest') => {
        setLoading(type);
        try {
            // 1. Update User Type
            await api.put(`/api/users/${userInfo?.id}/type`, { user_type: type });

            // 2. Complete Tunnel
            await api.post('/api/tunnel/complete', { user_id: userInfo?.id });

            if (userInfo) {
                const updatedUser = { ...userInfo, user_type: type };
                updateUser(updatedUser);

                // Redirect everyone to 3D avatar setup before completing tunnel
                router.push('/tunnel/avatar-setup');
            }
        } catch (err) {
            console.error("Tunnel Error:", err);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    const Card = ({ type, title, desc, icon: Icon, color }: any) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(type)}
            disabled={loading !== null}
            className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                loading === type
                    ? 'border-junr-blue bg-junr-blue/5 ring-2 ring-junr-blue ring-offset-2 dark:ring-offset-gray-900'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-junr-blue hover:shadow-lg dark:hover:border-junr-blue'
            }`}
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon className="w-24 h-24" />
            </div>

            <div className="relative z-10 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    {loading === type ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Icon className="w-6 h-6" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-junr-blue transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {desc}
                    </p>
                </div>
                <div className="ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-junr-blue" />
                </div>
            </div>
        </motion.button>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg p-4 transition-colors duration-300">
            <div className="max-w-xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        How would you like to proceed?
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Choose the profile type that best describes your needs.
                    </p>
                </div>

                <div className="space-y-4">
                    <Card
                        type="Individual"
                        title="Personal Profile"
                        desc="For shopping, booking services, and connecting with friends."
                        icon={User}
                        color="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                    />

                    <Card
                        type="Business"
                        title="Business Profile"
                        desc="Sell products, offer services, and grow your brand."
                        icon={Briefcase}
                        color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    />

                    <Card
                        type="Guest"
                        title="Guest Mode"
                        desc="Explore the app quickly without full setup."
                        icon={ShoppingBag}
                        color="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                    />
                </div>
            </div>
        </div>
    );
}
