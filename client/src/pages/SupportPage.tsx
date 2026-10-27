import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  LifeBuoy, 
  Send, 
  CheckCircle, 
  Search, 
  AlertCircle, 
  Ticket, 
  Copy,
  Clock,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { SupportTicket } from '../types';

export const SupportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Form State
  const [contactName, setContactName] = useState(user?.displayName || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('Technical Issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [errorCode, setErrorCode] = useState(searchParams.get('error') || '');
  const [convRef, setConvRef] = useState(searchParams.get('conversation') || '');

  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Ticket Lookup State
  const [lookupRef, setLookupRef] = useState('');
  const [lookupResult, setLookupResult] = useState<SupportTicket | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.displayName);
      if (!contactEmail) setContactEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const result = await api.createTicket({
        contactName: contactName.trim() || 'Guest User',
        contactEmail: contactEmail.trim(),
        category,
        subject: subject.trim(),
        description: description.trim(),
        errorCode: errorCode.trim() || undefined,
        conversationReference: convRef.trim() || undefined,
      });

      setCreatedTicket(result);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRef.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const ticket = await api.getTicket(lookupRef.trim().toUpperCase());
      setLookupResult(ticket);
    } catch (err: any) {
      setLookupError(err.message || 'Ticket not found');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
          <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
          <span>PostgreSQL Support Ticket Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Support & Resolution Desk</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Need engineering help, reporting a room synchronization glitch, or requesting a feature? Submit a ticket below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Submit Ticket Form */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-violet-500/30 shadow-2xl">
          {createdTicket ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Ticket Submitted Successfully!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your ticket has been safely logged in our PostgreSQL database. Our support engineering team will reach out to <strong className="text-white">{createdTicket.contact_email || contactEmail}</strong>.
              </p>

              <div className="p-4 rounded-2xl bg-[#070A13] border border-violet-500/40 inline-block space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Your Ticket Reference</span>
                <span className="text-2xl font-extrabold font-mono text-violet-300">
                  {createdTicket.reference}
                </span>
              </div>

              <div className="pt-2 flex justify-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdTicket.reference);
                    alert('Copied ticket reference!');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Reference</span>
                </button>
                <button
                  onClick={() => {
                    setCreatedTicket(null);
                    setSubject('');
                    setDescription('');
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-violet-400" />
                <span>Submit a Support Ticket</span>
              </h3>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Your Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Alex Rivers"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.edu"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Issue Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Timer Synchronization (SD-001)">Timer Synchronization (SD-001)</option>
                    <option value="Account & Login">Account & Login</option>
                    <option value="Friend Circles & Squads">Friend Circles & Squads</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Relevant Error Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SD-001, 429, 500"
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of the issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain what happened, what device or browser you were using, and any steps to reproduce..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-bold shadow-glow-violet transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting to Database...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Ticket Lookup */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Track Existing Ticket</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter your ticket reference code (e.g. <code>SD-2026-00001</code>) to check resolution status.
            </p>

            <form onSubmit={handleLookup} className="space-y-3">
              <input
                type="text"
                required
                placeholder="SD-2026-XXXXX"
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {lookupLoading ? 'Checking...' : 'Lookup Ticket'}
              </button>
            </form>

            {lookupError && (
              <p className="text-xs text-rose-400 pt-1">{lookupError}</p>
            )}

            {lookupResult && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-violet-300">{lookupResult.reference}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    lookupResult.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                    lookupResult.status === 'in_progress' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {lookupResult.status.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs">{lookupResult.subject}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-3">{lookupResult.description}</p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Logged on {new Date(lookupResult.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Collision-Safe Tracking</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Ticket references follow collision-resistant format <code>SD-YYYY-XXXXX</code> with rate limiting to prevent spam submissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
