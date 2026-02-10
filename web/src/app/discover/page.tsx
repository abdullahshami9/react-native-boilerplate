'use client'

import { useState, useEffect, useContext } from 'react'
import { Navbar } from '@/components/Navbar'
import api from '@/lib/api'
import { AuthContext } from '@/context/AuthContext'
import { Search, Filter, MessageSquare, UserPlus } from 'lucide-react'
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper'
import Link from 'next/link'

export default function Discover() {
    const { userInfo } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All'); // 'All', 'Skills', 'Location'
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [search, filterType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [usersRes, productsRes, servicesRes] = await Promise.all([
                api.get(`/api/users/discover?search=${search}&type=${filterType}&excludeId=${userInfo?.id || 0}`),
                api.get(`/api/products/discover?search=${search}&type=${filterType}`),
                api.get(`/api/services/discover?search=${search}&type=${filterType}`)
            ]);

            if (usersRes.data.success) setUsers(usersRes.data.users);
            if (productsRes.data.success) setProducts(productsRes.data.products);
            if (servicesRes.data.success) setServices(servicesRes.data.services);

        } catch (error) {
            console.error("Discover fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (userId: number) => {
        try {
            await api.post('/api/connections', { follower_id: userInfo?.id, following_id: userId, action: 'follow' });
            // Ideally show toast
            alert('Connected!');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8 pt-24 space-y-12">

                {/* Search & Filter Header */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover</h1>
                        <p className="text-gray-500">Find professionals, products, and services.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={filterType === 'All' ? "Search..." : `Search by ${filterType}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-junr-blue outline-none transition-all"
                            />
                        </div>

                        <div className="flex gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                            {['All', 'Skills', 'Location'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilterType(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filterType === f
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-junr-blue"></div>
                    </div>
                ) : (
                    <>
                        {/* People Section */}
                        {users.length > 0 && (
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">People</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {users.map((user) => (
                                        <div key={user.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                            <Link href={`/profile/${user.id}`}>
                                                <img
                                                    src={resolveImage(user.profile_pic_url, getDefaultImageForType(user.user_type === 'Business' ? 'business' : 'customer'))}
                                                    alt={user.name}
                                                    className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-gray-50 dark:border-gray-700"
                                                />
                                            </Link>
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{user.name}</h3>
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-xs rounded-full text-gray-500 mb-4 uppercase tracking-wider">{user.user_type}</span>

                                            <div className="flex gap-2 w-full mt-auto">
                                                <button
                                                    onClick={() => handleConnect(user.id)}
                                                    className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                                >
                                                    <UserPlus className="w-4 h-4" /> Connect
                                                </button>
                                                <button className="p-2 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                                    <MessageSquare className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Products Section */}
                        {products.length > 0 && (
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products</h2>
                                    <Link href="/shop" className="text-junr-blue text-sm font-medium hover:underline">See All</Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {products.map((product) => (
                                        <Link href={`/products/${product.id}`} key={product.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <img
                                                    src={resolveImage(product.image_url, getDefaultImageForType('product', product.name))}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                                                <p className="text-junr-blue font-bold">{product.price.toLocaleString()} PKR</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                         {/* Services Section */}
                         {services.length > 0 && (
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Services</h2>
                                    <Link href="/services" className="text-junr-blue text-sm font-medium hover:underline">See All</Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {services.map((service) => (
                                        <Link href={`/services/${service.id}`} key={service.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <img
                                                    src={resolveImage(service.image_url, getDefaultImageForType('service', service.name))}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                                                    {service.duration_mins} min
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{service.name}</h3>
                                                <p className="text-junr-blue font-bold">{service.price.toLocaleString()} PKR</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {users.length === 0 && products.length === 0 && services.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg">No results found matching your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
