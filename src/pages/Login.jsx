import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, Calendar, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login, loginWithGoogle } = useApp();
  const [email, setEmail] = useState('alice@conflictfree.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Try alice@conflictfree.ai');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Left: Clean Login Form Card */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-slate-900 border-r border-slate-800/50 z-10">
        {/* Header Branding */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ConflictFree
          </span>
        </div>

        {/* Center: Auth Fields */}
        <div className="max-w-sm w-full mx-auto my-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Enter your credentials or click Continue with Google to access your smart scheduler engine.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="email">
                WORK EMAIL
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@work.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="password">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-800/40 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all"
            >
              {loading ? 'Processing...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <span className="absolute w-full h-px bg-slate-800" />
            <span className="relative px-3 bg-slate-900 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              OR
            </span>
          </div>

          {/* Google SSO Button */}
          <button
            onClick={handleGoogleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-semibold rounded-xl active:scale-[0.98] transition-all"
          >
            {/* Google Vector Icon */}
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.93 1 12 1 7.37 1 3.44 3.67 1.5 7.57l3.68 2.85C6.06 7.42 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.48-1.11 2.74-2.37 3.59l3.68 2.85c2.15-1.98 3.38-4.9 3.38-8.59z"
              />
              <path
                fill="#FBBC05"
                d="M5.18 10.42a7.19 7.19 0 0 1 0-4.84L1.5 2.73a11.96 11.96 0 0 0 0 10.54l3.68-2.85z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.96-1.08 7.95-2.92l-3.68-2.85c-1.12.75-2.54 1.21-4.27 1.21-3.22 0-5.94-2.38-6.91-5.38L1.42 15.9A11.96 11.96 0 0 0 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-550 text-center">
          &copy; 2026 ConflictFree Inc. All rights reserved. By continuing, you agree to our Terms.
        </p>
      </div>

      {/* Right: Rich Interactive Simulation Screen */}
      <div className="hidden lg:flex lg:flex-1 relative bg-slate-950 items-center justify-center p-12 overflow-hidden">
        {/* Background mesh colors */}
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[120px] animate-pulse-slow" />

        {/* Main Mock Illustration Card */}
        <div className="relative glass border-slate-800 bg-slate-900/40 p-8 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col gap-6 glow-primary">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Auto-Scheduling Engine</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Active Simulator
            </span>
          </div>

          <div className="space-y-4">
            {/* Parser Step */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850">
              <p className="text-[10px] text-slate-500 font-mono">NATURAL LANGUAGE INPUT</p>
              <p className="text-sm font-semibold text-white mt-1.5">
                "Schedule a Roadmap alignment with Alice & Bob tomorrow at 11am"
              </p>
            </div>

            {/* Conflict Detection card */}
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-rose-400">Resource Conflict Detected</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Bob Smith is currently required in "Security Architecture Audit" tomorrow between 11:00 AM and 12:30 PM.
                </p>
              </div>
            </div>

            {/* Recommendation suggestion card */}
            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex gap-3">
              <CheckCircle className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-indigo-300">Conflict-Free Alternative Found</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Recommended Slot: <strong>Tomorrow, 2:00 PM - 3:00 PM</strong> (100% attendee & room availability score).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center text-[10px] text-slate-500 font-medium border-t border-slate-800/80 pt-4">
            <span>Powered by ConflictFree Smart Scheduling AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
