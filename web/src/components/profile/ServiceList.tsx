'use client'

import React from 'react'
import Link from 'next/link'
import { Service } from '@/types'
import { Calendar } from 'lucide-react'
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper'

export function ServiceList({ services }: { services: Service[] }) {
  if (!services || services.length === 0) {
    return <div className="text-center text-gray-500 py-10 col-span-full">No services available.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {services.map((service) => (
        <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
          <Link href={`/service/${service.id}`} className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 block overflow-hidden">
             <img
                src={resolveImage(service.image_url, getDefaultImageForType('service', service.name))}
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
          <div className="p-4 flex flex-col flex-1">
            <Link href={`/service/${service.id}`} className="block mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-junr-blue transition-colors text-lg">{service.name}</h3>
                <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-junr-blue text-lg">{service.price.toLocaleString()} PKR</span>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">{service.duration_mins} mins</span>
                </div>
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{service.description}</p>

            <Link
                href={`/service/${service.id}`}
                className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm">
               <Calendar className="w-4 h-4" /> Book Now
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
