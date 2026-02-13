'use client'

import React, { useEffect, useState, useContext } from 'react'
import { Navbar } from '@/components/Navbar'
import { InventoryTable } from '@/components/dashboard/InventoryTable'
import { AuthContext } from '@/context/AuthContext'
import api from '@/lib/api'
import { Product } from '@/types'
import { useRouter } from 'next/navigation'
import { StandardLoader } from '@/components/StandardLoader'

export default function BusinessProductsPage() {
    const { userInfo, userToken, isLoading: authLoading } = useContext(AuthContext);
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !userToken) {
            router.push('/auth/login');
            return;
        }
        if (userInfo) {
            fetchProducts();
        }
    }, [userInfo, userToken, authLoading]);

    const fetchProducts = async () => {
        try {
            const res = await api.get(`/api/products/${userInfo?.id}`);
            if (res.data.success) {
                setProducts(res.data.products);
            }
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await api.delete(`/api/products/${id}`);
            if (res.data.success) {
                setProducts(prev => prev.filter(p => p.id !== id));
            } else {
                alert(res.data.message || 'Failed to delete product');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete product');
        }
    }

    if (authLoading || loading) {
        return <StandardLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your products and stock levels</p>
                    </div>
                </div>

                <InventoryTable products={products} onDelete={handleDelete} basePath="/business/products" />
            </main>
        </div>
    )
}
