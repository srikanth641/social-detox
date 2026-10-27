import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Heart, Activity, ShieldCheck, HelpCircle, LifeBuoy } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070A13] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-[2px]">
              <div className="w-full h-full bg-[#070A13] rounded-[6px] flex items-center justify-center">
                <Flame className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <span className="font-bold text-white text-base">Social<span className="text-violet-400">Detox</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A digital wellness platform for students and creators. Flipping social incentives: intentional offline time and deep study is the new flex.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All systems operational</span>
          </div>
        </div>

        {/* Product Navigation */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Platform</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/dashboard" className="hover:text-violet-400 transition-colors">Study Dashboard</Link></li>
            <li><Link to="/focus-rooms" className="hover:text-violet-400 transition-colors">Focus Rooms</Link></li>
            <li><Link to="/friends" className="hover:text-violet-400 transition-colors">Friend Circles & Leaderboard</Link></li>
            <li><Link to="/health" className="hover:text-violet-400 transition-colors flex items-center space-x-1.5"><Activity className="w-3 h-3 text-cyan-400" /><span>System Health</span></Link></li>
          </ul>
        </div>

        {/* Resources & Support */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Help & Diagnostics</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/faq" className="hover:text-violet-400 transition-colors flex items-center space-x-1.5"><HelpCircle className="w-3 h-3 text-violet-400" /><span>FAQ & Knowledge Base</span></Link></li>
            <li><Link to="/errors" className="hover:text-violet-400 transition-colors">Error Code Reference (8 Codes)</Link></li>
            <li><Link to="/support" className="hover:text-violet-400 transition-colors flex items-center space-x-1.5"><LifeBuoy className="w-3 h-3 text-blue-400" /><span>Submit Support Ticket</span></Link></li>
            <li><Link to="/500" className="hover:text-violet-400 transition-colors">500 Server Error Demo</Link></li>
            <li><Link to="/404" className="hover:text-violet-400 transition-colors">404 Offline Page Demo</Link></li>
          </ul>
        </div>

        {/* Responsible Tech & Privacy Guarantee */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ethical Architecture</span>
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Zero invasive device monitoring. No dark patterns or addictive notification loops. Focus sessions measure conscious time you commit inside Social Detox.
          </p>
          <p className="text-[10px] text-slate-500 pt-1">
            College Software Engineering Final Assessment 2026. Built with PostgreSQL, MongoDB, React & Node.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
        <p>© 2026 Social Detox Inc. Open-source educational initiative.</p>
        <p className="mt-2 sm:mt-0 flex items-center space-x-1">
          <span>Crafted with intentional focus</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>for healthy attention habits</span>
        </p>
      </div>
    </footer>
  );
};
