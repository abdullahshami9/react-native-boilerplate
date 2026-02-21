'use client';

import { Navbar } from '@/components/Navbar'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Check, Clock, Package, X, MessageCircle, MapPin, Truck, ChevronRight } from 'lucide-react'
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper'
import { motion, AnimatePresence } from 'framer-motion';

export default function BusinessOrders() {
  const { userInfo, isLoading: authLoading } = useContext(AuthContext);
  const { socket } = useSocket();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Rider Modal State
  const [riderModalVisible, setRiderModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');

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
            fetchOrders();
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

  const updateStatus = async (orderId: number, status: string, riderDetails: any = {}) => {
      try {
          await api.put(`/api/orders/${orderId}/status`, { status, ...riderDetails });
          fetchOrders();
      } catch (err) {
          console.error("Failed to update status", err);
          alert('Failed to update order status');
      }
  };

  const handleAssignRider = () => {
    if (selectedOrderId && riderName && riderPhone) {
        updateStatus(selectedOrderId, 'out_for_delivery', { rider_name: riderName, rider_phone: riderPhone });
        setRiderModalVisible(false);
        setRiderName('');
        setRiderPhone('');
        setSelectedOrderId(null);
    } else {
        alert("Please fill in Rider details");
    }
  };

  const handleChat = async (buyerId: number, orderId: number) => {
    try {
        const res = await api.post(`/api/chats/initiate`, { user1_id: userInfo?.id, user2_id: buyerId, order_id: orderId });
        if (res.data.success) {
            router.push(`/messages?chatId=${res.data.chatId}`);
        }
    } catch (error) {
        console.error(error);
        alert('Failed to start chat');
    }
  };

  const filteredOrders = orders.filter(o => filterStatus === 'All' || o.status === filterStatus);

  if (authLoading || loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-junr-dark-bg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-junr-blue"></div>
          </div>
      );
  }

  const statusColors: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-junr-dark-bg transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500">Manage your incoming orders.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'pending', 'accepted', 'preparing', 'out_for_delivery', 'completed', 'cancelled'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        filterStatus === status
                            ? 'bg-junr-blue text-white shadow-md shadow-junr-blue/20'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    {status === 'All' ? 'All' : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
            ))}
        </div>

        <div className="space-y-4">
            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No {filterStatus !== 'All' ? filterStatus.replace('_', ' ') : ''} orders found.</p>
                </div>
            ) : (
                filteredOrders.map((order) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={order.id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Order #{order.id}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="font-medium text-gray-900 dark:text-white">{order.buyer_name || 'Guest Customer'}</span>
                                    {order.buyer_phone && <span>• {order.buyer_phone}</span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-junr-blue">{order.total_amount.toLocaleString()} PKR</p>
                                <p className="text-xs text-gray-400 capitalize">{order.payment_method}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                                    <span>{order.shipping_address || 'No shipping address provided'}</span>
                                </div>
                                {order.instructions && (
                                    <div className="text-sm bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 p-3 rounded-lg text-yellow-800 dark:text-yellow-200">
                                        <span className="font-bold block mb-1">Note:</span>
                                        {order.instructions}
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                                {order.items?.map((item: any, idx: number) => {
                                    const variant = item.variant ? (typeof item.variant === 'string' ? JSON.parse(item.variant) : item.variant) : null;
                                    const addons = item.selected_addons ? (typeof item.selected_addons === 'string' ? JSON.parse(item.selected_addons) : item.selected_addons) : [];

                                    return (
                                        <div key={idx} className="flex gap-3 text-sm">
                                            <div className="font-bold text-gray-400 w-6 pt-0.5">{item.quantity}x</div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                                                {variant && (
                                                    <p className="text-xs text-gray-500">Size: {variant.size} {variant.color && `/ ${variant.color}`}</p>
                                                )}
                                                {addons.length > 0 && (
                                                    <p className="text-xs text-gray-500">+ {addons.map((a: any) => a.name).join(', ')}</p>
                                                )}
                                            </div>
                                            <div className="text-gray-900 dark:text-white font-medium">{(item.price * item.quantity).toLocaleString()}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-wrap gap-3 justify-end items-center">
                            <button
                                onClick={() => handleChat(order.buyer_id, order.id)}
                                className="mr-auto text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-junr-blue flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" /> Chat with Customer
                            </button>

                            {order.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(order.id, 'cancelled')}
                                        className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                    <button
                                        onClick={() => updateStatus(order.id, 'accepted')}
                                        className="px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" /> Accept
                                    </button>
                                </>
                            )}

                            {order.status === 'accepted' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'preparing')}
                                    className="px-4 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    Start Preparing <ChevronRight className="w-4 h-4" />
                                </button>
                            )}

                            {order.status === 'preparing' && (
                                <button
                                    onClick={() => {
                                        setSelectedOrderId(order.id);
                                        setRiderModalVisible(true);
                                    }}
                                    className="px-4 py-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Truck className="w-4 h-4" /> Dispatch Rider
                                </button>
                            )}

                            {order.status === 'out_for_delivery' && (
                                <div className="flex items-center gap-4">
                                    <div className="text-xs text-right hidden sm:block">
                                        <p className="text-gray-500">Rider: <span className="font-medium text-gray-900 dark:text-white">{order.rider_name}</span></p>
                                        <p className="text-gray-400">{order.rider_phone}</p>
                                    </div>
                                    <button
                                        onClick={() => updateStatus(order.id, 'completed')}
                                        className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" /> Mark Completed
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))
            )}
        </div>

        {/* Rider Assignment Modal */}
        <AnimatePresence>
            {riderModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Assign Rider</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rider Name</label>
                                <input
                                    type="text"
                                    value={riderName}
                                    onChange={(e) => setRiderName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-junr-blue focus:border-transparent outline-none"
                                    placeholder="Enter name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rider Phone</label>
                                <input
                                    type="tel"
                                    value={riderPhone}
                                    onChange={(e) => setRiderPhone(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-junr-blue focus:border-transparent outline-none"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setRiderModalVisible(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignRider}
                                    className="flex-1 px-4 py-2 bg-junr-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </main>
    </div>
  )
}
