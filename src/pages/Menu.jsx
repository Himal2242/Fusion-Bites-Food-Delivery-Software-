import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, Clock, Plus, Flame, X, Minus, ShoppingBag, MapPin, Store, ChevronLeft, Info, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';

const CATEGORIES = ["All", "Popular 🔥", "Burgers", "Pizza", "Sushi", "Healthy", "Desserts", "Drinks"];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Fetch products from Firestore
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" ||
      (activeCategory === "Popular 🔥" && item.popular) ||
      item.categoryName === activeCategory ||
      item.category === activeCategory;
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openProductPage = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    document.body.style.overflow = 'hidden';
  };

  const closeProductPage = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'unset';
  };

  const toCartItem = (product) => ({
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image || product.img,
    restaurantId: product.restaurantId || 'demo_rest', // Added restaurantId
    restaurantName: product.restaurantName || "FusionBites",
    addOns: []
  });

  const handleAddFromGrid = (e, product) => {
    e.stopPropagation();
    addToCart(toCartItem(product), 1, []);
  };

  const handleAddFromModal = () => {
    addToCart(toCartItem(selectedItem), quantity, []);
    closeProductPage();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#FAFAFA] font-sans selection:bg-orange-200 selection:text-orange-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              Discover Delicious
            </h1>
            <p className="text-zinc-500 text-lg font-medium">Explore premium dishes from top chefs.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200/80 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm outline-none transition-all placeholder:text-zinc-400 font-medium text-zinc-800"
              />
            </div>
            <button className="p-4 bg-white border border-zinc-200/80 rounded-2xl hover:bg-zinc-50 transition-all text-zinc-700 shadow-sm active:scale-95">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex overflow-x-auto pb-6 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative px-7 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300
                ${activeCategory === category
                  ? 'text-white shadow-[0_8px_20px_rgb(249,115,22,0.25)]'
                  : 'text-zinc-500 bg-white border border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm'
                }`}
            >
              {activeCategory === category && (
                <motion.div layoutId="activeCategoryBg" className="absolute inset-0 bg-orange-500 rounded-2xl -z-10" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          ))}
        </motion.div>

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => openProductPage(item)}
                  className="bg-white rounded-[2rem] p-4 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)] transition-all duration-500 group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-5 bg-zinc-100">
                    <img
                      src={item.image || item.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.prepTime && (
                        <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-xs font-bold text-zinc-800 flex items-center gap-1.5 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {item.prepTime}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow space-y-3 px-2 pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-bold text-lg text-zinc-900 leading-snug line-clamp-2">{item.name}</h3>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium flex-grow">{item.categoryName || item.category}</p>
                    <div className="pt-4 flex items-center justify-between border-t border-zinc-100">
                      <div className="text-2xl font-black text-zinc-900 tracking-tight">
                        ₹{Number(item.price).toFixed(0)}
                      </div>
                      <button
                        onClick={(e) => handleAddFromGrid(e, item)}
                        className="w-12 h-12 bg-zinc-50 text-zinc-900 rounded-2xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-32 text-center flex flex-col items-center">
            <h3 className="text-2xl font-bold text-zinc-900">No dishes found</h3>
          </div>
        )}
      </div>

      {/* Product Detail Modal (Full page) */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
              <div className="relative h-[45vh] w-full bg-zinc-100">
                <img
                  src={selectedItem.image || selectedItem.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                <button
                  onClick={closeProductPage}
                  className="absolute top-8 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-6 h-6 ml-[-2px]" />
                </button>
              </div>

              <div className="relative -mt-10 bg-white rounded-t-[2.5rem] px-6 sm:px-12 pt-8 flex flex-col gap-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                    <Store className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-900 text-lg">
                      {selectedItem.restaurantName || "The Gourmet Kitchen"}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 1.2 miles away</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-orange-600"><Star className="w-3.5 h-3.5 fill-current" /> 4.9 Excellent</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-start gap-6 mb-4">
                    <h2 className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight">
                      {selectedItem.name}
                    </h2>
                    <div className="text-3xl md:text-4xl font-black text-orange-500 shrink-0 mt-1">
                      ₹{Number(selectedItem.price).toFixed(0)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-zinc-600">
                    {selectedItem.prepTime && (
                      <span className="flex items-center gap-1.5 bg-zinc-100 px-4 py-2 rounded-xl">
                        <Clock className="w-4 h-4 text-zinc-400" /> {selectedItem.prepTime}
                      </span>
                    )}
                    {selectedItem.calories && (
                      <span className="flex items-center gap-1.5 bg-zinc-100 px-4 py-2 rounded-xl">
                        <Flame className="w-4 h-4 text-orange-500" /> {selectedItem.calories}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-2 rounded-xl">
                      <Info className="w-4 h-4" /> Freshly Prepared
                    </span>
                  </div>
                </div>

                <hr className="border-zinc-100" />

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-zinc-900">About this dish</h3>
                  <p className="text-zinc-600 leading-relaxed text-lg">
                    {selectedItem.description || "A masterfully crafted dish using the finest, locally sourced ingredients. Perfect for satisfying your cravings with a touch of culinary excellence."}
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Buy Bar */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-zinc-100 px-6 py-5 pb-safe shadow-[0_-10px_40px_rgb(0,0,0,0.05)] z-50">
              <div className="max-w-4xl mx-auto flex items-center gap-6">
                <div className="flex items-center justify-between gap-4 bg-zinc-50 px-2 py-2 rounded-2xl border border-zinc-200/80 w-36 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="font-bold text-zinc-900 text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleAddFromModal}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-5 px-6 rounded-2xl font-bold text-lg md:text-xl transition-all active:scale-[0.98] shadow-[0_8px_20px_rgb(249,115,22,0.25)] flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="w-6 h-6" />
                  Add to Order • ₹{(selectedItem.price * quantity).toFixed(0)}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1.25rem); }
      `}} />
    </div>
  );
};

export default Menu;







// import React, { useState, useEffect } from 'react';
// import { Search, SlidersHorizontal, Star, Clock, Plus, Flame, Loader } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { collection, getDocs, query, orderBy } from 'firebase/firestore';
// import { db } from '../firebase';
// import { useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';

// const Menu = () => {
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const { addToCart } = useCart();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [prodSnap, catSnap] = await Promise.all([
//           getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
//           getDocs(collection(db, 'categories'))
//         ]);
//         setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
//         setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
//       } catch (err) {
//         console.error('Error fetching menu:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const categoryNames = ["All", "Popular 🔥", ...categories.map(c => c.name)];

//   const filteredItems = products.filter(item => {
//     const matchesCategory = activeCategory === "All" ||
//       (activeCategory === "Popular 🔥" && item.popular) ||
//       item.categoryName === activeCategory;
//     const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center pt-24">
//         <Loader className="w-10 h-10 animate-spin text-orange-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen pt-24 pb-20 bg-[#FAFAFA]">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         {/* Header & Search */}
//         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
//           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
//             <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
//               Discover Delicious
//             </h1>
//             <p className="text-zinc-500 text-lg font-medium">Explore premium dishes from top chefs.</p>
//           </motion.div>

//           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 w-full lg:w-auto">
//             <div className="relative flex-1 lg:w-96">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
//               <input
//                 type="text"
//                 placeholder="Search for food..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200/80 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm outline-none transition-all placeholder:text-zinc-400 font-medium text-zinc-800"
//               />
//             </div>
//             <button className="p-4 bg-white border border-zinc-200/80 rounded-2xl hover:bg-zinc-50 transition-all text-zinc-700 shadow-sm active:scale-95">
//               <SlidersHorizontal className="w-5 h-5" />
//             </button>
//           </motion.div>
//         </div>

//         {/* Categories */}
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex overflow-x-auto pb-6 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-3">
//           {categoryNames.map((category) => (
//             <button
//               key={category}
//               onClick={() => setActiveCategory(category)}
//               className={`relative px-7 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300
//                 ${activeCategory === category
//                   ? 'text-white shadow-[0_8px_20px_rgb(249,115,22,0.25)]'
//                   : 'text-zinc-500 bg-white border border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm'
//                 }`}
//             >
//               {activeCategory === category && (
//                 <motion.div layoutId="activeCategoryBg" className="absolute inset-0 bg-orange-500 rounded-2xl -z-10" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
//               )}
//               <span className="relative z-10">{category}</span>
//             </button>
//           ))}
//         </motion.div>

//         {/* Menu Grid */}
//         {filteredItems.length > 0 ? (
//           <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//             <AnimatePresence>
//               {filteredItems.map((item, index) => (
//                 <motion.div
//                   key={item.id}
//                   layout
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ duration: 0.4, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
//                   onClick={() => navigate(`/product/${item.id}`)}
//                   className="bg-white rounded-[2rem] p-4 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)] transition-all duration-500 group cursor-pointer flex flex-col"
//                 >
//                   <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-5">
//                     <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
//                     <div className="absolute top-3 left-3 flex gap-2">
//                       <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-xs font-bold text-zinc-800 flex items-center gap-1.5 shadow-sm">
//                         <Clock className="w-3.5 h-3.5 text-orange-500" />
//                         {item.prepTime || '20 min'}
//                       </div>
//                       {item.popular && (
//                         <div className="px-3 py-1.5 bg-orange-500/95 backdrop-blur-md rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm">
//                           <Flame className="w-3.5 h-3.5 text-white fill-current" /> Hot
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex flex-col flex-grow space-y-3 px-2 pb-2">
//                     <div className="flex justify-between items-start gap-3">
//                       <h3 className="font-bold text-lg text-zinc-900 leading-snug line-clamp-2">{item.name}</h3>
//                       <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-lg">
//                         <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
//                         <span className="text-sm font-bold text-amber-700">{item.rating || '4.5'}</span>
//                       </div>
//                     </div>
//                     <p className="text-sm text-zinc-500 font-medium flex-grow">{item.calories || ''} {item.categoryName && `• ${item.categoryName}`}</p>
//                     <div className="pt-4 flex items-center justify-between border-t border-zinc-100">
//                       <div className="text-2xl font-black text-zinc-900 tracking-tight">₹{item.price}</div>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           addToCart(item, 1, []);
//                         }}
//                         className="w-12 h-12 bg-zinc-50 text-zinc-900 rounded-2xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 active:scale-90"
//                       >
//                         <Plus className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </motion.div>
//         ) : (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center flex flex-col items-center">
//             <div className="w-20 h-20 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-6">
//               <Search className="w-8 h-8" />
//             </div>
//             <h3 className="text-2xl font-bold text-zinc-900">No dishes found</h3>
//             <p className="text-zinc-500 mt-2 font-medium">Try searching for something else or changing categories.</p>
//           </motion.div>
//         )}
//       </div>

//       <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
//     </div>
//   );
// };

// export default Menu;