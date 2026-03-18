'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export default function PersonalDetailsPage() {
    const { userInfo } = useContext(AuthContext);
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (userInfo) {
            setName(userInfo.name || '');
            setPhone(userInfo.phone || '');
            setAddress(userInfo.address || '');
        }
    }, [userInfo]);

    const submitDetails = async () => {
        if (!name || !phone || !address) {
            alert('Please fill in all details.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/tunnel/personal/details', {
                user_id: userInfo?.id,
                name: name,
                phone: phone,
                address: address
            });

            router.push('/tunnel/payment');

        } catch (error) {
            console.error(error);
            alert('Failed to save personal details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Details</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Please verify and provide your contact information.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phone Number
                            </label>
                            <Input
                                type="text"
                                placeholder="+1 234 567 890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Delivery Address
                            </label>
                            <Input
                                type="text"
                                placeholder="123 Fashion St, NY"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        className="w-full mt-8"
                        onClick={submitDetails}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
