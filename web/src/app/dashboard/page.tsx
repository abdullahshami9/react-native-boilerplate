'use client';

import { Navbar } from '@/components/Navbar'
import { InventoryTable } from '@/components/dashboard/InventoryTable'
import { HorizontalList } from '@/components/dashboard/HorizontalList'
import { Package, TrendingUp, DollarSign, Users, Calendar, MessageSquare, ShoppingBag } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { StandardLoader } from '@/components/StandardLoader'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Product, Service } from '@/types'

export default function Dashboard() {
  const { userInfo, isLoading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState({
      sales_pending: 0,
      purchases_pending: 0,
      appointments_upcoming: 0,
      messages_active: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!authLoading && !userInfo) {
          router.push('/auth/login');
          return;
      }

      if (userInfo) {
          fetchData();
      }
  }, [userInfo, authLoading]);

  const fetchData = async () => {
      try {
          const isBusiness = userInfo?.user_type?.toLowerCase() === 'business';

          // Parallel fetch
          const promises = [
              api.get(`/api/user/counts/${userInfo?.id}`),
          ];

          if (isBusiness) {
              promises.push(api.get(`/api/products/${userInfo?.id}`));
              // Ideally fetch services too if business has them, but start with products for inventory
          } else {
              promises.push(api.get('/api/products/discover'));
              promises.push(api.get('/api/services/discover'));
          }

          const results = await Promise.all(promises);

          // Handle stats
          if (results[0].data.success) {
              setStats(results[0].data);
          }

          if (isBusiness) {
              if (results[1]?.data.success) {
                  setProducts(results[1].data.products);
              }
          } else {
              if (results[1]?.data.success) {
                   setProducts(results[1].data.products);
              }
              if (results[2]?.data.success) {
                   setServices(results[2].data.services);
              }
          }

      } catch (err) {
          console.error("Failed to fetch dashboard data", err);
      } finally {
          setLoading(false);
      }
  };

  if (authLoading || loading) {
      return <StandardLoader />;
  }

  const isBusiness = userInfo?.user_type?.toLowerCase() === 'business';

  const statCards = [
      {
          label: 'Pending Sales',
          value: stats.sales_pending,
          icon: DollarSign,
          color: 'text-green-500',
          role: 'business'
      },
      {
          label: 'Pending Purchases',
          value: stats.purchases_pending,
          icon: ShoppingBag,
          color: 'text-blue-500',
          role: 'individual' // Everyone can buy
      },
      {
          label: 'Upcoming Appointments',
          value: stats.appointments_upcoming,
          icon: Calendar,
          color: 'text-purple-500',
          role: 'both'
      },
      {
          label: 'Active Messages',
          value: stats.messages_active,
          icon: MessageSquare,
          color: 'text-orange-500',
          role: 'both'
      },
  ];

  const visibleStats = statCards.filter(stat => {
      if (stat.role === 'business' && !isBusiness) return false;
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
            {isBusiness ? 'Business Dashboard' : 'Personal Dashboard'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           {visibleStats.map((stat, i) => (
             <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                   </div>
                   <div className={`p-3 bg-gray-50 dark:bg-white/5 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                   </div>
                </div>
             </div>
           ))}
        </div>

        {isBusiness ? (
             <InventoryTable products={products} />
        ) : (
            <div className="space-y-10">
                <HorizontalList title="Discover Products" items={products} type="product" />
                <HorizontalList title="Discover Services" items={services} type="service" />
            </div>
        )}

      </main>
    </div>
  )
}
