'use client';

import { Navbar } from '@/components/Navbar'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Check, Clock, Package, X } from 'lucide-react'
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper'

export default function BusinessOrders() {
  const { userInfo, isLoading: authLoading } = useContext(AuthContext);
  const { socket } = useSocket();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!authLoading && !userInfo) {
          router.push('/auth/login');
          return;
      }
      if (userInfo && userInfo.user_type !== 'Business') {
          router.push('/discover');
          return;
      }

      if (userInfo) {
          fetchOrders();
      }
  }, [userInfo, authLoading]);

  // Real-time listener
  useEffect(() => {
    if (socket) {
        socket.on('new_order', (newOrder) => {
            console.log("New Order Received:", newOrder);
            // Re-fetch to get full details (like items and buyer name) which might not be in payload
            // Or optimistically add if payload is sufficient. Usually ID is enough to fetch details.
            // For simplicity, let's re-fetch.
            fetchOrders();
            // Optional: Show toast
            alert(`New Order Received: ${newOrder.total_amount} PKR`);
        });

        return () => {
            socket.off('new_order');
        };
    }
  }, [socket]);

  const fetchOrders = async () => {
      try {
          const res = await api.get(`/api/orders/business/${userInfo?.id}`);
          if (res.data.success) {
              setOrders(res.data.orders);
          }
      } catch (err) {
          console.error("Failed to fetch orders", err);
      } finally {
          setLoading(false);
      }
  };

  const updateStatus = async (orderId: number, status: string) => {
      try {
          await api.put(`/api/orders/${orderId}/status`, { status });
          fetchOrders(); // Refresh
      } catch (err) {
          console.error("Failed to update status", err);
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
            Orders
          </h1>
          <p className="text-gray-500">
            Manage your incoming orders.
          </p>
        </div>

        <div className="space-y-4">
            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet.</p>
                </div>
            ) : (
                orders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Order #{order.id}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Placed by <span className="font-medium text-gray-900 dark:text-white">{order.buyer_name || 'Guest'}</span> on {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-junr-blue">{order.total_amount.toLocaleString()} PKR</p>
                                <p className="text-xs text-gray-400 capitalize">{order.payment_method}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="border-t border-gray-100 dark:border-gray-700 py-4 space-y-3">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <img
                                        src={resolveImage(item.image_url, getDefaultImageForType('product', item.product_name))}
                                        alt={item.product_name}
                                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} x {item.price} PKR</p>
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">{(item.quantity * item.price).toLocaleString()} PKR</p>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        {order.status === 'pending' && (
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                    className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                                <button
                                    onClick={() => updateStatus(order.id, 'accepted')}
                                    className="px-4 py-2 text-white bg-junr-blue hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Accept
                                </button>
                            </div>
                        )}
                        {order.status === 'accepted' && (
                             <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Mark Completed
                                </button>
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
