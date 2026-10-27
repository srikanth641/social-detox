import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Flame, 
  Clock, 
  Users, 
  HelpCircle, 
  ShieldAlert, 
  Activity, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Zap, 
  LifeBuoy 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, loginAsDemo } = useAuth();

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'Dashboard', path: '/dashboard', icon: Clock },
    { label: 'Focus Rooms', path: '/focus-rooms', icon: Zap },
    { label: 'Friends & Squads', path: '/friends', icon: Users },
    { label: 'Help & FAQ', path: '/faq', icon: HelpCircle },
    { label: 'Error Reference', path: '/errors', icon: ShieldAlert },
    { label: 'System Health', path: '/health', icon: Activity },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070A13]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-blue-600 to-cyan-400 p-[2px] shadow-glow-violet transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#070A13] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-violet-400 fill-violet-400/20 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Social<span className="text-violet-400">Detox</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  Gen Z
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider hidden sm:block">
                Make being offline the new flex
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
                    active
                      ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.icon && <link.icon className={`w-3.5 h-3.5 ${active ? 'text-violet-400' : 'text-slate-400'}`} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Auth or Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center text-xs font-bold">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{user.displayName}</p>
                    <p className="text-[10px] text-violet-400 font-mono mt-0.5 leading-none">
                      {user.points} pts • {user.streakDays}d streak
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={loginAsDemo}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-violet-300 border border-violet-500/20 transition-all flex items-center space-x-1"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Demo Mode</span>
                </button>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-glow-violet transition-all"
                >
                  Join Squad
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {!user && (
              <button
                onClick={loginAsDemo}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30"
              >
                Demo
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#0B0F19] px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? 'bg-violet-600/20 text-violet-300' : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 text-violet-400" />}
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800/80 flex flex-col space-y-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-lg">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-slate-200">{user.displayName}</span>
                </div>
                <button onClick={logout} className="text-xs text-rose-400 font-medium">
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white"
                >
                  Join Squad
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
