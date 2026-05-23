import React from 'react';
import { ShoppingBag, Search, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { currentUser } = useAuth();
  const { cartCount } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-extrabold text-xl">FB</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent hidden sm:block">
              FusionBites
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-zinc-600 hover:text-orange-500 font-bold transition-colors">Home</Link>
            <Link to="/menu" className="text-zinc-600 hover:text-orange-500 font-bold transition-colors">Menu</Link>
            <Link to="/profile" className="text-zinc-600 hover:text-orange-500 font-bold transition-colors">Orders</Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-zinc-600 hover:bg-orange-50 hover:text-orange-500 rounded-full transition-all">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <button className="p-2 text-zinc-600 hover:bg-orange-50 hover:text-orange-500 rounded-full transition-all">
              <Search className="w-6 h-6" />
            </button>
            
            {currentUser ? (
              <Link to="/profile" className="flex items-center space-x-2 p-2 px-4 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-full transition-all font-bold">
                <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=f97316&color=fff`} alt="User" className="w-6 h-6 rounded-full" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 p-2 px-4 text-zinc-600 hover:bg-orange-50 rounded-full transition-all font-bold">
                <User className="w-6 h-6" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
            
            <button className="md:hidden p-2 text-zinc-600 hover:text-orange-500">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
