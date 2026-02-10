'use client'

import React, { useContext } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { ShoppingCart } from 'lucide-react'
import { CartContext } from '@/context/CartContext'
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper'

export function ProductList({ products }: { products: Product[] }) {
  const { addToCart } = useContext(CartContext);

  if (!products || products.length === 0) {
    return <div className="text-center text-gray-500 py-10">No products available.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
          <Link href={`/products/${product.id}`} className="relative h-48 w-full bg-gray-200 block">
            <img
                src={resolveImage(product.image_url, getDefaultImageForType('product', product.name))}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="p-4 flex flex-col flex-1">
            <Link href={`/products/${product.id}`}>
                <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-junr-blue">{product.name}</h3>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-junr-blue">{product.price.toLocaleString()} PKR</span>
                    <span className="text-xs text-gray-500">{product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{product.description}</p>
            </Link>
            <button
                onClick={() => addToCart(product)}
                disabled={product.stock_quantity <= 0}
                className="w-full py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-junr-blue hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
               <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
