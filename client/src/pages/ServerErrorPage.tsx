import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, RefreshCw, Home, Bot, LifeBuoy, ArrowRight } from 'lucide-react';
import { triggerAssistantPrompt } from '../components/assistant/ChatWidget';

export const ServerErrorPage: React.FC = () => {
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryMessage(null);
    try {
      const res = await fetch('/api/v1/health/live');
      if (res.ok) {
        setRetryMessage('✓ Backend service is alive and responding! Redirecting to dashboard...');
        setTimeout(() => window.location.href = '/dashboard', 1500);
      } else {
        setRetryMessage('Backend service responded with degraded status.');
      }
    } catch {
      setRetryMessage('Unable to reach backend process. Please try again shortly.');
    } finally {
      setRetrying(false);
    }
  };

  const handleAskAssistant = () => {
    triggerAssistantPrompt(
      "I encountered an HTTP 500 Internal Server Error. What should I check or do to resolve this?",
      '500'
    );
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-rose-500/30 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-rose-600/20 text-rose-300 border border-rose-500/30 font-bold">
            HTTP 500 • INTERNAL SERVER ERROR
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Something unexpected happened.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Our backend encountered an unexpected condition while processing your request. Internal credentials and stack traces are safeguarded.
          </p>
        </div>

        {retryMessage && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
            {retryMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-violet transition-colors flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Checking Backend...' : 'Retry Request'}</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Secondary options */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            onClick={handleAskAssistant}
            className="text-violet-400 hover:text-violet-300 font-medium flex items-center space-x-1"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Assistant (Code 500)</span>
          </button>
          <span>•</span>
          <Link
            to="/support?error=500"
            className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-medium"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Open Support Ticket</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
