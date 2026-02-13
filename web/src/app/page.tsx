'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-junr-light-bg dark:bg-junr-dark-bg selection:bg-junr-blue selection:text-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background Blobs for Mobile Feel */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-junr-blue/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="text-center z-10 max-w-2xl"
        >
           <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-gray-900 dark:text-white">
             junr
           </h1>
           <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
             The Future of Professional Connection.<br/>
             Manage your identity, business, and network in one place.
           </p>

           <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
             <Link
               href="/auth/signup"
               className="px-8 py-4 rounded-full bg-junr-blue text-white font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg shadow-junr-blue/30 flex items-center justify-center gap-2 w-full sm:w-auto"
             >
               Get Started <ArrowRight className="w-5 h-5" />
             </Link>
             <Link
               href="/auth/login"
               className="px-8 py-4 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-colors w-full sm:w-auto text-center"
             >
               Login
             </Link>
           </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 text-sm text-gray-400 dark:text-gray-600"
        >
            © 2024 junr. All rights reserved.
        </motion.div>
      </div>
    </main>
  )
}
