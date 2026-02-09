'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { CartContext } from '@/context/CartContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { addToCart } = useContext(CartContext);

    const [product, setProduct] = useState<any>(null); // extending Product with seller info
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/api/product/${id}`);
            if (res.data.success) {
                setProduct(res.data.product);
            } else {
                setError(res.data.message || 'Product not found');
            }
        } catch (err) {
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-junr-blue"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
                <Navbar />
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/shop" className="text-junr-blue hover:underline">Back to Shop</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Section */}
                        <div className="relative h-96 md:h-full bg-gray-200 min-h-[400px]">
                            {product.image_url ? (
                                <img
                                    src={`http://localhost:3000/${product.image_url}`}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No Image Available
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:p-12 flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                {product.seller_pic ? (
                                    <img src={`http://localhost:3000/${product.seller_pic}`} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                                )}
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Sold by {product.seller_name}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>

                            <div className="text-3xl font-bold text-junr-blue mb-6">
                                {product.price.toLocaleString()} PKR
                            </div>

                            <div className="prose dark:prose-invert max-w-none mb-8 text-gray-600 dark:text-gray-300 flex-1">
                                <p>{product.description}</p>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span>Stock: {product.stock_quantity} available</span>
                                    {product.stock_quantity > 0 ? (
                                        <span className="text-green-500 font-medium">In Stock</span>
                                    ) : (
                                        <span className="text-red-500 font-medium">Out of Stock</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock_quantity <= 0}
                                    className="w-full py-4 bg-junr-blue text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
