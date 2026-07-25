import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { X, LogIn, UserPlus, ShieldCheck, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail,
    user
  } = useExpense();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google Login was unsuccessful. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, name);
      }
    } catch (err: any) {
      let msg = err?.message || 'Authentication error. Please try again.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please try again.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-3 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-indigo-200" />
          </div>

          <h3 className="text-xl font-black tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Create Firebase Account'}
          </h3>
          <p className="text-xs text-indigo-100/90 mt-1">
            Sign in to auto-sync your expenses & budget across all devices safely.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Toggle Mode Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Google One-Click Auth Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center justify-center gap-3 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.91H1.28v3.09C3.27 21.3 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.34c-.24-.72-.38-1.49-.38-2.34s.14-1.62.38-2.34V6.57H1.28C.46 8.2 0 10.04 0 12s.46 3.8 1.28 5.43l4.04-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.27 2.7 1.28 6.57l4.04 3.09c.94-2.82 3.58-4.91 6.68-4.91z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Or using email
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Tanvir Hasan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Account</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
