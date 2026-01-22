'use client'

import React from 'react'
import { Product } from '@/data/mock'
import { Edit, Trash2, Plus } from 'lucide-react'
import Image from 'next/image'

export function InventoryTable({ products }: { products: Product[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">Inventory</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-junr-blue text-white rounded-lg hover:bg-blue-600 transition">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{product.price.toLocaleString()} PKR</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    In Stock
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
