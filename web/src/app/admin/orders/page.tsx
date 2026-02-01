'use client'

import { DataTable } from '@/components/admin/DataTable'

// Mock Orders
const orders = [
  { id: 1001, customer: "Alice Client", total: 15000, status: "Pending", date: "2023-10-25" },
  { id: 1002, customer: "Bob Manager", total: 45000, status: "Completed", date: "2023-10-24" },
  { id: 1003, customer: "Charlie Designer", total: 12000, status: "Shipped", date: "2023-10-23" },
  { id: 1004, customer: "Alice Client", total: 5000, status: "Cancelled", date: "2023-10-22" },
  { id: 1005, customer: "Dave Developer", total: 30000, status: "Completed", date: "2023-10-21" },
]

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage customer orders.</p>
      </div>

      <DataTable
        title="Recent Orders"
        data={orders}
        searchKey="customer"
        columns={[
          { header: 'Order ID', accessor: (item) => `#${item.id}` },
          { header: 'Customer', accessor: 'customer' },
          { header: 'Date', accessor: 'date' },
          { header: 'Total', accessor: (item) => `PKR ${item.total.toLocaleString()}` },
          {
            header: 'Status',
            accessor: (item) => {
              const colors: any = {
                'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                'Shipped': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              }
              return (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${colors[item.status]}`}>
                  {item.status}
                </span>
              )
            }
          },
          {
            header: 'Actions',
            accessor: () => (
              <button className="text-sm text-blue-500 hover:underline">View Details</button>
            )
          }
        ]}
      />
    </div>
  )
}
