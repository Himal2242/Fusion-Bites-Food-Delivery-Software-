import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, X, ArrowRight, Receipt } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  // State
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  // Calculations
  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const taxes = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal - discount + deliveryFee + taxes;

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    setIsApplying(true);

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()), where('active', '==', true));
      const snap = await getDocs(q);

      if (snap.empty) {
        setCouponError('Invalid or expired coupon code.');
        setDiscount(0);
        setCouponApplied(null);
        setIsApplying(false);
        return;
      }

      const coupon = snap.docs[0].data();
      const minOrder = coupon.minOrder || 0;

      if (cartTotal < minOrder) {
        setCouponError(`Minimum order ₹${minOrder} required.`);
        setIsApplying(false);
        return;
      }

      let discountAmt = 0;
      if (coupon.type === 'percentage') {
        discountAmt = Math.min(Math.round(cartTotal * coupon.value / 100), coupon.maxDiscount || Infinity);
      } else {
        discountAmt = coupon.value;
      }

      setDiscount(discountAmt);
      setCouponApplied(coupon);
    } catch (err) {
      setCouponError('Error applying coupon.');
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  // --- EMPTY STATE ---
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-[#FAFAFA] flex flex-col items-center justify-center gap-6 px-4 selection:bg-orange-200 selection:text-orange-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="w-32 h-32 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center border border-zinc-100"
        >
          <ShoppingBag className="w-14 h-14 text-zinc-300" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Your cart is empty</h2>
          <p className="text-zinc-500 font-medium max-w-sm mx-auto">Looks like you haven't added anything yet. Let's find you something delicious!</p>
        </div>
        <button
          onClick={() => navigate('/menu')}
          className="mt-4 bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-zinc-900/20 flex items-center gap-2"
        >
          Browse Menu <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // --- POPULATED CART STATE ---
  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#FAFAFA] font-sans selection:bg-orange-200 selection:text-orange-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white border border-zinc-200/80 rounded-full flex items-center justify-center hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm active:scale-95 text-zinc-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Your Order</h1>
            <p className="text-zinc-500 font-medium mt-1">{cartCount} item{cartCount > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* --- LEFT COLUMN: CART ITEMS --- */}
          <div className="lg:col-span-7 space-y-5">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={`${item.productId}-${JSON.stringify(item.addOns)}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2rem] p-4 sm:p-5 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex gap-4 sm:gap-6 group"
                >
                  {/* Item Image */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-zinc-50 rounded-[1.5rem] overflow-hidden">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-zinc-900 leading-tight mb-1">{item.name}</h3>
                        <p className="text-sm font-medium text-zinc-400">{item.restaurantName}</p>

                        {item.addOns?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.addOns.map(a => (
                              <span key={a.name} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100">
                                + {a.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Delete Button (Moved to top right for cleaner UI) */}
                      <button
                        onClick={() => removeFromCart(item.productId, item.addOns)}
                        className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Bottom Row: Controls & Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 bg-zinc-50 rounded-2xl border border-zinc-200/80 p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.addOns)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-zinc-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-zinc-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.addOns)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-zinc-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xl font-black text-zinc-900 tracking-tight">
                        ₹{((item.price + (item.addOns?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY (STICKY) --- */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-28 space-y-6">

              {/* Coupon Section */}
              <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-orange-500" /> Apply Promo Code
                </h3>

                {couponApplied ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                        <Tag className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-extrabold text-emerald-800 uppercase tracking-wide">{couponApplied.code}</p>
                        <p className="text-sm font-medium text-emerald-600">You saved ₹{discount}</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="p-2 text-emerald-600 hover:text-emerald-800 bg-emerald-100/50 hover:bg-emerald-200 rounded-full transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2 relative">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME50"
                        className="flex-1 px-5 py-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-zinc-900 font-bold uppercase transition-all placeholder:font-medium placeholder:normal-case placeholder:text-zinc-400"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={isApplying || !couponCode.trim()}
                        className="px-6 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95"
                      >
                        {isApplying ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-red-500 px-2">
                        {couponError}
                      </motion.p>
                    )}
                  </div>
                )}
              </div>

              {/* Receipt / Bill Details */}
              <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden">
                {/* Decorative receipt zig-zag top (Optional nice UI touch) */}
                <div className="absolute top-0 left-4 right-4 h-1 flex space-x-1 overflow-hidden opacity-10">
                  {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-4 bg-zinc-900 transform rotate-45 -mt-2"></div>)}
                </div>

                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-5 mt-2">
                  <Receipt className="w-5 h-5 text-zinc-400" /> Bill Details
                </h3>

                <div className="space-y-4 text-base font-medium">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Subtotal</span>
                    <span className="text-zinc-900 font-bold">₹{cartTotal.toFixed(0)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>Discount ({couponApplied?.code})</span>
                      <span className="font-bold">-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md uppercase tracking-wider">Free</span>
                    ) : (
                      <span className="text-zinc-900 font-bold">₹{deliveryFee}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Taxes & Fees (5%)</span>
                    <span className="text-zinc-900 font-bold">₹{taxes}</span>
                  </div>

                  <hr className="border-dashed border-zinc-200 my-4" />

                  <div className="flex justify-between items-end text-zinc-900">
                    <div>
                      <span className="block font-black text-xl">Grand Total</span>
                      <span className="text-xs text-zinc-500 font-medium">Includes all taxes</span>
                    </div>
                    <span className="font-black text-3xl tracking-tight text-orange-500">
                      ₹{grandTotal.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sticky Mobile Checkout Button / Normal Desktop Button */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-200/80 lg:relative lg:p-0 lg:bg-transparent lg:border-none lg:backdrop-blur-none z-40">
                <button
                  onClick={() => navigate('/checkout', { state: { discount, couponCode: couponApplied?.code, deliveryFee, taxes, grandTotal } })}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-[1.25rem] font-black text-lg transition-all active:scale-[0.98] shadow-[0_8px_20px_rgb(249,115,22,0.25)] flex items-center justify-center gap-3"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;