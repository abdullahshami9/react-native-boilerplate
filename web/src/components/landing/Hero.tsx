'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Smartphone, Share2, Layers } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-junr-blue to-purple-500">
                Professional Connection
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
              Manage your identity, business, and network in one futuristic platform. AR Business Cards, real-time analytics, and seamless commerce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup" className="px-8 py-4 rounded-full bg-junr-blue text-white font-bold text-lg hover:bg-blue-600 transition-shadow shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/ar" className="px-8 py-4 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <Smartphone className="w-5 h-5" /> AR Experience
              </Link>
            </div>
          </motion.div>

          {/* Visual Content (Floating Cards) */}
          <div className="relative h-[500px] hidden lg:block">
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-junr-blue/20 rounded-full blur-3xl" />

            {/* Main Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute top-10 left-10 w-80 p-6 glass-card z-20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-32 bg-black/5 dark:bg-white/5 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                   <div className="w-24 h-24 bg-white p-2 mx-auto mb-2 rounded-lg">
                     {/* Mock QR */}
                     <div className="w-full h-full border-4 border-black" />
                   </div>
                </div>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Scan to connect</span>
                <span className="text-junr-blue">raabtaa://user/101</span>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute top-60 right-10 w-64 p-5 glass-card z-30"
            >
              <div className="flex items-center gap-3 mb-4 text-junr-green">
                <Layers className="w-5 h-5" />
                <span className="font-bold">Sales Activity</span>
              </div>
              <div className="grid grid-cols-7 gap-1 h-20">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${Math.random() > 0.6 ? 'bg-junr-green' : 'bg-gray-200 dark:bg-gray-700'} opacity-${Math.floor(Math.random() * 50 + 50)}`}
                  />
                ))}
              </div>
            </motion.div>

             {/* Connection Card */}
             <motion.div
              initial={{ opacity: 0, x: -50, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="absolute bottom-20 left-20 w-56 p-4 glass-card z-10"
            >
              <div className="flex items-center gap-3 mb-2 text-junr-blue">
                <Share2 className="w-4 h-4" />
                <span className="font-bold text-sm">New Connection</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-purple-500" />
                 <div className="text-xs">
                    <p className="font-bold">Sarah Designer</p>
                    <p className="text-gray-500">Connected 2m ago</p>
                 </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
