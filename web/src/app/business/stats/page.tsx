'use client';

import { Navbar } from '@/components/Navbar'
import { InventoryTable } from '@/components/dashboard/InventoryTable'
import { Package, TrendingUp, DollarSign, Users, Calendar, MessageSquare, ShoppingBag } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'

export default function BusinessStats() {
  const { userInfo, isLoading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState({
      sales_pending: 0,
      purchases_pending: 0,
      appointments_upcoming: 0,
      messages_active: 0
  });
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
          fetchData();
      }
  }, [userInfo, authLoading]);

  const fetchData = async () => {
      try {
          const [statsRes, productsRes] = await Promise.all([
             api.get(`/api/user/counts/${userInfo?.id}`),
             api.get(`/api/products/${userInfo?.id}`)
          ]);

          if (statsRes.data.success) {
              setStats(statsRes.data);
          }
          if (productsRes.data.success) {
              setProducts(productsRes.data.products);
          }
      } catch (err) {
          console.error("Failed to fetch dashboard data", err);
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
          color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
      },
      {
          label: 'Upcoming Appointments',
          value: stats.appointments_upcoming,
          icon: Calendar,
          color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
      },
      {
          label: 'Active Messages',
          value: stats.messages_active,
          icon: MessageSquare,
          color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
      },
      {
          label: 'Total Products',
          value: products.length,
          icon: Package,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Business Stats
          </h1>
          <p className="text-gray-500">
            Overview of your business performance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {statCards.map((stat, i) => (
             <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                   </div>
                   <div className={`p-3 rounded-xl ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Inventory Section */}
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
                <p className="text-gray-500 text-sm">Manage your products and stock levels.</p>
            </div>
            <InventoryTable products={products} />
        </section>

      </main>
    </div>
  )
}
