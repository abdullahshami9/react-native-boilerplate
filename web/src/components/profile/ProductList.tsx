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
    return <div className="text-center text-gray-500 py-10 col-span-full">No products available.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {products.map((product) => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
          <Link href={`/product/${product.id}`} className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 block overflow-hidden">
            <img
                src={resolveImage(product.image_url, getDefaultImageForType('product', product.name))}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
          <div className="p-4 flex flex-col flex-1">
            <Link href={`/product/${product.id}`} className="block mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-junr-blue transition-colors text-lg">{product.name}</h3>
                <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-junr-blue text-lg">{product.price.toLocaleString()} PKR</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock_quantity > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{product.description}</p>

            <button
                onClick={() => addToCart(product)}
                disabled={product.stock_quantity <= 0}
                className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
               <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
