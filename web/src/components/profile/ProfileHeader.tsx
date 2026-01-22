'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { User } from '@/data/mock'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, MessageCircle, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const { scrollY } = useScroll();

  const headerHeight = useTransform(scrollY, [0, 200], [320, 100]);
  const borderRadius = useTransform(scrollY, [0, 200], [40, 0]); // 40px to 0px (full width usually implies 0 radius on web, or keep 0)
  // Actually on web, usually sticky headers are rectangular. But app had rounded corners. I'll stick to logic.

  // Text Color / Opacity
  const infoOpacity = useTransform(scrollY, [100, 200], [0, 1]); // Name fades in on header when collapsed
  const bodyInfoOpacity = useTransform(scrollY, [0, 100], [1, 0]); // Main QR/Info fades out

  // Avatar Animation
  const avatarScale = useTransform(scrollY, [0, 200], [1, 0.5]);
  const avatarY = useTransform(scrollY, [0, 200], [0, -140]); // Move up
  const avatarX = useTransform(scrollY, [0, 200], [0, -120]); // Move left to fit in header?
  // On web, centering logic might differ.
  // Let's keep it simple: Start center, shrink and move to left corner.

  return (
    <>
      <motion.div
        style={{ height: headerHeight, borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }}
        className="fixed top-0 left-0 right-0 z-40 bg-gray-200 dark:bg-gray-800 shadow-lg overflow-hidden flex items-center justify-center"
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-blue-500/10 dark:bg-black/20" />

        {/* Top Nav Icons */}
        <div className="absolute top-4 w-full px-6 flex justify-between items-center z-50">
           <Link href="/" className="p-2 bg-white/20 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors">
             <ArrowLeft className="w-6 h-6 text-junr-dark-bg dark:text-white" />
           </Link>
           {isOwnProfile && (
             <button className="p-2 bg-white/20 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors">
               <div className="w-6 h-6 border-2 border-junr-dark-bg dark:border-white rounded-full" />
             </button>
           )}
        </div>

        {/* Collapsed Header Info (Fades In) */}
        <motion.div style={{ opacity: infoOpacity }} className="absolute bottom-4 left-24 text-left z-40">
           <h1 className="text-xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
           <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
        </motion.div>

        {/* Expanded Info (Fades Out) */}
        <motion.div style={{ opacity: bodyInfoOpacity }} className="flex flex-col items-center justify-center pt-10 z-30">
           {/* QR Code Card */}
           <div className="bg-white p-4 rounded-2xl shadow-xl mb-8 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <QRCodeSVG value={`raabtaa://user/${user.id}`} size={120} />
           </div>
        </motion.div>

        {/* Avatar - Absolute Positioned to animate */}
        <motion.div
          style={{
             scale: avatarScale,
             y: avatarY,
             x: avatarX // Adjust based on screen width? This is tricky on web responsive.
             // On mobile app, dimensions are fixed. On web, center is relative.
             // I will use a smarter layout:
             // When collapsed, it should be top-left.
             // When expanded, center-bottom (overlapping the header edge).
          }}
          className="absolute bottom-[-50px] left-0 right-0 mx-auto w-32 h-32 z-50 flex items-center justify-center pointer-events-none"
        >
           <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-white">
              <Image
                src={user.profile_pic_url}
                alt={user.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
           </div>
        </motion.div>

      </motion.div>

      {/* Spacer to push content down */}
      <div style={{ height: 320 }} />
    </>
  )
}

export function ProfileInfo({ user, isBusiness }: { user: User, isBusiness: boolean }) {
    return (
        <div className="flex flex-col items-center mt-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${isBusiness ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {isBusiness ? 'Business' : 'Individual'}
            </span>

            <div className="flex gap-4 mt-6">
                 <button className="p-3 bg-junr-blue rounded-full text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                    <Phone className="w-5 h-5" />
                 </button>
                 <button className="p-3 bg-junr-blue rounded-full text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                    <MessageCircle className="w-5 h-5" />
                 </button>
                 {isBusiness && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-full">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Karachi, PK</span>
                     </div>
                 )}
            </div>
        </div>
    )
}
