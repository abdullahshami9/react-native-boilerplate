'use client'

import React from 'react'
import { Service } from '@/types'
import { Edit, Trash2, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function ServiceTable({ services, onDelete, basePath = '/admin/services' }: { services: Service[], onDelete?: (id: number) => void, basePath?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Services</h2>
        <Link href={`${basePath}/add`} className="flex items-center gap-2 px-4 py-2 bg-junr-blue text-white rounded-lg hover:bg-blue-600 transition">
          <Plus className="w-4 h-4" /> Add Service
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {services.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No services found.</td>
                </tr>
            ) : (
                services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {service.image_url ? (
                            <img src={`http://localhost:3000/${service.image_url}`} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-200" />
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{service.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{service.description}</div>
                    </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{service.price.toLocaleString()} PKR</td>
                    <td className="px-6 py-4 text-gray-500">{service.duration_mins} mins</td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <Link href={`${basePath}/edit/${service.id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
                        <Edit className="w-4 h-4" />
                        </Link>
                        {onDelete && (
                            <button onClick={() => onDelete(service.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                            <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
