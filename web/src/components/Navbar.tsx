'use client'

import Link from 'next/link'
import { ThemeToggle } from './ui/ThemeToggle'
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react'
import { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { userToken, userInfo, logout } = useContext(AuthContext)
  const router = useRouter()
  const pathname = usePathname();

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const isBusiness = userInfo?.user_type?.toLowerCase() === 'business';
  const isCustomer = !isBusiness;

  // Navigation Links based on Role
  const businessLinks = [
    { name: 'Profile', href: `/profile/${userInfo?.id}` },
    { name: 'Stats', href: '/business/stats' },
    { name: 'Orders', href: '/business/orders' },
    { name: 'Notifications', href: '/notifications' },
  ];

  const customerLinks = [
    { name: 'Discover', href: '/discover' },
    { name: 'Connections', href: '/connections' },
    { name: 'Shop', href: '/shop' },
    { name: 'Profile', href: `/profile/${userInfo?.id}` },
  ];

  const publicLinks = [
    { name: 'Home', href: '/' },
    { name: 'Discover', href: '/discover' },
    { name: 'Shop', href: '/shop' },
    { name: 'Services', href: '/services' },
  ];

  const currentLinks = userToken ? (isBusiness ? businessLinks : customerLinks) : publicLinks;

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
            {currentLinks.map((link) => (
               <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-junr-blue font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-junr-blue'}`}
               >
                 {link.name}
               </Link>
            ))}

            {userToken ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                <ThemeToggle />
                <button onClick={handleLogout} className="text-sm font-medium hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                </button>
                <Link href={`/profile/${userInfo?.id}`} className="flex items-center gap-2 hover:opacity-80">
                    <img
                      src={resolveImage(userInfo?.profile_pic_url, getDefaultImageForType(isBusiness ? 'business' : 'customer'))}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                </Link>
              </div>
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
              {currentLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 ${pathname === link.href ? 'text-junr-blue font-bold' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {userToken ? (
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-black/5 dark:hover:bg-white/5 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">Logout</button>
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
