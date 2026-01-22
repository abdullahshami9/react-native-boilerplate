'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { ProfileHeader, ProfileInfo } from '@/components/profile/ProfileHeader'
import { ContributionGraph } from '@/components/profile/ContributionGraph'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { ProfileDetails } from '@/components/profile/ProfileDetails'
import { ProductList } from '@/components/profile/ProductList'
import {
  User,
  MOCK_SKILLS,
  MOCK_EDUCATION,
  MOCK_PRODUCTS,
  MOCK_SALES_REPORT,
  MOCK_APPOINTMENTS
} from '@/data/mock'

export function ProfilePageContent({ user }: { user: User }) {
  const isBusiness = user.user_type === 'Business';

  const [activeTab, setActiveTab] = useState(isBusiness ? 'products' : 'skills');

  const tabs = isBusiness
    ? [
        { id: 'products', label: 'Products' },
        { id: 'sales', label: 'Sales Reports' }
      ]
    : [
        { id: 'skills', label: 'Overview' },
        { id: 'appointments', label: 'Appointments' }
      ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg pb-20">
      {/* Navbar is fixed, but ProfileHeader is also fixed and on top.
          Actually Navbar should probably be hidden or blend in on Profile page,
          or ProfileHeader sits below it?
          The App design has the header at the very top.
          I will render Navbar but ProfileHeader will cover it initially if z-index is high,
          or I can hide Navbar on this page.
          Let's keep Navbar for web navigation consistency, but push ProfileHeader down?
          No, the App design has a specific header.
          I'll just put Navbar at top and ProfileHeader below it?
          Or maybe just hide Navbar for the "App Like" feel.
          Let's include Navbar but make it fixed top-0 z-50.
          ProfileHeader will be sticky below it or transform.
          Wait, ProfileHeader in the app IS the header.
          I'll hide the standard Navbar on this page to mimic the app exactly.
      */}

      <ProfileHeader user={user} isOwnProfile={true} />

      <main className="max-w-3xl mx-auto px-4 relative z-10">
        <ProfileInfo user={user} isBusiness={isBusiness} />

        {/* Contribution Graph - Always visible in App? Yes. */}
        <div className="mb-8">
           <ContributionGraph
              data={isBusiness ? MOCK_SALES_REPORT : MOCK_APPOINTMENTS}
              isBusiness={isBusiness}
              onDateClick={(date) => alert(`Clicked ${date}`)}
           />
        </div>

        {/* Tabs */}
        <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="min-h-[300px]">
           {activeTab === 'skills' && (
              <ProfileDetails skills={MOCK_SKILLS} education={MOCK_EDUCATION} resumeUrl={user.resume_url} />
           )}
           {activeTab === 'products' && (
              <ProductList products={MOCK_PRODUCTS} />
           )}
           {/* Fallbacks / Placeholders for others */}
           {activeTab === 'sales' && (
              <div className="text-center text-gray-500">Detailed Sales Reports Table would go here.</div>
           )}
           {activeTab === 'appointments' && (
              <div className="text-center text-gray-500">Detailed Appointments List would go here.</div>
           )}
        </div>
      </main>
    </div>
  )
}
