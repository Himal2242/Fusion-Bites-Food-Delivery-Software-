import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, ChevronRight, Play, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');

  const categories = [
    { name: 'Burgers', icon: '🍔', count: '45+ spots', color: 'bg-orange-50' },
    { name: 'Pizza', icon: '🍕', count: '32+ spots', color: 'bg-red-50' },
    { name: 'Sushi', icon: '🍣', count: '18+ spots', color: 'bg-blue-50' },
    { name: 'Desserts', icon: '🍰', count: '24+ spots', color: 'bg-pink-50' },
    { name: 'Drinks', icon: '🍹', count: '15+ spots', color: 'bg-purple-50' },
    { name: 'Healthy', icon: '🥗', count: '20+ spots', color: 'bg-green-50' },
  ];

  // Animation variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (location.trim()) {
      navigate('/menu');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-orange-200 selection:text-orange-900 overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[80vh] bg-gradient-to-b from-orange-50/80 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-orange-400/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 space-y-8 w-full z-10"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200/60 rounded-full shadow-sm text-sm font-bold text-zinc-700">
            <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span>100% Safe & Contactless Delivery</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-zinc-900 tracking-tight leading-[1.1]">
            The food you <br className="hidden md:block"/> 
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 pr-4">
              love
              <Heart className="absolute -top-1 -right-2 w-8 h-8 text-orange-400 fill-current opacity-20 rotate-12" />
            </span> <br />
            delivered perfectly.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-xl leading-relaxed font-medium">
            Experience the best restaurants in your city, delivered hot and fresh to your door in under 30 minutes.
          </p>
          
          {/* Interactive Delivery Input */}
          <form onSubmit={handleSearch} className="max-w-xl flex items-center bg-white p-2.5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-zinc-100 transition-all focus-within:shadow-[0_8px_30px_rgb(249,115,22,0.12)] focus-within:border-orange-200">
            <div className="flex items-center px-4">
              <MapPin className="w-6 h-6 text-orange-500" />
            </div>
            <input 
              type="text" 
              placeholder="Enter your delivery address..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-800 font-medium placeholder:text-zinc-400 outline-none w-full"
            />
            <button 
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-[1.5rem] font-bold text-base transition-all active:scale-95 flex items-center gap-2"
            >
              Find Food <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Stats Row */}
          <div className="flex items-center gap-8 sm:gap-12 pt-6">
            <div className="space-y-1">
              <p className="text-3xl font-black text-zinc-900">12k+</p>
              <p className="text-zinc-500 text-sm font-semibold">Happy Foodies</p>
            </div>
            <div className="w-px h-12 bg-zinc-200"></div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-zinc-900">500+</p>
              <p className="text-zinc-500 text-sm font-semibold">Restaurants</p>
            </div>
            <div className="w-px h-12 bg-zinc-200 hidden sm:block"></div>
            <div className="space-y-1 hidden sm:block">
              <p className="text-3xl font-black text-zinc-900 flex items-center gap-1">
                4.9 <Star className="w-5 h-5 text-amber-400 fill-current" />
              </p>
              <p className="text-zinc-500 text-sm font-semibold">App Rating</p>
            </div>
          </div>
        </motion.div>

        {/* Right Content / Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="flex-1 w-full relative max-w-lg lg:max-w-none mx-auto"
        >
          <div className="relative z-10 w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
            <img 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1600&auto=format&fit=crop" 
              alt="Premium Delivery Food" 
              className="w-full h-full object-cover rounded-[3rem] shadow-[0_20px_60px_rgb(0,0,0,0.1)]"
            />
            
            {/* Smooth Floating Card 1: Time */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-4 sm:-left-8 bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-[0_15px_35px_rgb(0,0,0,0.1)] border border-white flex items-center gap-4 z-20"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-inner">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="font-black text-zinc-900 text-lg">Under 30 min</p>
                <p className="text-sm font-medium text-zinc-500">Fastest Delivery</p>
              </div>
            </motion.div>
            
            {/* Smooth Floating Card 2: Rating */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-10 -right-4 sm:-right-8 bg-white/90 backdrop-blur-xl px-5 py-4 rounded-full shadow-[0_15px_35px_rgb(0,0,0,0.1)] border border-white flex items-center gap-2 z-20"
            >
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <span className="font-black text-zinc-900 text-lg">4.9</span>
              <span className="text-sm font-bold text-zinc-400 ml-1">(2k+)</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Explore Menu</h2>
            <p className="text-zinc-500 text-lg font-medium">What are you craving today?</p>
          </div>
          <button onClick={() => navigate('/menu')} className="text-orange-500 font-bold hover:text-orange-600 transition-colors flex items-center gap-1 group">
            View All Menu 
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate('/menu')}
              className="bg-white p-6 rounded-[2rem] text-center border border-zinc-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.12)] hover:border-orange-100 transition-all cursor-pointer group flex flex-col items-center justify-center h-full"
            >
              <div className={`w-20 h-20 ${cat.color} rounded-full flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-500`}>
                {cat.icon}
              </div>
              <h3 className="font-extrabold text-zinc-900 text-lg leading-tight">{cat.name}</h3>
              <p className="text-sm font-semibold text-zinc-400 mt-1">{cat.count}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
};

export default Home;







// import React from 'react';
// import { ShoppingCart, Star, Clock, MapPin, ChevronRight, Play } from 'lucide-react';
// import { motion } from 'framer-motion';

// const Home = () => {
//   const categories = [
//     { name: 'Burger', icon: '🍔', count: '45+ items' },
//     { name: 'Pizza', icon: '🍕', count: '32+ items' },
//     { name: 'Sushi', icon: '🍣', count: '18+ items' },
//     { name: 'Dessert', icon: '🍰', count: '24+ items' },
//     { name: 'Drinks', icon: '🍹', count: '15+ items' },
//     { name: 'Healthy', icon: '🥗', count: '20+ items' },
//   ];

//   return (
//     <div className="pt-24 min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
//       {/* Hero Section */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">
//         <motion.div 
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           className="flex-1 space-y-8"
//         >
//           <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100/50 text-primary-700 rounded-full font-semibold text-sm">
//             <span className="bg-primary-600 text-white px-2 py-0.5 rounded-full text-xs animate-pulse">New</span>
//             <span>$0 delivery fee on your first 3 orders!</span>
//           </div>
          
//           <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
//             Deliciousness <br />
//             <span className="text-primary-600 italic">Delivered</span> <br />
//             to Your Doorstep.
//           </h1>
          
//           <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
//             Order your favorite meals from the best restaurants and enjoy a seamless, 
//             fast, and delicious experience every time.
//           </p>
          
//           <div className="flex flex-wrap gap-4">
//             <button className="btn-primary flex items-center space-x-2">
//               <span>Order Now</span>
//               <ChevronRight className="w-5 h-5" />
//             </button>
//             <button className="flex items-center space-x-3 px-6 py-3 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-xl transition-all font-semibold">
//               <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
//                 <Play className="w-4 h-4 text-primary-600 fill-current" />
//               </div>
//               <span>How it works</span>
//             </button>
//           </div>

//           <div className="flex items-center space-x-8 pt-8 border-t border-slate-100">
//             <div>
//               <p className="text-3xl font-bold">12k+</p>
//               <p className="text-slate-500 text-sm">Happy Users</p>
//             </div>
//             <div>
//               <p className="text-3xl font-bold">500+</p>
//               <p className="text-slate-500 text-sm">Restaurants</p>
//             </div>
//             <div>
//               <p className="text-3xl font-bold">4.9</p>
//               <p className="text-slate-500 text-sm">Rating</p>
//             </div>
//           </div>
//         </motion.div>

//         <motion.div 
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.8 }}
//           className="flex-1 relative"
//         >
//           <div className="relative z-10 animate-float">
//             <img 
//               src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop" 
//               alt="Premium Pizza" 
//               className="rounded-[4rem] shadow-2xl relative z-10 border-8 border-white"
//             />
//             {/* Floating Info Cards */}
//             <div className="absolute -bottom-6 -left-6 glass-card p-4 shadow-xl z-20 flex items-center space-x-3 animate-bounce shadow-orange-200">
//               <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
//                 <Clock className="w-6 h-6" />
//               </div>
//               <div>
//                 <p className="font-bold text-slate-800">20-30 min</p>
//                 <p className="text-xs text-slate-500">Fastest Delivery</p>
//               </div>
//             </div>
            
//             <div className="absolute top-10 -right-10 glass-card p-4 shadow-xl z-20 flex items-center space-x-1 animate-pulse border-white/40">
//               <Star className="w-5 h-5 text-yellow-400 fill-current" />
//               <span className="font-bold text-slate-800">4.9</span>
//               <span className="text-xs text-slate-500 ml-1">(1k+ reviews)</span>
//             </div>
//           </div>
          
//           {/* Decorative background circle */}
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-100/50 rounded-full blur-[100px] z-0" />
//         </motion.div>
//       </section>

//       {/* Categories */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//         <div className="flex justify-between items-end mb-12">
//           <div>
//             <h2 className="text-3xl font-bold text-slate-900">Explore by Category</h2>
//             <p className="text-slate-500 mt-2">What's on your mind today?</p>
//           </div>
//           <button className="text-primary-600 font-semibold hover:underline flex items-center gap-1">
//             View All Categories <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
//           {categories.map((cat, idx) => (
//             <motion.div
//               key={cat.name}
//               whileHover={{ y: -10 }}
//               className="bg-white p-6 rounded-[2.5rem] text-center border border-slate-100 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-100 transition-all cursor-pointer group"
//             >
//               <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
//                 {cat.icon}
//               </div>
//               <h3 className="font-bold text-slate-800">{cat.name}</h3>
//               <p className="text-xs text-slate-400 mt-1">{cat.count}</p>
//             </motion.div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;
