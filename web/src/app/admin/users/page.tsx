'use client'

import { DataTable } from '@/components/admin/DataTable'
import { MOCK_INDIVIDUAL_USER, MOCK_BUSINESS_USER } from '@/data/mock'
import { CheckCircle, XCircle } from 'lucide-react'

// Combine mock users into a list
const users = [
  MOCK_INDIVIDUAL_USER,
  MOCK_BUSINESS_USER,
  {
    id: 303,
    name: "Alice Client",
    email: "alice@example.com",
    phone: "+1122334455",
    user_type: "Individual",
    profile_pic_url: ""
  },
  {
    id: 304,
    name: "Bob Manager",
    email: "bob@corporate.com",
    phone: "+5566778899",
    user_type: "Business",
    profile_pic_url: "",
    business: { business_type: "Service Based", company_name: "Consult Corp" }
  },
  {
    id: 305,
    name: "Charlie Designer",
    email: "charlie@design.io",
    phone: "+9988776655",
    user_type: "Individual",
    profile_pic_url: ""
  }
]

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-500 mt-1">Manage individual and business accounts.</p>
      </div>

      <DataTable
        title="All Users"
        data={users}
        searchKey="name"
        columns={[
          {
            header: 'User',
            accessor: (user: any) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                  {user.profile_pic_url ? (
                    <img src={user.profile_pic_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
            )
          },
          {
            header: 'Type',
            accessor: (user: any) => (
              <span className={`
                px-3 py-1 rounded-full text-xs font-medium border
                ${user.user_type === 'Business'
                  ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-900/30'
                  : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30'}
              `}>
                {user.user_type}
              </span>
            )
          },
          { header: 'Phone', accessor: 'phone' },
          {
            header: 'Status',
            accessor: () => (
              <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Active
              </div>
            )
          },
          {
            header: 'Actions',
            accessor: (user: any) => (
              <button className="text-sm text-blue-500 hover:underline">Edit</button>
            )
          }
        ]}
      />
    </div>
  )
}
