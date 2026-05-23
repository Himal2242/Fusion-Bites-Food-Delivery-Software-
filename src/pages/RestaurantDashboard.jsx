import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Store, PackagePlus, ListOrdered, CheckSquare, Plus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RestaurantDashboard = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // Product Add State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', categoryName: '', image: '', desc: '', time: '20 min' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Query open orders, then filter locally to avoid composite index requirement
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['placed', 'confirmed', 'preparing', 'ready'])
    );
    const unsub = onSnapshot(q, (snap) => {
      const allActive = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter for this restaurant OR demo fallback
      const myOrders = allActive.filter(o => 
        o.restaurantId === currentUser.uid || 
        o.restaurantId === 'demo_rest' || 
        o.restaurantId === 'unknown' ||
        !o.restaurantId
      );
      setOrders(myOrders);
      setLoading(false);
    }, (error) => {
      console.error("Order listener error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err) {
      console.error(err);
      alert('Failed to update status. Check permissions.');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsAdding(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        categoryName: newProduct.categoryName,
        image: newProduct.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        description: newProduct.desc,
        prepTime: newProduct.time,
        restaurantId: currentUser.uid,            // ✅ critical field
        restaurantName: currentUser.displayName || 'FusionBites Partner',
        popular: false,
        rating: 0,
        reviews: 0,
        createdAt: serverTimestamp()
      });
      alert('Product Added Successfully!');
      setNewProduct({ name: '', price: '', categoryName: '', image: '', desc: '', time: '20 min' });
    } catch (err) {
      console.error(err);
      alert('Failed to add product. Check permissions.');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading orders...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex bg-white p-2 rounded-2xl border border-slate-200 mb-8 w-fit shadow-sm">
          <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <ListOrdered className="w-5 h-5" /> Active Orders
          </button>
          <button onClick={() => setActiveTab('products')} className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'products' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <PackagePlus className="w-5 h-5" /> Add Product
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.length === 0 ? <p className="text-slate-500 col-span-full text-center py-10">No active orders for your restaurant.</p> : null}
            {orders.map(order => (
              <motion.div layout key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'placed' ? 'bg-rose-100 text-rose-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'preparing' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>{order.status}</span>
                    <span className="font-extrabold text-slate-800">₹{order.totalAmount}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 truncate">Order #{order.id.slice(-6).toUpperCase()}</h3>
                  <div className="space-y-1 mb-6 border-l-2 border-orange-100 pl-3">
                    {order.items?.map((item, idx) => (
                      <p key={idx} className="text-sm text-slate-600 font-medium">{item.quantity}x {item.name}</p>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4 flex gap-2">
                  {order.status === 'placed' && (
                    <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-600 shadow-sm transition-all active:scale-95">Accept Order</button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-amber-600 shadow-sm transition-all active:scale-95">Start Preparing</button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateOrderStatus(order.id, 'ready')} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"><CheckSquare className="w-4 h-4" /> Ready for Pickup</button>
                  )}
                  {order.status === 'ready' && (
                    <div className="flex-1 text-center py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-500">Waiting for Driver</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2"><Store className="w-6 h-6 text-orange-500" /> Create New Dish</h2>
            <form onSubmit={handleAddProduct} className="space-y-5">
              <div><label className="text-sm font-bold text-slate-700">Dish Name</label><input required value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl" placeholder="E.g. Truffle Pizza" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-bold text-slate-700">Price (₹)</label><input type="number" required value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl" placeholder="299" /></div>
                <div><label className="text-sm font-bold text-slate-700">Category</label><input required value={newProduct.categoryName} onChange={e=>setNewProduct({...newProduct, categoryName: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl" placeholder="Pizza" /></div>
              </div>
              <div><label className="text-sm font-bold text-slate-700">Image URL</label><input value={newProduct.image} onChange={e=>setNewProduct({...newProduct, image: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl" placeholder="https://..." /></div>
              <div><label className="text-sm font-bold text-slate-700">Description</label><textarea required value={newProduct.desc} onChange={e=>setNewProduct({...newProduct, desc: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl h-24 resize-none" placeholder="Delicious..." /></div>
              <button disabled={isAdding} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-orange-600 disabled:bg-orange-300">
                {isAdding ? 'Adding...' : <><Plus className="w-5 h-5"/> Publish Dish</>}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default RestaurantDashboard;








// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../firebase';
// import { Store, PackagePlus, ListOrdered, CheckSquare, Plus, ChevronRight } from 'lucide-react';
// import { motion } from 'framer-motion';

// const RestaurantDashboard = () => {
//   const { currentUser } = useAuth();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'

//   // Product Add State
//   const [newProduct, setNewProduct] = useState({ name: '', price: '', categoryName: '', image: '', desc: '', time: '20 min' });
//   const [isAdding, setIsAdding] = useState(false);

//   useEffect(() => {
//     // Listen to orders placed for this restaurant (for simplicity, grabbing placed/confirmed/preparing/ready orders)
//     const q = query(collection(db, 'orders'), where('status', 'in', ['placed', 'confirmed', 'preparing', 'ready']));
//     const unsub = onSnapshot(q, (snap) => {
//       setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       setLoading(false);
//     });
//     return () => unsub();
//   }, []);

//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
//     } catch (err) {
//       console.error(err);
//       alert('Failed to update status.');
//     }
//   };

//   const handleAddProduct = async (e) => {
//     e.preventDefault();
//     setIsAdding(true);
//     try {
//       await addDoc(collection(db, 'products'), {
//         name: newProduct.name,
//         price: parseFloat(newProduct.price),
//         categoryName: newProduct.categoryName,
//         image: newProduct.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
//         description: newProduct.desc,
//         prepTime: newProduct.time,
//         restaurantId: currentUser.uid,
//         restaurantName: currentUser.displayName || 'FusionBites Partner',
//         popular: false,
//         rating: 0,
//         reviews: 0,
//         createdAt: serverTimestamp()
//       });
//       alert('Product Added Successfully!');
//       setNewProduct({ name: '', price: '', categoryName: '', image: '', desc: '', time: '20 min' });
//     } catch (err) {
//       console.error(err);
//       alert('Failed to add product.');
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   if (loading) return <div className="min-h-screen pt-24 text-center">Loading Data...</div>;

//   return (
//     <div className="min-h-screen pt-24 pb-12 bg-slate-50">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         <div className="flex bg-white p-2 rounded-2xl border border-slate-200 mb-8 w-fit shadow-sm">
//           <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
//             <ListOrdered className="w-5 h-5" /> Active Orders
//           </button>
//           <button onClick={() => setActiveTab('products')} className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'products' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
//             <PackagePlus className="w-5 h-5" /> Add Product
//           </button>
//         </div>

//         {activeTab === 'orders' && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {orders.length === 0 ? <p className="text-slate-500 col-span-full">No active orders right now.</p> : null}
//             {orders.map(order => (
//               <motion.div layout key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
//                 <div>
//                   <div className="flex justify-between items-start mb-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
//                       order.status === 'placed' ? 'bg-rose-100 text-rose-700' :
//                       order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
//                       order.status === 'preparing' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
//                     }`}>{order.status}</span>
//                     <span className="font-extrabold text-slate-800">₹{order.totalAmount}</span>
//                   </div>
//                   <h3 className="font-bold text-slate-900 mb-2 truncate">Order #{order.id.slice(-6).toUpperCase()}</h3>
//                   <div className="space-y-1 mb-6 border-l-2 border-orange-100 pl-3">
//                     {order.items.map((item, idx) => (
//                       <p key={idx} className="text-sm text-slate-600 font-medium">{item.quantity}x {item.name}</p>
//                     ))}
//                   </div>
//                 </div>
                
//                 <div className="border-t border-slate-100 pt-4 flex gap-2">
//                   {order.status === 'placed' && (
//                     <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-600 shadow-sm transition-all active:scale-95">Accept Order</button>
//                   )}
//                   {order.status === 'confirmed' && (
//                     <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-amber-600 shadow-sm transition-all active:scale-95">Start Preparing</button>
//                   )}
//                   {order.status === 'preparing' && (
//                     <button onClick={() => updateOrderStatus(order.id, 'ready')} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"><CheckSquare className="w-4 h-4" /> Ready for Pickup</button>
//                   )}
//                   {order.status === 'ready' && (
//                     <div className="flex-1 text-center py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-500">Waiting for Driver</div>
//                   )}
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}

//         {activeTab === 'products' && (
//           <div className="max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
//             <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2"><Store className="w-6 h-6 text-orange-500" /> Create New Dish</h2>
//             <form onSubmit={handleAddProduct} className="space-y-5">
//               <div><label className="text-sm font-bold text-slate-700">Dish Name</label><input required value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl" placeholder="E.g. Truffle Pizza" /></div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div><label className="text-sm font-bold text-slate-700">Price (₹)</label><input type="number" required value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl" placeholder="299" /></div>
//                 <div><label className="text-sm font-bold text-slate-700">Category</label><input required value={newProduct.categoryName} onChange={e=>setNewProduct({...newProduct, categoryName: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl" placeholder="Pizza" /></div>
//               </div>
//               <div><label className="text-sm font-bold text-slate-700">Image URL</label><input required value={newProduct.image} onChange={e=>setNewProduct({...newProduct, image: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl" placeholder="https://..." /></div>
//               <div><label className="text-sm font-bold text-slate-700">Description</label><textarea required value={newProduct.desc} onChange={e=>setNewProduct({...newProduct, desc: e.target.value})} className="w-full mt-1 px-4 py-3 border rounded-xl h-24 resize-none" placeholder="Delicious..." /></div>
//               <button disabled={isAdding} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-orange-600 disabled:bg-orange-300">
//                 {isAdding ? 'Adding...' : <><Plus className="w-5 h-5"/> Publish Dish</>}
//               </button>
//             </form>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default RestaurantDashboard;
