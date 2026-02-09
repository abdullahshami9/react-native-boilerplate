'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { User } from '@/types'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, MessageCircle, Phone, MapPin, Edit } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const { scrollY } = useScroll();

  const headerHeight = useTransform(scrollY, [0, 200], [320, 100]);
  const borderRadius = useTransform(scrollY, [0, 200], [40, 0]);

  // Text Color / Opacity
  const infoOpacity = useTransform(scrollY, [100, 200], [0, 1]);
  const bodyInfoOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  // Avatar Animation
  const avatarScale = useTransform(scrollY, [0, 200], [1, 0.5]);
  const avatarY = useTransform(scrollY, [0, 200], [0, -140]);

  const profilePicUrl = user.profile_pic_url
      ? (user.profile_pic_url.startsWith('http') ? user.profile_pic_url : `http://localhost:3000/${user.profile_pic_url}`)
      : null;

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
           <Link href="/dashboard" className="p-2 bg-white/20 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors">
             <ArrowLeft className="w-6 h-6 text-junr-dark-bg dark:text-white" />
           </Link>
           {isOwnProfile && (
             <Link href="/settings" className="p-2 bg-white/20 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors">
               <Edit className="w-5 h-5 text-gray-800 dark:text-white" />
             </Link>
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
          }}
          className="absolute bottom-[-50px] left-0 right-0 mx-auto w-32 h-32 z-50 flex items-center justify-center pointer-events-none"
        >
           <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-white flex items-center justify-center">
              {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
              ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl">
                      {user.name.charAt(0)}
                  </div>
              )}
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
            <p className="text-gray-500 dark:text-gray-400">{user.current_job_title || (isBusiness ? 'Business Account' : 'Individual')}</p>
            {isBusiness && (
                 <span className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    Business
                 </span>
            )}

            {!isBusiness && user.address && (
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {user.address}
                </div>
            )}

            <div className="flex gap-4 mt-6">
                 {user.phone && (
                     <a href={`tel:${user.phone}`} className="p-3 bg-junr-blue rounded-full text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                        <Phone className="w-5 h-5" />
                     </a>
                 )}
                 <button className="p-3 bg-junr-blue rounded-full text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                    <MessageCircle className="w-5 h-5" />
                 </button>
            </div>
        </div>
    )
}
