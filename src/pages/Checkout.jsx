import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, CreditCard, ChevronRight, CheckCircle, Smartphone, Banknote, Loader, QrCode, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, clearCart, cartTotal } = useCart();
  
  const [address, setAddress] = useState({ street: '', city: '', zip: '' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // If cart is empty and order not placed, redirect to menu
  useEffect(() => {
    if (!orderPlaced && cartItems.length === 0) {
      navigate('/menu');
    }
  }, [cartItems, orderPlaced, navigate]);

  // Compute totals from cart if state is missing (e.g., after refresh)
  const computeTotals = () => {
    const subtotal = cartTotal;
    const delivery = subtotal > 500 ? 0 : 40;
    const taxes = Math.round(subtotal * 0.05);
    const total = subtotal + delivery + taxes;
    return { subtotal, delivery, taxes, total };
  };

  const { subtotal: fallbackSubtotal, delivery: fallbackDelivery, taxes: fallbackTaxes, total: fallbackTotal } = computeTotals();

  // Use state values if provided, otherwise fallback to computed
  const discount = state?.discount || 0;
  const deliveryFee = state?.deliveryFee ?? fallbackDelivery;
  const taxes = state?.taxes ?? fallbackTaxes;
  const grandTotal = state?.grandTotal ?? fallbackTotal;

  const createOrder = async () => {
    try {
      const orderData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        items: cartItems,
        status: 'placed',
        address,
        paymentMethod,
        paymentStatus: 'paid',
        totalAmount: grandTotal,
        discountApplied: discount,
        couponCode: state?.couponCode || null,
        deliveryFee,
        taxes,
        restaurantId: cartItems[0]?.restaurantId || 'unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);
      setOrderPlaced(true);
      clearCart();
      setPaymentStatus('success');
      setTimeout(() => {
        setShowPaymentModal(false);
        navigate(`/order/${docRef.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error placing order:', err);
      setPaymentStatus('failed');
      setTimeout(() => {
        setShowPaymentModal(false);
        alert('Payment failed. Please try again.');
      }, 1500);
    }
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items first.');
      navigate('/menu');
      return;
    }
    setLoading(true);
    setShowPaymentModal(true);
    setPaymentStatus('processing');

    // Simulate payment processing
    if (paymentMethod === 'cod') {
      setTimeout(() => {
        setPaymentStatus('success');
        createOrder();
      }, 500);
    } else if (paymentMethod === 'card') {
      setTimeout(() => {
        setPaymentStatus('success');
        createOrder();
      }, 2000);
    } else if (paymentMethod === 'upi') {
      setTimeout(() => {
        setPaymentStatus('success');
        createOrder();
      }, 2500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.zip) {
      alert('Please fill delivery address');
      return;
    }
    handlePayment();
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-2 text-center">Order Confirmed!</h1>
        <p className="text-zinc-500 text-center mb-8">Thank you for your order. We've sent the details to the restaurant.</p>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 w-full max-w-sm mb-8">
          <p className="text-sm text-zinc-500 font-medium mb-1">Order ID</p>
          <p className="font-bold text-lg text-zinc-900 break-all">{orderId}</p>
        </div>
        <button onClick={() => navigate(`/order/${orderId}`)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-[0_8px_20px_rgb(249,115,22,0.25)] flex items-center gap-2">
          Track Order <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2"><MapPin className="w-6 h-6 text-orange-500" /> Delivery Address</h2>
              <div className="space-y-4">
                <input 
                  required type="text" placeholder="Street Address" 
                  value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required type="text" placeholder="City" 
                    value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400"
                  />
                  <input 
                    required type="text" placeholder="ZIP Code" 
                    value={address.zip} onChange={(e) => setAddress({...address, zip: e.target.value})}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2"><CreditCard className="w-6 h-6 text-blue-500" /> Payment Method</h2>
              <div className="space-y-3">
                <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-orange-500 accent-orange-500" />
                    <CreditCard className="w-5 h-5 text-zinc-600" />
                    <span className="font-bold text-zinc-900">Credit / Debit Card</span>
                  </div>
                </label>
                <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-orange-500 accent-orange-500" />
                    <Smartphone className="w-5 h-5 text-zinc-600" />
                    <span className="font-bold text-zinc-900">UPI / Wallets</span>
                  </div>
                </label>
                <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-orange-500 accent-orange-500" />
                    <Banknote className="w-5 h-5 text-zinc-600" />
                    <span className="font-bold text-zinc-900">Cash on Delivery</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="space-y-6">
            <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-lg mb-4 border-b border-zinc-700 pb-2">Final Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400"><span>Item Total</span><span>₹{cartTotal}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{discount}</span></div>}
                <div className="flex justify-between text-zinc-400"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
                <div className="flex justify-between text-zinc-400"><span>Taxes</span><span>₹{taxes}</span></div>
                <div className="pt-4 border-t border-zinc-700 flex justify-between font-extrabold text-xl text-white">
                  <span>To Pay</span><span>₹{grandTotal}</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-[0_8px_20px_rgb(249,115,22,0.25)] flex items-center justify-center gap-3"
            >
              {loading ? 'Processing...' : `Pay ₹${grandTotal}`} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Payment Modal (same as before – omitted for brevity, keep your existing modal code) */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl"
            >
              {paymentStatus === 'processing' && (
                <div className="flex flex-col items-center gap-4">
                  {paymentMethod === 'card' && (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                        <CreditCard className="w-16 h-16 text-orange-500" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-zinc-900">Processing Card Payment</h3>
                      <p className="text-zinc-500">Please wait while we verify your card...</p>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-orange-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} />
                      </div>
                    </>
                  )}
                  {paymentMethod === 'upi' && (
                    <>
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <QrCode className="w-16 h-16 text-blue-500" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-zinc-900">UPI Payment</h3>
                      <p className="text-zinc-500">Scan QR or open UPI app to complete payment</p>
                      <div className="bg-zinc-100 p-4 rounded-2xl w-40 h-40 flex items-center justify-center">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=fusionbites@okhdfcbank&pn=FusionBites&am=1&cu=INR" alt="UPI QR" className="w-full h-full" />
                      </div>
                      <p className="text-xs text-zinc-400">Mock QR – in real app, dynamic QR would be shown</p>
                    </>
                  )}
                  {paymentMethod === 'cod' && (
                    <>
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                        <Banknote className="w-16 h-16 text-green-500" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-zinc-900">Cash on Delivery</h3>
                      <p className="text-zinc-500">Confirming your order...</p>
                    </>
                  )}
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="flex flex-col items-center gap-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-zinc-900">Payment Successful!</h3>
                  <p className="text-zinc-500">Your order has been placed.</p>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="flex flex-col items-center gap-4">
                  <ShieldCheck className="w-16 h-16 text-red-500" />
                  <h3 className="text-xl font-bold text-red-600">Payment Failed</h3>
                  <p className="text-zinc-500">Please try again with different method.</p>
                  <button onClick={() => setShowPaymentModal(false)} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl font-bold">Close</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;








// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext';
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
// import { db } from '../firebase';
// import { MapPin, CreditCard, ChevronRight, CheckCircle } from 'lucide-react';
// import { motion } from 'framer-motion';

// const Checkout = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();
//   const { cartItems, clearCart } = useCart();
  
//   const [address, setAddress] = useState({ street: '', city: '', zip: '' });
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [loading, setLoading] = useState(false);
//   const [orderPlaced, setOrderPlaced] = useState(false);
//   const [orderId, setOrderId] = useState(null);

//   if (!state || !cartItems.length) {
//     return <div className="pt-24 text-center">Invalid checkout state. <button onClick={() => navigate('/menu')} className="text-orange-500 font-bold">Go to Menu</button></div>;
//   }

//   const { grandTotal, discount, deliveryFee, taxes, couponCode } = state;

//   const handlePlaceOrder = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Create a unique order document in Firestore
//       const orderData = {
//         userId: currentUser.uid,
//         userName: currentUser.displayName || currentUser.email,
//         items: cartItems,
//         status: 'placed', // placed -> confirmed -> preparing -> ready -> picked -> on_the_way -> delivered
//         address,
//         paymentMethod,
//         paymentStatus: 'paid', // Assuming mock successful payment
//         totalAmount: grandTotal,
//         discountApplied: discount,
//         couponCode: couponCode || null,
//         deliveryFee,
//         taxes,
//         restaurantId: cartItems[0].restaurantId, // Assuming single restaurant order for demo
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       };

//       const docRef = await addDoc(collection(db, 'orders'), orderData);
//       setOrderId(docRef.id);
//       setOrderPlaced(true);
//       clearCart();
//     } catch (err) {
//       console.error('Error placing order:', err);
//       alert('Failed to place order. Try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (orderPlaced) {
//     return (
//       <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
//         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
//           <CheckCircle className="w-12 h-12 text-green-500" />
//         </motion.div>
//         <h1 className="text-3xl font-extrabold text-zinc-900 mb-2 text-center">Order Confirmed!</h1>
//         <p className="text-zinc-500 text-center mb-8">Thank you for your order. We've sent the details to the restaurant.</p>
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 w-full max-w-sm mb-8">
//           <p className="text-sm text-zinc-500 font-medium mb-1">Order ID</p>
//           <p className="font-bold text-lg text-zinc-900 break-all">{orderId}</p>
//         </div>
//         <button onClick={() => navigate(`/order/${orderId}`)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-[0_8px_20px_rgb(249,115,22,0.25)] flex items-center gap-2">
//           Track Order <ChevronRight className="w-5 h-5" />
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen pt-24 pb-12 bg-[#FAFAFA]">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h1 className="text-3xl font-extrabold text-zinc-900 mb-8">Checkout</h1>
        
//         <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           <div className="lg:col-span-2 space-y-8">
//             {/* Delivery Address */}
//             <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
//               <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2"><MapPin className="w-6 h-6 text-orange-500" /> Delivery Address</h2>
//               <div className="space-y-4">
//                 <input 
//                   required type="text" placeholder="Street Address" 
//                   value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})}
//                   className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400"
//                 />
//                 <div className="grid grid-cols-2 gap-4">
//                   <input 
//                     required type="text" placeholder="City" 
//                     value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})}
//                     className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400"
//                   />
//                   <input 
//                     required type="text" placeholder="ZIP Code" 
//                     value={address.zip} onChange={(e) => setAddress({...address, zip: e.target.value})}
//                     className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Payment Method */}
//             <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
//               <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2"><CreditCard className="w-6 h-6 text-blue-500" /> Payment Method</h2>
//               <div className="space-y-3">
//                 <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
//                   <div className="flex items-center gap-3">
//                     <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-orange-500 accent-orange-500" />
//                     <span className="font-bold text-zinc-900">Credit / Debit Card</span>
//                   </div>
//                 </label>
//                 <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
//                   <div className="flex items-center gap-3">
//                     <input type="radio" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-orange-500 accent-orange-500" />
//                     <span className="font-bold text-zinc-900">UPI / Wallets</span>
//                   </div>
//                 </label>
//                 <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
//                   <div className="flex items-center gap-3">
//                     <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-orange-500 accent-orange-500" />
//                     <span className="font-bold text-zinc-900">Cash on Delivery</span>
//                   </div>
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Checkout Summary */}
//           <div className="space-y-6">
//             <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
//               <h3 className="font-bold text-lg mb-4 border-b border-zinc-700 pb-2">Final Summary</h3>
//               <div className="space-y-3 text-sm">
//                 <div className="flex justify-between text-zinc-400"><span>Item Total</span><span>₹{(grandTotal + discount - deliveryFee - taxes).toFixed(0)}</span></div>
//                 {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{discount}</span></div>}
//                 <div className="flex justify-between text-zinc-400"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
//                 <div className="flex justify-between text-zinc-400"><span>Taxes</span><span>₹{taxes}</span></div>
//                 <div className="pt-4 border-t border-zinc-700 flex justify-between font-extrabold text-xl text-white">
//                   <span>To Pay</span><span>₹{grandTotal.toFixed(0)}</span>
//                 </div>
//               </div>
//             </div>

//             <button 
//               type="submit" 
//               disabled={loading}
//               className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-[0_8px_20px_rgb(249,115,22,0.25)] flex items-center justify-center gap-3"
//             >
//               {loading ? 'Processing...' : `Pay ₹${grandTotal.toFixed(0)}`} <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Checkout;
