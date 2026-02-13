'use client'

import { Navbar } from '@/components/Navbar'
import { ProductList } from '@/components/profile/ProductList'
import { Search, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Product } from '@/types'
import { StandardLoader } from '@/components/StandardLoader'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const fetchProducts = async () => {
    // Only show full loader on initial load, otherwise maybe show small indicator or skeleton
    // For simplicity, we just fetch
    try {
      const res = await api.get(`/api/products/discover?search=${search}`)
      if (res.data.success) {
        setProducts(res.data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && products.length === 0 && !search) return <StandardLoader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
              <p className="text-gray-500 mt-1">Discover products from professional connections</p>
           </div>

           <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border-none rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-junr-blue shadow-sm transition-all"
                 />
              </div>
              <button className="p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm text-gray-500 dark:text-gray-400">
                 <Filter className="w-5 h-5" />
              </button>
           </div>
        </div>

        <ProductList products={products} />

        {products.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500">
                No products found matching "{search}"
            </div>
        )}
      </main>
    </div>
  )
}
