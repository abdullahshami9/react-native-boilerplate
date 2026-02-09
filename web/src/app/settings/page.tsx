'use client';

import React, { useContext } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthContext } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function SettingsPage() {
    const { userInfo, logout } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8 pt-24">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Account</h2>
                        <p className="text-gray-500">Logged in as {userInfo?.email}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Appearance</h2>
                        <div className="flex items-center justify-between">
                            <span>Dark Mode</span>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={logout}
                            className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
