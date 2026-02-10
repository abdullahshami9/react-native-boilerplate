'use client';

import { Navbar } from '@/components/Navbar'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, MessageSquare } from 'lucide-react'
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper'
import Link from 'next/link'

export default function Connections() {
  const { userInfo, isLoading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!authLoading && !userInfo) {
          router.push('/auth/login');
          return;
      }
      if (userInfo) {
          fetchConnections();
      }
  }, [userInfo, authLoading]);

  const fetchConnections = async () => {
      try {
          const res = await api.get(`/api/connections/${userInfo?.id}`);
          if (res.data.success) {
              setConnections(res.data.connections);
          }
      } catch (err) {
          console.error("Failed to fetch connections", err);
      } finally {
          setLoading(false);
      }
  };

  if (authLoading || loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-junr-blue"></div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Connections
          </h1>
          <p className="text-gray-500">
            People you are following.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {connections.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No connections yet. Find people in <Link href="/discover" className="text-junr-blue hover:underline">Discover</Link>.</p>
                </div>
            ) : (
                connections.map((user) => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <Link href={`/profile/${user.id}`}>
                            <img
                                src={resolveImage(user.profile_pic_url, getDefaultImageForType(user.user_type === 'Business' ? 'business' : 'customer'))}
                                alt={user.name}
                                className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-gray-50 dark:border-gray-700"
                            />
                        </Link>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{user.name}</h3>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-xs rounded-full text-gray-500 mb-4 uppercase tracking-wider">{user.user_type}</span>

                        <div className="flex gap-2 w-full mt-auto">
                            <button className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  )
}
