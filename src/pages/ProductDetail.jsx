import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Star, Clock, Flame, ArrowLeft, Plus, Minus, ShoppingBag, ChefHat, Loader, Leaf } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [chefNote, setChefNote] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev =>
      prev.find(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const itemTotal = product ? (product.price + addOnTotal) * quantity : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedAddOns);
    navigate('/cart');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-24"><Loader className="w-10 h-10 animate-spin text-orange-500" /></div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center pt-24 text-zinc-500 text-lg">Product not found.</div>;
  }

  return (
    <div className="min-h-screen pt-20 pb-32 bg-[#FAFAFA]">
      {/* Hero Image */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-72 md:h-[420px] overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-900 hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg mb-2">{product.categoryName}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">{product.name}</h1>
            <p className="text-white/80 text-sm mt-1">{product.restaurantName}</p>
          </div>
          <div className="text-3xl font-black text-white drop-shadow-lg">₹{product.price}</div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Quick Info Pills */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="font-bold text-amber-700">{product.rating || '4.5'}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-blue-700">{product.prepTime || '20 min'}</span>
              </div>
              {product.calories && (
                <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-rose-700">{product.calories}</span>
                </div>
              )}
              {product.isVeg && (
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-700">Vegetarian</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 space-y-3">
            <h2 className="text-xl font-bold text-zinc-900">About This Dish</h2>
            <p className="text-zinc-500 leading-relaxed">{product.description || 'A delicious dish prepared with love.'}</p>
          </div>

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">Ingredients</h2>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing, i) => (
                  <span key={i} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-100">{ing}</span>
                ))}
              </div>
            </div>
          )}

          {/* Add-Ons */}
          {product.addOns && product.addOns.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">Customize (Add-Ons)</h2>
              <div className="space-y-3">
                {product.addOns.map((addOn, i) => {
                  const isSelected = selectedAddOns.find(a => a.name === addOn.name);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleAddOn(addOn)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected ? 'border-orange-400 bg-orange-50' : 'border-zinc-200 hover:border-zinc-300'}`}
                    >
                      <span className="font-semibold text-zinc-800">{addOn.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-zinc-600">+₹{addOn.price}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-zinc-300'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chef Instructions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" /> Special Instructions
            </h2>
            <textarea
              value={chefNote}
              onChange={(e) => setChefNote(e.target.value)}
              placeholder="E.g. Less spicy, no onions, extra cheese..."
              className="w-full p-4 border border-zinc-200 rounded-2xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none h-24 text-zinc-800 placeholder:text-zinc-400"
            />
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-200 p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 bg-zinc-100 px-3 py-2 rounded-2xl">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-white rounded-xl transition-all">
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-8 text-center font-bold text-zinc-900 text-lg">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-white rounded-xl transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-[0_8px_20px_rgb(249,115,22,0.25)] flex items-center justify-center gap-3"
          >
            <ShoppingBag className="w-5 h-5" />
            Add to Cart — ₹{itemTotal.toFixed(0)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
