'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ProfileHeader, ProfileInfo } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileDetails } from '@/components/profile/ProfileDetails';
import { ProductList } from '@/components/profile/ProductList';
import { ServiceList } from '@/components/profile/ServiceList';
import api from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';
import { User, Skill, Education, Product, Service } from '@/types';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { userInfo, userToken } = useContext(AuthContext);

    const [user, setUser] = useState<User | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (id) {
            fetchProfile();
        }
    }, [id]);

    useEffect(() => {
        if (user) {
            if (user.user_type === 'Business') {
                setActiveTab('products');
            } else {
                setActiveTab('overview');
            }
        }
    }, [user?.user_type]); // Only run when user type changes (initial fetch)

    const fetchProfile = async () => {
        try {
            // Fetch Profile Main Data
            const res = await api.get(`/api/profile/${id}`);
            if (res.data.success) {
                setUser(res.data.user);
                setSkills(res.data.skills || []);
                setEducation(res.data.education || []);

                // If business, fetch products/services
                if (res.data.user.user_type === 'Business') {
                    fetchProducts();
                    fetchServices();
                }
            } else {
                // If profile not found or error
                console.error("Profile load error", res.data.message);
            }
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get(`/api/products/${id}`);
            if (res.data.success) setProducts(res.data.products);
        } catch (e) { console.error(e) }
    };

    const fetchServices = async () => {
        try {
            const res = await api.get(`/api/services/${id}`);
            if (res.data.success) setServices(res.data.services);
        } catch (e) { console.error(e) }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-junr-blue"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
                <Navbar />
                <p className="text-gray-500 mb-4">User not found</p>
            </div>
        );
    }

    const isBusiness = user.user_type === 'Business';
    const isOwnProfile = userInfo?.id === user.id;

    const tabs = isBusiness
        ? [
            { id: 'products', label: 'Products' },
            { id: 'services', label: 'Services' },
            { id: 'overview', label: 'About' },
          ]
        : [
            { id: 'overview', label: 'Overview' },
          ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg pb-20">
            {/* Navbar rendered but maybe covered by ProfileHeader or acting as top nav */}
            {/* Since ProfileHeader is fixed, we can hide Navbar or handle it inside ProfileHeader */}
            {/* But standard Navbar is useful for navigation. Let's keep it but handle overlap */}
            {/* ProfileHeader has z-40. Navbar has z-50. Navbar will be on top. */}
            <div className="hidden md:block">
                <Navbar />
            </div>

            <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

            <main className="max-w-3xl mx-auto px-4 relative z-10">
                <ProfileInfo user={user} isBusiness={isBusiness} />

                {/* Tabs */}
                <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Tab Content */}
                <div className="min-h-[300px] mt-6">
                    {activeTab === 'overview' && (
                        <ProfileDetails skills={skills} education={education} resumeUrl={user.resume_url} />
                    )}
                    {activeTab === 'products' && (
                        <ProductList products={products} />
                    )}
                    {activeTab === 'services' && (
                        <ServiceList services={services} />
                    )}
                </div>
            </main>
        </div>
    );
}
