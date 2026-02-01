'use client'

import { DataTable } from '@/components/admin/DataTable'
import { MOCK_PRODUCTS } from '@/data/mock'
import { Plus } from 'lucide-react'

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500 mt-1">Inventory and catalog management.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <DataTable
        title="Inventory"
        data={MOCK_PRODUCTS}
        searchKey="name"
        columns={[
          {
            header: 'Product Name',
            accessor: (item: any) => (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden">
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="font-medium">{item.name}</span>
              </div>
            )
          },
          {
            header: 'Price',
            accessor: (item: any) => `PKR ${item.price.toLocaleString()}`
          },
          {
            header: 'Description',
            accessor: 'description',
            className: 'max-w-xs truncate'
          },
          {
            header: 'Stock',
            accessor: () => (
              <span className="text-orange-500 font-medium">Low Stock (5)</span>
            )
          },
          {
            header: 'Actions',
            accessor: () => (
              <div className="flex gap-3">
                <button className="text-sm text-blue-500 hover:underline">Edit</button>
                <button className="text-sm text-red-500 hover:underline">Delete</button>
              </div>
            )
          }
        ]}
      />
    </div>
  )
}
