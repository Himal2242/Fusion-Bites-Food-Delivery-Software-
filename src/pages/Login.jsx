import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Code, Globe, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const role = userData?.role || 1;

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Redirect based on role (numeric)
      if (role === 2) {
        navigate('/restaurant-dashboard');
      } else if (role === 3) {
        navigate('/delivery-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          fullName: user.displayName || 'User',
          email: user.email,
          role: 1,
          status: 1,
          createdAt: new Date().toISOString(),
          profilePicture: user.photoURL || null,
          loyaltyPoints: 0
        });
      }
      navigate('/');
    } catch (err) {
      setError('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          fullName: user.displayName || user.email?.split('@')[0] || 'GitHub User',
          email: user.email,
          role: 1,
          status: 1,
          createdAt: new Date().toISOString(),
          profilePicture: user.photoURL || null,
          loyaltyPoints: 0
        });
      }
      navigate('/');
    } catch (err) {
      setError('GitHub login failed. Enable GitHub in Firebase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-orange-50/50 px-4">
      <div className="max-w-md w-full glass-card p-10 shadow-2xl shadow-orange-200">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Hungry? Log in to order your favorite meal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-12"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <span className="text-slate-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary-600 font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><span>Login</span><ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white/70 text-slate-500">Or continue with</span></div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button onClick={handleGoogleLogin} disabled={loading} className="flex items-center justify-center space-x-2 py-3 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-lg">
            <Globe className="w-5 h-5 text-slate-700" /><span className="font-semibold text-slate-700">Google</span>
          </button>
          <button onClick={handleGitHubLogin} disabled={loading} className="flex items-center justify-center space-x-2 py-3 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-lg">
            <Code className="w-5 h-5 text-slate-700" /><span className="font-semibold text-slate-700">GitHub</span>
          </button>
        </div>

        <p className="mt-10 text-center text-slate-600">Don't have an account? <Link to="/signup" className="text-primary-600 font-bold hover:underline">Sign up for free</Link></p>
      </div>
    </div>
  );
};

export default Login;