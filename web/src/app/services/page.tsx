'use client'

import { Navbar } from '@/components/Navbar'
import { ServiceList } from '@/components/profile/ServiceList'
import { Search, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Service } from '@/types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchServices()
  }, [search])

  const fetchServices = async () => {
    try {
      const res = await api.get(`/api/services/discover?search=${search}`)
      if (res.data.success) {
        setServices(res.data.services)
      }
    } catch (error) {
      console.error('Failed to fetch services', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Professional Services</h1>
              <p className="text-gray-500">Book appointments with experts</p>
           </div>

           <div className="flex gap-2">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                    type="text"
                    placeholder="Search services..."
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

        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-junr-blue"></div>
            </div>
        ) : (
            <ServiceList services={services} />
        )}
      </main>
    </div>
  )
}
