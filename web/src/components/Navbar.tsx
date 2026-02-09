'use client'

import Link from 'next/link'
import { ThemeToggle } from './ui/ThemeToggle'
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react'
import { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { userToken, userInfo, logout } = useContext(AuthContext)
  const router = useRouter()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tighter text-junr-blue">
            junr
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-junr-blue transition-colors">Home</Link>
            <Link href="/discover" className="text-sm font-medium hover:text-junr-blue transition-colors">Discover</Link>
            <Link href="/shop" className="text-sm font-medium hover:text-junr-blue transition-colors">Shop</Link>
            <Link href="/services" className="text-sm font-medium hover:text-junr-blue transition-colors">Services</Link>

            {userToken ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-junr-blue transition-colors">Dashboard</Link>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <Link href={`/profile/${userInfo?.id}`} className="flex items-center gap-2 hover:opacity-80">
                      {userInfo?.profile_pic_url ? (
                          <img src={`http://localhost:3000/${userInfo.profile_pic_url}`} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center dark:bg-gray-700">
                             <UserIcon className="w-4 h-4" />
                          </div>
                      )}
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-medium hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link href="/auth/login" className="px-4 py-2 rounded-full bg-junr-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10 dark:border-white/5"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/" className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setIsOpen(false)}>Home</Link>
              <Link href="/discover" className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setIsOpen(false)}>Discover</Link>
              <Link href="/shop" className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setIsOpen(false)}>Shop</Link>
              <Link href="/services" className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setIsOpen(false)}>Services</Link>

              {userToken ? (
                <>
                  <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  <Link href={`/profile/${userInfo?.id}`} className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setIsOpen(false)}>My Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-black/5 dark:hover:bg-white/5">Logout</button>
                </>
              ) : (
                <Link href="/auth/login" className="block px-3 py-2 mt-4 text-center rounded-md bg-junr-blue text-white font-semibold" onClick={() => setIsOpen(false)}>Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
