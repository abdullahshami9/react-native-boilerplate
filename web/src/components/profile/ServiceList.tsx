'use client'

import React from 'react'
import Link from 'next/link'
import { Service } from '@/types'
import { Calendar } from 'lucide-react'

export function ServiceList({ services }: { services: Service[] }) {
  if (!services || services.length === 0) {
    return <div className="text-center text-gray-500 py-10">No services available.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
          <Link href={`/services/${service.id}`} className="relative h-48 w-full bg-gray-200 block">
            {service.image_url ? (
                <img
                src={`http://localhost:3000/${service.image_url}`}
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No Image
                </div>
            )}
          </Link>
          <div className="p-4 flex flex-col flex-1">
            <Link href={`/services/${service.id}`}>
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-junr-blue">{service.name}</h3>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-junr-blue">{service.price.toLocaleString()} PKR</span>
                    <span className="text-xs text-gray-500">{service.duration_mins} mins</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{service.description}</p>
            </Link>
            <Link
                href={`/services/${service.id}`}
                className="w-full py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-junr-blue hover:text-white transition-colors flex items-center justify-center gap-2">
               <Calendar className="w-4 h-4" /> Book Now
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
