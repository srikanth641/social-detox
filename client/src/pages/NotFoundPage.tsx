import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, Clock, HelpCircle, Bot, ArrowLeft } from 'lucide-react';
import { triggerAssistantPrompt } from '../components/assistant/ChatWidget';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();

  const handleAskAssistant = () => {
    triggerAssistantPrompt(
      `I tried to visit the page "${location.pathname}" but received a 404 Not Found error. Can you help me find what I was looking for?`,
      '404'
    );
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-violet-500/30 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Visual Badge */}
        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/40 flex items-center justify-center mx-auto shadow-glow-violet">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 font-bold">
            ERROR 404 • NOT FOUND
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Looks like this page went offline.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Maybe this page is taking a healthy digital detox! The URL <code className="px-1.5 py-0.5 rounded bg-slate-900 text-violet-300 font-mono text-xs">{location.pathname}</code> does not exist on our servers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-violet transition-colors flex items-center justify-center space-x-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>

        {/* Secondary options */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            onClick={handleAskAssistant}
            className="text-violet-400 hover:text-violet-300 font-medium flex items-center space-x-1"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Assistant about this 404</span>
          </button>
          <span>•</span>
          <Link to="/faq" className="text-slate-400 hover:text-white flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Visit Help & FAQ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
