'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';
import { Calendar, ArrowLeft, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Service } from '@/types';

export default function ServiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { userInfo, userToken } = useContext(AuthContext);

    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        if (id) {
            fetchService();
        }
    }, [id]);

    const fetchService = async () => {
        try {
            const res = await api.get(`/api/service/${id}`);
            if (res.data.success) {
                setService(res.data.service);
            } else {
                setError(res.data.message || 'Service not found');
            }
        } catch (err) {
            setError('Failed to load service');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToken) {
            router.push('/auth/login');
            return;
        }

        setBookingLoading(true);
        try {
            // Combine date and time
            const appointmentDate = `${bookingDate} ${bookingTime}:00`;

            const payload = {
                provider_id: service.user_id,
                customer_id: userInfo?.id,
                service_id: service.id,
                appointment_date: appointmentDate,
                duration_mins: service.duration_mins
            };

            const res = await api.post('/api/appointments', payload);
            if (res.data.success) {
                setBookingSuccess(true);
            } else {
                alert(res.data.message || 'Booking failed');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-junr-blue"></div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
                <Navbar />
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/services" className="text-junr-blue hover:underline">Back to Services</Link>
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
                            {service.image_url ? (
                                <img
                                    src={`http://localhost:3000/${service.image_url}`}
                                    alt={service.name}
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
                                {service.provider_pic ? (
                                    <img src={`http://localhost:3000/${service.provider_pic}`} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                                )}
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Service by {service.provider_name}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{service.name}</h1>

                            <div className="flex items-center gap-6 mb-6 text-gray-600 dark:text-gray-300">
                                <span className="font-bold text-2xl text-junr-blue">{service.price.toLocaleString()} PKR</span>
                                <span className="flex items-center gap-1 text-sm"><Clock className="w-4 h-4"/> {service.duration_mins} mins</span>
                                <span className="flex items-center gap-1 text-sm"><MapPin className="w-4 h-4"/> {service.service_location}</span>
                            </div>

                            <div className="prose dark:prose-invert max-w-none mb-8 text-gray-600 dark:text-gray-300 flex-1">
                                <p>{service.description}</p>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Book an Appointment</h3>

                                {bookingSuccess ? (
                                    <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                                        <p className="font-bold">Booking Request Sent!</p>
                                        <p className="text-sm">The provider will review your request shortly.</p>
                                        <button onClick={() => setBookingSuccess(false)} className="mt-2 text-sm underline">Book another</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleBooking} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                                    value={bookingDate}
                                                    onChange={e => setBookingDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                                    value={bookingTime}
                                                    onChange={e => setBookingTime(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={bookingLoading}
                                            className="w-full py-4 bg-junr-blue text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                                        >
                                            <Calendar className="w-6 h-6" />
                                            {bookingLoading ? 'Processing...' : 'Request Appointment'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
