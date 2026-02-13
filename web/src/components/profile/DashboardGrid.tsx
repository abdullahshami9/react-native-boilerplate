'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Package, ShoppingCart, Truck, Scissors, Calendar,
  CreditCard, ShoppingBag, Clock, Grid
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardGridProps {
  userType: string; // 'Business' or 'Individual'
  businessType?: string; // 'Product Based' or 'Service Based'
  counts?: {
    sales_pending?: number;
    purchases_pending?: number;
    appointments_upcoming?: number;
    messages_active?: number;
  };
}

interface DashboardButtonProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
  color?: string;
}

function DashboardButton({ icon, label, href, badge, color = "bg-white dark:bg-junr-dark-bg" }: DashboardButtonProps) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(href)}
      className={`relative flex flex-col items-center justify-center p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer ${color}`}
    >
      {badge ? (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </div>
      ) : null}
      <div className="mb-3 text-gray-700 dark:text-gray-200">
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</span>
    </motion.div>
  )
}

export function DashboardGrid({ userType, businessType, counts }: DashboardGridProps) {
  const isBusiness = userType === 'Business';

  // Section Title Style
  const Title = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">{children}</h3>
  );

  if (isBusiness) {
    // Product Based (Default)
    if (!businessType || businessType === 'Product Based') {
      return (
        <div className="w-full max-w-3xl mx-auto px-4 mb-8">
          <Title>Business Dashboard</Title>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DashboardButton
              icon={<Package className="w-6 h-6" />}
              label="Inventory"
              href="/business/inventory"
            />
            <DashboardButton
              icon={<ShoppingCart className="w-6 h-6" />}
              label="Orders"
              href="/business/orders"
              badge={counts?.sales_pending}
            />
            <DashboardButton
              icon={<Truck className="w-6 h-6" />}
              label="Procurement"
              href="/business/procurement"
            />
          </div>
        </div>
      );
    }

    // Service Based
    return (
      <div className="w-full max-w-3xl mx-auto px-4 mb-8">
        <Title>Business Dashboard</Title>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DashboardButton
            icon={<Scissors className="w-6 h-6" />}
            label="My Services"
            href="/business/services"
          />
          <DashboardButton
            icon={<Calendar className="w-6 h-6" />}
            label="Bookings"
            href="/business/appointments"
            badge={counts?.appointments_upcoming}
          />
          <DashboardButton
            icon={<CreditCard className="w-6 h-6" />}
            label="My Cards"
            href="/cards"
          />
        </div>
      </div>
    );
  }

  // Individual / Customer
  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-8">
      <Title>My Activity</Title>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <DashboardButton
          icon={<ShoppingBag className="w-6 h-6" />}
          label="My Orders"
          href="/orders"
          badge={counts?.purchases_pending}
        />
        <DashboardButton
          icon={<ShoppingCart className="w-6 h-6" />}
          label="My Cart"
          href="/cart"
        />
        <DashboardButton
          icon={<Clock className="w-6 h-6" />}
          label="Appointments"
          href="/appointments"
          badge={counts?.appointments_upcoming}
        />
         <DashboardButton
          icon={<CreditCard className="w-6 h-6" />}
          label="My Cards"
          href="/cards"
        />
      </div>
    </div>
  );
}
