import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Navigation, PackageCheck, Motorbike, Loader, Phone, Star, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryDashboard = () => {
  const { currentUser } = useAuth();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    // Orders ready for pickup (status = 'ready')
    const qReady = query(collection(db, 'orders'), where('status', '==', 'ready'));
    const unsubReady = onSnapshot(qReady, 
      (snap) => {
        const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailableOrders(orders);
      },
      (err) => console.error("Ready orders error:", err)
    );

    // Orders currently assigned to this driver
    const qMine = query(
      collection(db, 'orders'), 
      where('driverId', '==', currentUser.uid),
      where('status', 'in', ['picked', 'on_the_way'])
    );
    const unsubMine = onSnapshot(qMine,
      (snap) => {
        const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyOrders(orders);
        setLoading(false);
      },
      (err) => console.error("My orders error:", err)
    );

    return () => { unsubReady(); unsubMine(); };
  }, [currentUser]);

  const acceptOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      // Check if order still has status 'ready' (avoid double acceptance)
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists() && orderSnap.data().status === 'ready') {
        await updateDoc(orderRef, { 
          status: 'picked', 
          driverId: currentUser.uid, 
          driverName: currentUser.displayName || currentUser.email,
          pickedAt: new Date().toISOString()
        });
      } else {
        alert('This order has already been taken by another driver.');
      }
    } catch (err) {
      console.error('Accept error:', err);
      alert('Failed to accept order. Check permissions.');
    } finally {
      setActionLoading(null);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update order status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to get delivery fee (default 40 if not set)
  const getDeliveryFee = (order) => order.deliveryFee || 40;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Motorbike className="w-8 h-8 text-orange-500" />
              Delivery Dashboard
            </h1>
            <p className="text-slate-500 mt-1">Welcome back, {currentUser?.displayName || 'Driver'}!</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-sm font-bold text-slate-700">💰 Today's Earnings: ₹{(myOrders.length * 40).toFixed(0)}</span>
          </div>
        </div>

        {/* Active Deliveries Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Navigation className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-extrabold text-slate-900">Active Deliveries</h2>
            {myOrders.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{myOrders.length} active</span>
            )}
          </div>

          {myOrders.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 text-center text-slate-500 shadow-sm">
              <PackageCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No active deliveries. Accept an order from the list below!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {myOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10"><MapPin className="w-24 h-24" /></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                          {order.status === 'picked' ? 'Picked Up' : 'On The Way'}
                        </span>
                        <span className="font-extrabold text-slate-800 bg-white/50 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <DollarSign className="w-4 h-4" /> ₹{getDeliveryFee(order)}
                        </span>
                      </div>
                      
                      <p className="font-bold text-slate-900 text-lg mb-1">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-slate-600 mb-2 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {order.userName || 'Customer'}
                      </p>
                      <div className="text-sm text-slate-600 mb-6 flex items-start gap-1 bg-white/50 p-2 rounded-xl">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-orange-600" />
                        <span className="break-words">{order.address?.street}, {order.address?.city}, {order.address?.zip}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        {order.status === 'picked' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                            disabled={actionLoading === order.id}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {actionLoading === order.id ? <Loader className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                            Start Journey
                          </button>
                        )}
                        {order.status === 'on_the_way' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            disabled={actionLoading === order.id}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                          >
                            {actionLoading === order.id ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Available Orders Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <PackageCheck className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-extrabold text-slate-900">Ready for Pickup</h2>
            {availableOrders.length > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{availableOrders.length} available</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableOrders.length === 0 ? (
              <div className="col-span-full bg-white/60 backdrop-blur-sm p-8 rounded-3xl text-center text-slate-500 border border-slate-200">
                <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p>No orders ready for pickup right now. Check back later.</p>
              </div>
            ) : (
              availableOrders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">Ready for pickup</span>
                      <span className="text-xs text-slate-500">{order.items?.length || 0} items</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Order #{order.id.slice(-6).toUpperCase()}</h3>
                    <div className="p-3 bg-slate-50 rounded-xl mb-4 mt-2">
                      <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Delivery Address</p>
                      <p className="text-sm text-slate-800 font-medium line-clamp-2">{order.address?.street}, {order.address?.city} - {order.address?.zip}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="flex items-center gap-1 text-slate-600"><Clock className="w-4 h-4" /> Ready now</span>
                      <span className="font-bold text-orange-600 flex items-center gap-1"><DollarSign className="w-4 h-4" /> ₹{getDeliveryFee(order)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => acceptOrder(order.id)}
                    disabled={actionLoading === order.id}
                    className="w-full bg-slate-900 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === order.id ? <Loader className="w-5 h-5 animate-spin" /> : <Motorbike className="w-5 h-5" />}
                    Accept Delivery
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DeliveryDashboard;







// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
// import { db } from '../firebase';
// import { MapPin, Navigation, PackageCheck, Motorbike } from 'lucide-react';
// import { motion } from 'framer-motion';

// const DeliveryDashboard = () => {
//   const { currentUser } = useAuth();
//   const [availableOrders, setAvailableOrders] = useState([]);
//   const [myOrders, setMyOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Orders ready for pickup
//     const qReady = query(collection(db, 'orders'), where('status', '==', 'ready'));
//     const unsubReady = onSnapshot(qReady, (snap) => {
//       setAvailableOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     });

//     // Orders currently assigned to this driver
//     const qMine = query(collection(db, 'orders'), where('driverId', '==', currentUser.uid), where('status', 'in', ['picked', 'on_the_way']));
//     const unsubMine = onSnapshot(qMine, (snap) => {
//       setMyOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       setLoading(false);
//     });

//     return () => { unsubReady(); unsubMine(); };
//   }, [currentUser]);

//   const acceptOrder = async (orderId) => {
//     try {
//       await updateDoc(doc(db, 'orders', orderId), { 
//         status: 'picked', 
//         driverId: currentUser.uid, 
//         driverName: currentUser.displayName 
//       });
//     } catch (err) {
//       console.error(err);
//       alert('Error accepting order');
//     }
//   };

//   const updateOrderStatus = async (orderId, status) => {
//     try {
//       await updateDoc(doc(db, 'orders', orderId), { status });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) return <div className="pt-24 text-center">Loading delivery hub...</div>;

//   return (
//     <div className="min-h-screen pt-24 pb-12 bg-slate-50">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
//         {/* Active Deliveries */}
//         <section>
//           <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2"><Navigation className="w-6 h-6 text-blue-500" /> Active Deliveries</h2>
//           {myOrders.length === 0 ? (
//             <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center text-slate-500">You have no active deliveries right now.</div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {myOrders.map(order => (
//                 <motion.div layout key={order.id} className="bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
//                   <div className="absolute top-0 right-0 p-4 opacity-10"><MapPin className="w-24 h-24" /></div>
//                   <div className="relative z-10">
//                     <div className="flex justify-between items-start mb-4">
//                       <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold uppercase tracking-wider">{order.status.replace('_', ' ')}</span>
//                       <span className="font-extrabold text-slate-900">₹{order.deliveryFee || 40} Earned</span>
//                     </div>
//                     <p className="font-bold text-slate-900 text-lg mb-1">{order.userName}</p>
//                     <p className="text-sm text-slate-600 mb-6 flex items-start gap-1"><MapPin className="w-4 h-4 mt-0.5 shrink-0"/> {order.address?.street}, {order.address?.city}</p>
                    
//                     <div className="flex gap-2">
//                       {order.status === 'picked' && (
//                         <button onClick={() => updateOrderStatus(order.id, 'on_the_way')} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-all">Start Journey</button>
//                       )}
//                       {order.status === 'on_the_way' && (
//                         <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all"><PackageCheck className="w-5 h-5"/> Mark Delivered</button>
//                       )}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Available Orders */}
//         <section>
//           <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">Orders Ready for Pickup</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {availableOrders.length === 0 && <p className="text-slate-500 col-span-full">No orders available for pickup.</p>}
//             {availableOrders.map(order => (
//               <motion.div layout key={order.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
//                 <div>
//                   <h3 className="font-bold text-slate-900 mb-2 truncate">Restaurant Order</h3>
//                   <p className="text-xs text-slate-500 font-medium mb-4">{order.items.length} items to deliver</p>
//                   <div className="p-3 bg-slate-50 rounded-xl mb-6">
//                     <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Dropoff</p>
//                     <p className="text-sm text-slate-800 font-medium line-clamp-2">{order.address?.street}, {order.address?.city}</p>
//                   </div>
//                 </div>
//                 <button onClick={() => acceptOrder(order.id)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors shadow-sm">
//                   Accept Delivery (₹{order.deliveryFee || 40})
//                 </button>
//               </motion.div>
//             ))}
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// };

// export default DeliveryDashboard;
