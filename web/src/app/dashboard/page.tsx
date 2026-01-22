import { Navbar } from '@/components/Navbar'
import { InventoryTable } from '@/components/dashboard/InventoryTable'
import { MOCK_PRODUCTS } from '@/data/mock'
import { Package, TrendingUp, DollarSign, Users } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Dashboard</h1>
          <p className="text-gray-500">Overview of your store performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           {[
             { label: 'Total Revenue', value: 'PKR 450,000', icon: DollarSign, color: 'text-green-500' },
             { label: 'Active Orders', value: '12', icon: Package, color: 'text-blue-500' },
             { label: 'Customers', value: '1,204', icon: Users, color: 'text-purple-500' },
             { label: 'Growth', value: '+24%', icon: TrendingUp, color: 'text-orange-500' },
           ].map((stat, i) => (
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

        {/* Inventory Section */}
        <InventoryTable products={MOCK_PRODUCTS} />

      </main>
    </div>
  )
}
