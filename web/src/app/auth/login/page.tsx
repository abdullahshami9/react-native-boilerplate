'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/login', { email, password });
            if (res.data.success) {
                login(res.data.token, res.data.user);
            } else {
                setError(res.data.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12 dark:bg-gray-900 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Link href="/" className="flex justify-center text-3xl font-bold tracking-tighter text-junr-blue">
                    junr
                </Link>
                <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="glass-card p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error && (
                            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign in
                        </Button>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Not a member?{' '}
                        <Link href="/auth/signup" className="font-semibold leading-6 text-junr-blue hover:text-blue-500">
                            Start a 14 day free trial
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
