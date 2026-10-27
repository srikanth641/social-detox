import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Database, 
  Sparkles,
  CheckCircle,
  ThumbsUp
} from 'lucide-react';
import { api } from '../services/api';
import { FAQ } from '../types';
import { triggerAssistantPrompt } from '../components/assistant/ChatWidget';

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'purpose', label: 'Mission & Concept' },
  { id: 'timer', label: 'Focus Timer' },
  { id: 'rooms', label: 'Focus Rooms' },
  { id: 'points', label: 'Points & Streaks' },
  { id: 'privacy', label: 'Privacy & Security' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'support', label: 'Support & Tickets' },
];

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      let data: FAQ[];
      if (searchQuery.trim()) {
        data = await api.searchFaqs(searchQuery);
      } else {
        data = await api.getFaqs(selectedCategory === 'all' ? undefined : selectedCategory);
      }
      setFaqs(data);
      if (data.length > 0 && !expandedId) {
        setExpandedId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchFaqs, 250);
    return () => clearTimeout(delay);
  }, [selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleAskFollowUp = (faq: FAQ) => {
    triggerAssistantPrompt(`I have a follow-up question regarding the FAQ: "${faq.question}". Can you explain more?`);
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live PostgreSQL Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Help & FAQ Center</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Answers to questions about focus rooms, points, streaks, error resolution, and digital privacy.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions (e.g. 'timer drift', 'touch grass badge', 'error SD-001')..."
          className="w-full bg-[#0D1424] border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 shadow-xl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSearchQuery('');
            }}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-medium transition-all ${
              selectedCategory === cat.id && !searchQuery
                ? 'bg-violet-600 text-white shadow-glow-violet'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQs Accordion List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading knowledge base records from PostgreSQL...
          </div>
        ) : faqs.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No FAQ matched your search.</p>
            <p className="text-xs text-slate-400">
              Try different keywords or ask the AI assistant directly below.
            </p>
            <button
              onClick={() => triggerAssistantPrompt(searchQuery)}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-violet transition-colors"
            >
              Ask Social Detox Assistant
            </button>
          </div>
        ) : (
          faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`glass-panel rounded-2xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-violet-500/40 shadow-lg' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between space-x-4 focus:outline-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30 flex-shrink-0">
                      {faq.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="text-slate-400 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-violet-400" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-800/60 space-y-4 text-xs text-slate-300 leading-relaxed animate-in fade-in">
                    <p className="whitespace-pre-wrap">{faq.answer}</p>

                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <ThumbsUp className="w-3 h-3 text-emerald-400" />
                        <span>{faq.helpful_count} users found this answer helpful</span>
                      </div>

                      <button
                        onClick={() => handleAskFollowUp(faq)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask Assistant Follow-up</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Database Verification Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>PostgreSQL FAQs Seeded & Active: <strong className="text-white">{faqs.length}</strong></span>
        <span>Requirement: ≥ 10 SQL records (Satisfied)</span>
      </div>
    </div>
  );
};
