'use client';

import { Navbar } from '@/components/Navbar'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Bell, CheckCircle } from 'lucide-react'

export default function Notifications() {
  const { userInfo, isLoading: authLoading } = useContext(AuthContext);
  const { socket } = useSocket();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!authLoading && !userInfo) {
          router.push('/auth/login');
          return;
      }
      if (userInfo) {
          fetchNotifications();
      }
  }, [userInfo, authLoading]);

  useEffect(() => {
    if (socket) {
        socket.on('new_notification', (newNotif) => {
            console.log("New Notification:", newNotif);
            setNotifications(prev => [newNotif, ...prev]);
        });

        return () => {
            socket.off('new_notification');
        };
    }
  }, [socket]);

  const fetchNotifications = async () => {
      try {
          const res = await api.get(`/api/notifications/${userInfo?.id}`);
          if (res.data.success) {
              setNotifications(res.data.notifications);
          }
      } catch (err) {
          console.error("Failed to fetch notifications", err);
      } finally {
          setLoading(false);
      }
  };

  const markRead = async (id: number) => {
      try {
          await api.put(`/api/notifications/${id}/read`);
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: 1 } : n));
      } catch (e) {
          console.error(e);
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

      <main className="max-w-3xl mx-auto px-4 py-8 pt-24 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-500">
            Stay updated with your latest alerts.
          </p>
        </div>

        <div className="space-y-4">
            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications yet.</p>
                </div>
            ) : (
                notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-4 rounded-xl shadow-sm border transition-colors flex gap-4 ${
                            notif.read_status
                            ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500'
                            : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-gray-900 dark:text-white'
                        }`}
                        onClick={() => markRead(notif.id)}
                    >
                        <div className={`p-2 rounded-full h-fit flex-shrink-0 ${
                            notif.read_status ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-blue-100 dark:bg-blue-800 text-junr-blue'
                        }`}>
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">{notif.title}</h3>
                            <p className="text-sm">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                        {!notif.read_status && (
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-junr-blue"></div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  )
}
