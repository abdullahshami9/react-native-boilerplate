'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingCart, Activity } from 'lucide-react'
import { MOCK_SALES_REPORT } from '@/data/mock'

const stats = [
  {
    title: 'Total Revenue',
    value: 'PKR 2.4M',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  {
    title: 'Active Users',
    value: '8,549',
    change: '+5.2%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    title: 'Total Orders',
    value: '1,245',
    change: '-2.4%',
    trend: 'down',
    icon: ShoppingCart,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '+1.1%',
    trend: 'up',
    icon: Activity,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your business performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
          const trendColor = stat.trend === 'up' ? 'text-green-500' : 'text-red-500'

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${trendColor} bg-white dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5`}>
                  {stat.change}
                  <TrendIcon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Section (Mock) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue Analytics</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {MOCK_SALES_REPORT.slice(0, 20).map((sale, i) => (
              <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-sm relative group hover:bg-blue-500 transition-colors">
                <div
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500"
                  style={{ height: `${Math.min((sale.total / 10000) * 100, 100)}%` }}
                />
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                  {sale.date}: PKR {sale.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">New order #123{i} received</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{i * 2} mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
