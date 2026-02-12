'use client';

import { Navbar } from '@/components/Navbar';
import { ItemCard } from '@/components/ItemCard';
import { StandardLoader } from '@/components/StandardLoader';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Product, Service } from '@/types';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscoverPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | 'Products' | 'Services'>('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, servRes] = await Promise.all([
                api.get('/api/products/discover'),
                api.get('/api/services/discover')
            ]);

            if (prodRes.data.success) setProducts(prodRes.data.products);
            if (servRes.data.success) setServices(servRes.data.services);
        } catch (e) {
            console.error("Failed to fetch discover data", e);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredItems = () => {
        const lowerSearch = searchTerm.toLowerCase();

        const filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(lowerSearch) ||
            (p.description && p.description.toLowerCase().includes(lowerSearch))
        ).map(p => ({ ...p, type: 'product' as const }));

        const filteredServices = services.filter(s =>
            s.name.toLowerCase().includes(lowerSearch) ||
            (s.description && s.description.toLowerCase().includes(lowerSearch))
        ).map(s => ({ ...s, type: 'service' as const }));

        if (activeTab === 'Products') return filteredProducts;
        if (activeTab === 'Services') return filteredServices;

        // Combine and shuffle slightly to mix products and services
        return [...filteredProducts, ...filteredServices].sort((a, b) => 0.5 - Math.random());
    };

    const items = getFilteredItems();

    if (loading) return <StandardLoader />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
                <div className="flex flex-col items-center mb-10 space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900 dark:text-white"
                    >
                        Discover
                    </motion.h1>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative w-full max-w-xl"
                    >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 border-none rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 shadow-lg focus:ring-2 focus:ring-junr-blue focus:outline-none text-lg transition-all"
                            placeholder="Search for products, services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex p-1 space-x-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        {['All', 'Products', 'Services'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    activeTab === tab
                                        ? 'bg-junr-blue text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={`${item.type}-${item.id}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ItemCard item={item} type={item.type} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg">No results found for "{searchTerm}"</p>
                    </div>
                )}
            </main>
        </div>
    );
}
