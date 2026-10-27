import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Lock, Mail, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(emailOrUsername, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setSubmitting(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 space-y-6 border border-violet-500/30 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[2px] mx-auto shadow-glow-violet">
            <div className="w-full h-full bg-[#070A13] rounded-[14px] flex items-center justify-center">
              <Flame className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Sign In to Social Detox</h1>
          <p className="text-xs text-slate-400">Step offline, lock in with friends, and protect your attention.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleDemo}
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-slate-900 border border-violet-500/30 hover:bg-slate-800 text-violet-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Quick 1-Click Demo Login (Alex Rivers)</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="flex-1 h-[1px] bg-slate-800"></div>
          <span>or continue with credentials</span>
          <div className="flex-1 h-[1px] bg-slate-800"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email or Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="alex@detox.io"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-bold shadow-glow-violet transition-all flex items-center justify-center space-x-2"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
