'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthContext } from '@/context/AuthContext';
import api from '@/lib/api';
import { ArrowLeft, Upload } from 'lucide-react';

export default function AddProductPage() {
    const router = useRouter();
    const { userInfo, userToken } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Product First
            const productData = {
                user_id: userInfo?.id,
                name,
                price: parseFloat(price),
                stock_quantity: parseInt(stock),
                description,
                image_url: '' // Will update later
            };

            const res = await api.post('/api/products', productData);

            if (res.data.success) {
                const productId = res.data.id;

                // 2. Upload Image if exists
                if (image) {
                    const formData = new FormData();
                    formData.append('image', image);
                    formData.append('productId', productId);

                    await api.post('/api/upload/product', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }

                router.push('/admin/products');
            } else {
                alert('Failed to create product');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8 pt-24">
                <button onClick={() => router.back()} className="flex items-center text-gray-500 mb-6 hover:text-gray-900 dark:hover:text-white">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Product</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Product Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Price (PKR)"
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                            />
                            <Input
                                label="Stock Quantity"
                                type="number"
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Description</label>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm focus:ring-2 focus:ring-junr-blue outline-none dark:bg-gray-900/50"
                                rows={4}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Product Image</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                                    </div>
                                    <input type="file" className="hidden" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} accept="image/*" />
                                </label>
                            </div>
                            {image && <p className="mt-2 text-sm text-green-500">Selected: {image.name}</p>}
                        </div>

                        <Button type="submit" className="w-full" isLoading={loading}>
                            Create Product
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
}
