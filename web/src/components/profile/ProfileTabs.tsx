'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface Tab {
  id: string;
  label: string;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            "relative w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition focus:outline-none ring-offset-2 focus:ring-2 ring-junr-blue",
            activeTab === tab.id
              ? "text-junr-blue shadow"
              : "text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-junr-blue"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab-bg"
              className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
