'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthContext } from '@/context/AuthContext';
import api from '@/lib/api';
import { ArrowLeft, Upload } from 'lucide-react';

export default function AddServicePage() {
    const router = useRouter();
    const { userInfo } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('60');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (!userInfo && !userToken) {
             router.push('/auth/login');
        }
    }, [userInfo, userToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const serviceData = {
                user_id: userInfo?.id,
                name,
                price: parseFloat(price),
                duration_mins: parseInt(duration),
                description,
                image_url: '',
                service_type: 'Hourly', // Defaulting for now
                service_location: 'OnSite' // Defaulting for now
            };

            const res = await api.post('/api/services', serviceData);

            if (res.data.success) {
                const serviceId = res.data.id;

                if (image) {
                    const formData = new FormData();
                    formData.append('image', image);
                    formData.append('serviceId', serviceId);

                    await api.post('/api/upload/service', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }

                router.push('/business/services');
            } else {
                alert('Failed to create service');
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
                <button onClick={() => router.back()} className="flex items-center text-gray-500 mb-6 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Services
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Service</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Service Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="e.g. Haircut & Beard Trim"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Price (PKR)"
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                                placeholder="0.00"
                            />
                            <Input
                                label="Duration (Minutes)"
                                type="number"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                required
                                placeholder="60"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Description</label>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm focus:ring-2 focus:ring-junr-blue outline-none dark:bg-gray-900/50 min-h-[120px]"
                                rows={4}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe your service..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Service Image</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-10 h-10 mb-4 text-gray-400 dark:text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} accept="image/*" />
                                </label>
                            </div>
                            {image && <p className="mt-2 text-sm text-green-500 font-medium">Selected: {image.name}</p>}
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full h-12 text-base" isLoading={loading}>
                                Create Service
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
