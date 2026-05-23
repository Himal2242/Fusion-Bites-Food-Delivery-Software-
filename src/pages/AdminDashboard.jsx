import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Ban, CheckCircle, Clock, TrendingUp, Package, Store, Loader, RefreshCw } from 'lucide-react';
import { collection, query, getDocs, doc, updateDoc, getCountFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';

const ROLE_LABELS = { 1: 'Customer', 2: 'Restaurant', 3: 'Delivery', 4: 'Admin' };
const ROLE_COLORS = {
  1: 'text-zinc-600 bg-zinc-100',
  2: 'text-orange-700 bg-orange-50 border border-orange-200',
  3: 'text-blue-700 bg-blue-50 border border-blue-200',
  4: 'text-purple-700 bg-purple-50 border border-purple-200',
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex items-center gap-4">
    <div className={`p-3 rounded-2xl ${color}`}><Icon className="w-6 h-6" /></div>
    <div>
      <p className="text-2xl font-extrabold text-zinc-900">{value}</p>
      <p className="text-sm text-zinc-500 font-medium">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalProducts: 0, revenue: 0 });
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all users
      const usersSnap = await getDocs(collection(db, 'users'));
      const userList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(userList);

      // Fetch all orders for revenue and charts
      const ordersSnap = await getDocs(query(collection(db, 'orders')));
      const allOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const revenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Sort orders by date descending (mock using id length or if createdAt exists)
      const recent = [...allOrders].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5);
      setLatestOrders(recent);

      // Fetch products count
      const productsSnap = await getCountFromServer(query(collection(db, 'products')));

      setStats({
        totalUsers: userList.length,
        totalOrders: allOrders.length,
        totalProducts: productsSnap.data().count,
        revenue: revenue
      });
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError(`Failed to load data: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    } catch (err) {
      alert('❌ Failed to update: ' + err.message);
    }
  };

  const approvePartner = (userId, requestedRole) => updateUser(userId, { status: 1, role: requestedRole, requestedRole: null });
  const rejectPartner = (userId) => updateUser(userId, { status: 1, requestedRole: null });
  const suspendUser = (userId) => updateUser(userId, { status: 0 });
  const reinstateUser = (userId) => updateUser(userId, { status: 1 });
  const promoteToAdmin = (userId) => {
    if (window.confirm('Promote this user to Admin?')) updateUser(userId, { role: 4, status: 1 });
  };

  const seedDatabase = async () => {
    if (!window.confirm('Are you sure you want to seed the database with demo products and categories?')) return;
    setLoading(true);
    try {
      const categories = [
        { id: 'cat_burgers', name: 'Burgers' },
        { id: 'cat_pizza', name: 'Pizza' },
        { id: 'cat_sushi', name: 'Sushi' },
        { id: 'cat_healthy', name: 'Healthy' },
        { id: 'cat_desserts', name: 'Desserts' },
        { id: 'cat_drinks', name: 'Drinks' }
      ];

      for (const cat of categories) {
        await setDoc(doc(db, 'categories', cat.id), {
          name: cat.name,
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      const products = [
        { id: 'prod_1', name: "Truffle Beef Burger", categoryName: "Burgers", price: 350, rating: 4.8, reviews: 342, prepTime: "25 min", calories: "850 kcal", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", popular: true, description: "A culinary masterpiece featuring a Wagyu beef patty, melted aged gruyere, caramelized onions, and black truffle aioli.", isVeg: false, restaurantId: "demo_rest", restaurantName: "Fusion Grill" },
        { id: 'prod_2', name: "Spicy Pepperoni Pizza", categoryName: "Pizza", price: 450, rating: 4.9, reviews: 512, prepTime: "30 min", calories: "1200 kcal", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80", popular: true, description: "Hand-tossed Neapolitan dough baked in a wood-fired oven, topped with fresh mozzarella and spicy Calabrian pepperoni.", isVeg: false, restaurantId: "demo_rest", restaurantName: "Luigi's Oven" },
        { id: 'prod_3', name: "Dragon Sushi Roll", categoryName: "Sushi", price: 550, rating: 4.7, reviews: 218, prepTime: "20 min", calories: "450 kcal", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80", popular: false, description: "Premium unagi (eel) and crisp cucumber rolled inside, elegantly draped with thin slices of ripe avocado.", isVeg: false, restaurantId: "demo_rest", restaurantName: "Tokyo Bites" },
        { id: 'prod_4', name: "Avocado Chicken Salad", categoryName: "Healthy", price: 280, rating: 4.6, reviews: 145, prepTime: "15 min", calories: "320 kcal", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80", popular: false, description: "Organic greens, herb-marinated grilled chicken breast, Hass avocado, cherry tomatoes, and toasted pine nuts.", isVeg: false, restaurantId: "demo_rest", restaurantName: "Green Bowl" },
        { id: 'prod_5', name: "Double Cheese Smashburger", categoryName: "Burgers", price: 299, rating: 4.9, reviews: 890, prepTime: "20 min", calories: "950 kcal", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80", popular: true, description: "Two beautifully crusted, smashed beef patties layered with sharp American cheese and house-made pickles.", isVeg: false, restaurantId: "demo_rest", restaurantName: "Smash Bros" },
        { id: 'prod_6', name: "Margherita Truffle Pizza", categoryName: "Pizza", price: 399, rating: 4.5, reviews: 112, prepTime: "25 min", calories: "1050 kcal", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80", popular: false, description: "Fresh buffalo mozzarella, crushed Roma tomatoes, fragrant basil leaves, finished with white truffle oil.", isVeg: true, restaurantId: "demo_rest", restaurantName: "Luigi's Oven" },
        { id: 'prod_7', name: "Molten Lava Cake", categoryName: "Desserts", price: 199, rating: 4.9, reviews: 430, prepTime: "15 min", calories: "600 kcal", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80", popular: true, description: "Warm dark chocolate cake with a rich, gooey molten center. Dusted with powdered sugar.", isVeg: true, restaurantId: "demo_rest", restaurantName: "Sweet Treats" },
        { id: 'prod_8', name: "Mango Passion Mojito", categoryName: "Drinks", price: 149, rating: 4.7, reviews: 98, prepTime: "5 min", calories: "150 kcal", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80", popular: false, description: "A refreshing cooler muddled with fresh mint, lime juice, ripe Alphonso mango purée, and passionfruit.", isVeg: true, restaurantId: "demo_rest", restaurantName: "Liquid magic" }
      ];

      for (const prod of products) {
        await setDoc(doc(db, 'products', prod.id), {
          ...prod,
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      alert('Database seeded successfully! Premium products added.');
      loadData(); // Refresh stats
    } catch (err) {
      console.error(err);
      alert('Error seeding database: ' + err.message);
      setLoading(false);
    }
  };

  const pendingUsers = users.filter(u => u.status === 2);
  const allActiveUsers = users.filter(u => u.status !== 2);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <Loader className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-zinc-500 font-medium">Loading admin panel…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900">Admin Control Center</h1>
              <p className="text-zinc-500">Manage users, partners, and platform integrity.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={seedDatabase} className="flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-200 rounded-xl text-orange-700 font-bold text-sm hover:bg-orange-200 transition-all shadow-sm">
              <Package className="w-4 h-4" /> Seed Menu Data
            </button>
            <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-all">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${stats.revenue}`} color="bg-emerald-100 text-emerald-600" />
          <StatCard icon={Package} label="Total Orders" value={stats.totalOrders} color="bg-orange-100 text-orange-600" />
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-100 text-blue-600" />
          <StatCard icon={Store} label="Total Products" value={stats.totalProducts} color="bg-purple-100 text-purple-600" />
        </div>

        {/* Recent Orders Overview */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Recent Network Orders
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            {latestOrders.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No orders placed yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6 font-semibold">Order ID</th>
                      <th className="py-4 px-6 font-semibold">Customer</th>
                      <th className="py-4 px-6 font-semibold">Amount</th>
                      <th className="py-4 px-6 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm">
                    {latestOrders.map(order => (
                      <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-zinc-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-4 px-6 text-zinc-600">{order.userName || 'Guest'}</td>
                        <td className="py-4 px-6 font-bold text-zinc-900">₹{order.totalAmount}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            ['placed', 'confirmed', 'preparing', 'ready'].includes(order.status) ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Pending Partnership Requests */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Partnership Requests
            {pendingUsers.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">{pendingUsers.length}</span>
            )}
          </h2>
          {pendingUsers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center text-zinc-500">
              ✅ No pending applications at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingUsers.map(user => (
                <motion.div layout key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 flex flex-col justify-between"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-zinc-900 truncate">{user.fullName || 'User'}</h3>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3 truncate">{user.email}</p>
                    <span className="inline-block px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                      Applying as: {user.requestedRole === 2 ? '🍕 Restaurant Partner' : '🛵 Delivery Driver'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approvePartner(user.id, user.requestedRole)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => rejectPartner(user.id)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* All Users Table */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> All Platform Users
            <span className="text-sm font-medium text-zinc-400">({allActiveUsers.length})</span>
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            {allActiveUsers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No users found. Firestore may be empty or rules are blocking reads.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6 font-semibold">User</th>
                      <th className="py-4 px-6 font-semibold">Role</th>
                      <th className="py-4 px-6 font-semibold">Status</th>
                      <th className="py-4 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {allActiveUsers.map(user => (
                      <tr key={user.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=e5e7eb&color=374151&size=40`}
                              alt={user.fullName}
                              className="w-9 h-9 rounded-xl object-cover"
                            />
                            <div>
                              <p className="font-bold text-zinc-900 text-sm">{user.fullName || 'No Name'}</p>
                              <p className="text-xs text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${ROLE_COLORS[user.role] || 'bg-zinc-100 text-zinc-600'}`}>
                            {ROLE_LABELS[user.role] || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.status === 1 ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${user.status === 1 ? 'bg-green-500' : 'bg-red-500'}`} />
                            {user.status === 1 ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {user.role !== 4 && (
                              <>
                                {user.status === 1 ? (
                                  <button onClick={() => suspendUser(user.id)} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1">
                                    <Ban className="w-3.5 h-3.5" /> Suspend
                                  </button>
                                ) : (
                                  <button onClick={() => reinstateUser(user.id)} className="px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Reinstate
                                  </button>
                                )}
                                {user.role < 4 && (
                                  <button onClick={() => promoteToAdmin(user.id)} className="px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5" /> Make Admin
                                  </button>
                                )}
                              </>
                            )}
                            {user.role === 4 && <span className="text-xs text-zinc-400 italic">Super Admin</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;
