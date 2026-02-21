'use client';

import { Navbar } from '@/components/Navbar'
import { InventoryTable } from '@/components/dashboard/InventoryTable'
import { Package, TrendingUp, DollarSign, ShoppingBag, AlertTriangle, Check, X, Clock } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper';

export default function BusinessStats() {
    const { userInfo, isLoading: authLoading } = useContext(AuthContext);
    const router = useRouter();

    // Data State
    const [salesData, setSalesData] = useState<any[]>([]);
    const [todaySales, setTodaySales] = useState(0);
    const [activeOrdersCount, setActiveOrdersCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !userInfo) {
            router.push('/auth/login');
            return;
        }
        if (userInfo && userInfo.user_type !== 'Business') {
            router.push('/discover');
            return;
        }

        if (userInfo) {
            fetchDashboardData();
        }
    }, [userInfo, authLoading]);

    const fetchDashboardData = async () => {
        try {
            // 1. Sales Report
            const salesRes = await api.get(`/api/reports/sales/${userInfo?.id}`);
            if (salesRes.data.success) {
                const daily = salesRes.data.daily || [];
                const today = new Date().toISOString().split('T')[0];
                let todayTotal = 0;

                // Process last 7 days
                const last7 = daily.slice(-7).map((d: any) => ({
                    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    total: Number(d.total)
                }));

                // Fill logic could be better but sticking to simple mapping
                setSalesData(last7.length > 0 ? last7 : Array(7).fill({ name: '-', total: 0 }));

                // Calculate today's sales
                const todayEntry = daily.find((d: any) => d.date.startsWith(today));
                if (todayEntry) todayTotal = Number(todayEntry.total);
                setTodaySales(todayTotal);
            }

            // 2. Orders
            const ordersRes = await api.get(`/api/orders/business/${userInfo?.id}`);
            if (ordersRes.data.orders) {
                const allOrders = ordersRes.data.orders;
                const pending = allOrders.filter((o: any) => o.status === 'pending');
                const active = allOrders.filter((o: any) => ['pending', 'accepted', 'preparing', 'out_for_delivery'].includes(o.status));

                setPendingOrders(pending);
                setActiveOrdersCount(active.length);
            }

            // 3. Products
            const prodRes = await api.get(`/api/products/${userInfo?.id}`);
            if (prodRes.data.products) {
                setProducts(prodRes.data.products);
                const low = prodRes.data.products.filter((p: any) => p.stock < 5);
                setLowStockCount(low.length);
            }

        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: number, status: string) => {
        try {
            await api.put(`/api/orders/${orderId}/status`, { status });
            // Refresh data
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to update order", err);
            alert("Failed to update order status");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-junr-blue"></div>
            </div>
        );
    }

    const statCards = [
        {
            label: "Today's Sales",
            value: `${todaySales.toLocaleString()} PKR`,
            icon: DollarSign,
            color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Active Orders',
            value: activeOrdersCount,
            icon: ShoppingBag,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Low Stock Items',
            value: lowStockCount,
            icon: AlertTriangle,
            color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8 pt-24 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-gray-500">Overview of your business performance.</p>
                    </div>
                    {/* QR Code Button could go here */}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sales Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sales Overview</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00a884" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#00a884" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#718096', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#718096', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#00a884', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#00a884"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Action Center - Pending Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pending Orders</h2>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                            {pendingOrders.length} New
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingOrders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No pending orders at the moment.
                            </div>
                        ) : (
                            pendingOrders.map((order) => (
                                <div key={order.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-gray-900 dark:text-white">Order #{order.id}</span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-junr-blue font-medium">{order.buyer_name || 'Guest Customer'}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{order.total_amount.toLocaleString()} PKR</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <p className="mb-1 flex items-start gap-2">
                                                <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">Items:</span>
                                                {order.items.map((i: any) => `${i.quantity}x ${i.product_name}`).join(', ')}
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">Address:</span>
                                                {order.shipping_address || 'No address provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col gap-3 justify-center min-w-[120px]">
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'accepted')}
                                            className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Inventory Section */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
                        <p className="text-gray-500 text-sm">Manage your products and stock levels.</p>
                    </div>
                    <InventoryTable products={products} basePath="/business/products" />
                </section>

            </main>
        </div>
    )
}
