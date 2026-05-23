import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Package, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CustomerOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    
    // Query orders for this user
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid)
      // orderBy can be omitted to avoid composite index error, we sort on client
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by creation time descending locally
      orderData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setOrders(orderData);
      setLoading(false);
    }, (error) => {
      console.error("Order fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading your orders...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-8 flex items-center gap-3">
          <Package className="w-8 h-8 text-orange-500" /> My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-zinc-100 text-center shadow-sm">
            <Package className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">No orders yet</h2>
            <p className="text-zinc-500 mb-6">You haven't placed any orders yet. Let's fix that!</p>
            <button onClick={() => navigate('/menu')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold transition-all">
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={order.id} 
                onClick={() => navigate(`/order/${order.id}`)}
                className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      ['placed', 'confirmed', 'preparing', 'ready', 'picked', 'on_the_way'].includes(order.status) ? 'bg-orange-100 text-orange-700' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-zinc-500 font-medium">Order #{order.id.slice(0,8).toUpperCase()}</span>
                  </div>
                  
                  <h3 className="font-bold text-zinc-900 text-lg mb-2">
                    {order.items?.length || 0} Items
                  </h3>
                  <div className="space-y-1 mb-4">
                    {order.items?.map((item, i) => (
                      <p key={i} className="text-sm text-zinc-600">
                        <span className="font-bold">{item.quantity}x</span> {item.name}
                      </p>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" /> 
                    {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleString() : 'Recently'}
                  </p>
                </div>

                <div className="md:border-l border-zinc-100 md:pl-6 flex flex-col justify-between items-start md:items-end">
                  <div className="text-left md:text-right mb-4">
                    <p className="text-sm text-zinc-500 font-medium">Total Paid</p>
                    <p className="text-2xl font-black text-zinc-900">₹{order.totalAmount}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-500 group-hover:text-orange-600 transition-colors">
                    Track Order <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
