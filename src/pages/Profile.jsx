import React, { useState, useEffect } from 'react';
import { Package, Heart, Bell, Settings, LogOut, ChevronRight, Camera, Loader, Edit2, X, Save, ShieldCheck, Truck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getCountFromServer, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';

const roleNames = {
  1: 'Premium Member',
  2: 'Restaurant Partner',
  3: 'Delivery Partner',
  4: 'Admin'
};

const roleBadgeColors = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-blue-100 text-blue-700',
  4: 'bg-purple-100 text-purple-700',
};

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ orders: 0, reviews: 0, vouchers: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', profilePicture: '' });
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        let data;
        if (userDoc.exists()) {
          data = userDoc.data();
        } else {
          // Create the doc if it doesn't exist yet
          data = {
            fullName: currentUser.displayName || 'User',
            email: currentUser.email,
            role: 1,
            status: 1,
            profilePicture: currentUser.photoURL || '',
            loyaltyPoints: 0,
            phone: '',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, data);
        }
        setUserData(data);
        setEditForm({ fullName: data.fullName || '', phone: data.phone || '', profilePicture: data.profilePicture || '' });

        // Fetch order/review/voucher stats
        try {
          const ordersSnap = await getCountFromServer(query(collection(db, 'orders'), where('userId', '==', currentUser.uid)));
          const reviewsSnap = await getCountFromServer(query(collection(db, 'reviews'), where('userId', '==', currentUser.uid)));
          const vouchersSnap = await getCountFromServer(query(collection(db, 'vouchers'), where('userId', '==', currentUser.uid), where('isUsed', '==', false)));
          setStats({ orders: ordersSnap.data().count, reviews: reviewsSnap.data().count, vouchers: vouchersSnap.data().count });
        } catch (_) {
          // Stats are non-critical, ignore errors
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handlePartnerRequest = async (requestedRole, roleName) => {
    if (!window.confirm(`Are you sure you want to apply to become a ${roleName}?`)) return;
    setActionLoading(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      // Use setDoc with merge so it works even if doc is incomplete
      await setDoc(userDocRef, {
        status: 2,
        requestedRole: requestedRole,
        email: currentUser.email,
        fullName: userData?.fullName || currentUser.displayName || 'User',
        role: userData?.role || 1,
      }, { merge: true });
      setUserData(prev => ({ ...prev, status: 2, requestedRole }));
      alert('✅ Application submitted! Our team will review it soon.');
    } catch (err) {
      console.error('Partner request error:', err);
      alert('❌ Failed to submit application. Please try again.\n\nError: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        fullName: editForm.fullName,
        phone: editForm.phone,
        profilePicture: editForm.profilePicture,
      }, { merge: true });
      // Also update Firebase Auth display name
      await updateProfile(auth.currentUser, { displayName: editForm.fullName });
      setUserData(prev => ({ ...prev, ...editForm }));
      setEditOpen(false);
      alert('✅ Profile updated!');
    } catch (err) {
      alert('❌ Update failed: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const menuItems = [
    { icon: <Package className="w-5 h-5" />, label: 'My Orders', description: 'Track and manage your orders', color: 'bg-blue-100 text-blue-600', path: '/orders' },
    { icon: <Heart className="w-5 h-5" />, label: 'Favourites', description: 'Your saved restaurants and meals', color: 'bg-rose-100 text-rose-600', path: '/favorites' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', description: 'Stay updated on your orders', color: 'bg-amber-100 text-amber-600', path: '/notifications' },
  ];

  if (userData?.role === 4) {
    menuItems.unshift({ icon: <ShieldCheck className="w-5 h-5" />, label: 'Admin Dashboard', description: 'Manage users and platform', color: 'bg-purple-100 text-purple-600', path: '/admin' });
  } else if (userData?.role === 3) {
    menuItems.unshift({ icon: <Truck className="w-5 h-5" />, label: 'Delivery Dashboard', description: 'Manage your active deliveries', color: 'bg-blue-100 text-blue-600', path: '/delivery' });
  } else if (userData?.role === 2) {
    menuItems.unshift({ icon: <Store className="w-5 h-5" />, label: 'Restaurant Dashboard', description: 'Manage orders and menu', color: 'bg-orange-100 text-orange-600', path: '/restaurant' });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!userData) {
    return <div className="min-h-screen pt-24 text-center text-zinc-500">No user data found. Please login again.</div>;
  }

  const avatar = userData.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || 'User')}&background=f97316&color=fff&size=200`;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-zinc-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-zinc-100">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-orange-100">
                <img src={avatar} alt={userData.fullName} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setEditOpen(true)}
                className="absolute -bottom-2 -right-2 p-2 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-zinc-900">{userData.fullName}</h1>
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit Profile
                </button>
              </div>
              <p className="text-zinc-500 text-sm">{userData.email}</p>
              {userData.phone && <p className="text-zinc-500 text-sm">📞 {userData.phone}</p>}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roleBadgeColors[userData.role] || 'bg-zinc-100 text-zinc-600'}`}>
                  {roleNames[userData.role] || 'Customer'}
                </span>
                <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  🏅 {userData.loyaltyPoints || 0} Points
                </span>
                {userData.status === 0 && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">Suspended</span>}
                {userData.status === 2 && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">⏳ Application Pending</span>}
              </div>
            </div>

            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 text-rose-600 font-bold hover:bg-rose-50 rounded-2xl transition-all border border-rose-100">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Orders', value: stats.orders, emoji: '📦' },
              { label: 'Reviews', value: stats.reviews, emoji: '⭐' },
              { label: 'Vouchers', value: stats.vouchers, emoji: '🎟️' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-zinc-100">
                <p className="text-xl mb-1">{stat.emoji}</p>
                <p className="text-2xl font-extrabold text-zinc-900">{stat.value}</p>
                <p className="text-xs text-zinc-500 font-bold uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100">
            {menuItems.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between p-5 hover:bg-orange-50/60 transition-all group ${idx !== menuItems.length - 1 ? 'border-b border-zinc-100' : ''}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-3 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-zinc-900">{item.label}</h3>
                    <p className="text-sm text-zinc-500">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-orange-500 transition-colors" />
              </button>
            ))}
          </div>

          {/* Partnership Options — only for active customers */}
          {userData.role === 1 && userData.status === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 border-l-4 border-orange-500 shadow-sm border border-zinc-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 mb-1 flex items-center gap-2"><Store className="w-5 h-5 text-orange-500" /> Sell on FusionBites</h3>
                  <p className="text-sm text-zinc-500 mb-4">Partner with us to reach more customers and boost your restaurant's revenue.</p>
                </div>
                <button
                  onClick={() => handlePartnerRequest(2, 'Restaurant Partner')}
                  disabled={actionLoading}
                  className="w-full py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm"
                >
                  {actionLoading ? 'Submitting...' : 'Apply as Restaurant Partner'}
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 border-l-4 border-blue-500 shadow-sm border border-zinc-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 mb-1 flex items-center gap-2"><Truck className="w-5 h-5 text-blue-500" /> Drive with Us</h3>
                  <p className="text-sm text-zinc-500 mb-4">Become a delivery partner, set your own hours, and earn on your schedule.</p>
                </div>
                <button
                  onClick={() => handlePartnerRequest(3, 'Delivery Partner')}
                  disabled={actionLoading}
                  className="w-full py-3 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm"
                >
                  {actionLoading ? 'Submitting...' : 'Apply as Delivery Partner'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setEditOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-zinc-900">Edit Profile</h2>
                  <button onClick={() => setEditOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-zinc-600" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-zinc-700 block mb-1">Full Name</label>
                    <input
                      value={editForm.fullName}
                      onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-zinc-700 block mb-1">Phone Number</label>
                    <input
                      value={editForm.phone}
                      onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-zinc-700 block mb-1">Profile Picture URL</label>
                    <input
                      value={editForm.profilePicture}
                      onChange={e => setEditForm(f => ({ ...f, profilePicture: e.target.value }))}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                      placeholder="https://..."
                    />
                  </div>
                  {editForm.profilePicture && (
                    <div className="flex justify-center">
                      <img src={editForm.profilePicture} alt="Preview" className="w-20 h-20 rounded-2xl object-cover shadow" onError={e => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleEditSave}
                  disabled={editLoading}
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;