'use client'

import React, { useEffect, useState, useContext } from 'react'
import { Navbar } from '@/components/Navbar'
import { ServiceTable } from '@/components/dashboard/ServiceTable'
import { AuthContext } from '@/context/AuthContext'
import api from '@/lib/api'
import { Service } from '@/types'
import { useRouter } from 'next/navigation'
import { StandardLoader } from '@/components/StandardLoader'

export default function BusinessServicesPage() {
    const { userInfo, userToken, isLoading: authLoading } = useContext(AuthContext);
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !userToken) {
            router.push('/auth/login');
            return;
        }
        if (userInfo) {
            fetchServices();
        }
    }, [userInfo, userToken, authLoading]);

    const fetchServices = async () => {
        try {
            const res = await api.get(`/api/services/${userInfo?.id}`);
            if (res.data.success) {
                setServices(res.data.services);
            }
        } catch (err) {
            console.error("Failed to fetch services", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            const res = await api.delete(`/api/services/${id}`);
            if (res.data.success) {
                setServices(prev => prev.filter(s => s.id !== id));
            } else {
                alert(res.data.message || 'Failed to delete service');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete service');
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your service offerings</p>
                    </div>
                </div>

                <ServiceTable services={services} onDelete={handleDelete} basePath="/business/services" />
            </main>
        </div>
    )
}
