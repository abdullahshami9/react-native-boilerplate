'use client';

import { Navbar } from '@/components/Navbar'
import { InventoryTable } from '@/components/dashboard/InventoryTable'
import { MOCK_PRODUCTS } from '@/data/mock' // Keep for fallback if products fetch fails or not implemented yet for dashboard
import { Package, TrendingUp, DollarSign, Users, Calendar, MessageSquare, ShoppingBag } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { userInfo, isLoading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState({
      sales_pending: 0,
      purchases_pending: 0,
      appointments_upcoming: 0,
      messages_active: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!authLoading && !userInfo) {
          router.push('/auth/login');
          return;
      }

      if (userInfo) {
          fetchStats();
      }
  }, [userInfo, authLoading]);

  const fetchStats = async () => {
      try {
          const res = await api.get(`/api/user/counts/${userInfo?.id}`);
          if (res.data.success) {
              setStats(res.data);
          }
      } catch (err) {
          console.error("Failed to fetch stats", err);
      } finally {
          setLoading(false);
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
          label: 'Pending Sales',
          value: stats.sales_pending,
          icon: DollarSign,
          color: 'text-green-500',
          role: 'Business'
      },
      {
          label: 'Pending Purchases',
          value: stats.purchases_pending,
          icon: ShoppingBag,
          color: 'text-blue-500',
          role: 'Individual' // Everyone can buy
      },
      {
          label: 'Upcoming Appointments',
          value: stats.appointments_upcoming,
          icon: Calendar,
          color: 'text-purple-500',
          role: 'Both'
      },
      {
          label: 'Active Messages',
          value: stats.messages_active,
          icon: MessageSquare,
          color: 'text-orange-500',
          role: 'Both'
      },
  ];

  // Filter based on user type (simplified logic: everyone sees purchasing/appointments/messages, businesses see sales)
  const visibleStats = statCards.filter(stat => {
      if (stat.role === 'Business' && userInfo?.user_type !== 'Business') return false;
      return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hello, {userInfo?.name}
          </h1>
          <p className="text-gray-500">
            {userInfo?.user_type === 'Business' ? 'Business Dashboard' : 'Personal Dashboard'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           {visibleStats.map((stat, i) => (
             <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                   </div>
                   <div className={`p-3 bg-gray-50 dark:bg-white/5 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Show Inventory Table only for Business Users */}
        {userInfo?.user_type === 'Business' && (
             <InventoryTable products={MOCK_PRODUCTS} />
             /* Ideally pass real products here later */
        )}

      </main>
    </div>
  )
}
