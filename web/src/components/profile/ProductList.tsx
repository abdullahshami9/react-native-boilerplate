'use client'

import React from 'react'
import Image from 'next/image'
import { Product } from '@/data/mock'
import { ShoppingCart } from 'lucide-react'

export function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <div className="text-center text-gray-500 py-10">No products available.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
          <div className="relative h-48 w-full bg-gray-200">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
               <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
               <span className="font-bold text-junr-blue">{product.price.toLocaleString()} PKR</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{product.description}</p>
            <button className="w-full py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-junr-blue hover:text-white transition-colors flex items-center justify-center gap-2">
               <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
