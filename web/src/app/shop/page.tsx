'use client'

import { Navbar } from '@/components/Navbar'
import { MOCK_PRODUCTS } from '@/data/mock'
import { ProductList } from '@/components/profile/ProductList'
import { Search, Filter } from 'lucide-react'
import { useState } from 'react'

export default function Shop() {
  const [search, setSearch] = useState('')

  const filteredProducts = MOCK_PRODUCTS.filter(p =>
     p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
              <p className="text-gray-500">Discover products from professional connections</p>
           </div>

           <div className="flex gap-2">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full md:w-64 focus:ring-2 focus:ring-junr-blue outline-none"
                 />
              </div>
              <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                 <Filter className="w-5 h-5 text-gray-500" />
              </button>
           </div>
        </div>

        <ProductList products={filteredProducts} />
      </main>
    </div>
  )
}
