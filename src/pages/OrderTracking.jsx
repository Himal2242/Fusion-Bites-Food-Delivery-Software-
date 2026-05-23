import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChefHat, PackageCheck, Truck, Home, ArrowLeft, Store } from 'lucide-react';

const STATUS_STEPS = [
  { id: 'placed', label: 'Order Placed', icon: Clock, desc: 'We have received your order' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Restaurant accepted your order' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Your food is being prepared' },
  { id: 'ready', label: 'Ready', icon: PackageCheck, desc: 'Ready for pickup' },
  { id: 'picked', label: 'Picked Up', icon: Store, desc: 'Delivery partner picked up the order' },
  { id: 'on_the_way', label: 'On the Way', icon: Truck, desc: 'Driver is heading to your location' },
  { id: 'delivered', label: 'Delivered', icon: Home, desc: 'Enjoy your meal!' }
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orders', orderId), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading order...</div>;
  if (!order) return <div className="min-h-screen pt-24 text-center">Order not found.</div>;

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all">
            <ArrowLeft className="w-5 h-5 text-zinc-700" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Track Order</h1>
            <p className="text-zinc-500 font-medium">Order ID: {orderId}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-zinc-100 flex flex-col items-center">

          <div className="w-full relative mt-8 mb-4 border-l-4 border-zinc-100 ml-4 lg:ml-0 lg:border-l-0 lg:border-t-4 lg:flex lg:justify-between pt-8 lg:pt-0">
            {/* Absolute Line Fill */}
            <motion.div
              initial={{ height: 0, width: 0 }}
              animate={{
                height: window.innerWidth < 1024 ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` : 4,
                width: window.innerWidth >= 1024 ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` : 4
              }}
              className="absolute left-[-4px] top-0 lg:top-[-4px] lg:left-0 bg-orange-500 transition-all duration-1000 ease-out"
            />

            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex lg:flex-col items-center gap-4 lg:gap-2 mb-10 lg:mb-0 ml-[-24px] lg:ml-0 lg:mt-[-24px] group">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isCompleted ? 1 : 0.8, backgroundColor: isCompleted ? '#f97316' : '#f4f4f5' }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 transition-colors duration-500`}
                  >
                    <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-zinc-400'}`} />
                  </motion.div>
                  <div className="lg:text-center mt-2 lg:mt-4 lg:absolute lg:top-14 lg:w-32 lg:-left-10">
                    <p className={`font-bold text-sm ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>{step.label}</p>
                    <p className="text-[10px] sm:text-xs font-medium text-zinc-500 leading-tight hidden sm:block">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100 space-y-6">
          <h3 className="font-bold text-xl text-zinc-900 border-b border-zinc-100 pb-4">Order Details</h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-zinc-600 text-xs">{item.quantity}x</span>
                  <span className="text-zinc-800">{item.name}</span>
                </div>
                <span className="text-zinc-900">₹{((item.price + item.addOns.reduce((s, a) => s + a.price, 0)) * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-zinc-100 font-extrabold flex justify-between text-lg text-zinc-900">
            <span>Total Paid</span>
            <span>₹{order.totalAmount.toFixed(0)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
