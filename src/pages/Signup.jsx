import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 1,        // 1 = customer (default)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: parseInt(formData.role),
        status: 1,   // 1 = active
        createdAt: new Date().toISOString(),
        profilePicture: null,
        loyaltyPoints: 0
      });

      navigate('/login');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Please login.');
      } else {
        setError('Failed to create account. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-orange-50/50 px-4">
      <div className="max-w-md w-full glass-card p-10 shadow-2xl shadow-orange-200">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-2">Join our food delivery app and start ordering.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input-field pl-12"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-12"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-12"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value={1}>Customer</option>
              <option value={2}>Restaurant Owner</option>
              <option value={3}>Delivery Partner</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;