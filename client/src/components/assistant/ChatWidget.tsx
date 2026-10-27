import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  LifeBuoy, 
  RotateCcw, 
  Bot, 
  User as UserIcon,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { ChatMessage } from '../../types';
import { Link } from 'react-router-dom';

const SUGGESTED_PROMPTS = [
  "How do I start a focus session?",
  "Why did my focus room fail to synchronize?",
  "Explain error 429.",
  "How do I reset my streak?",
  "I need help with my account."
];

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [feedbackSuccessId, setFeedbackSuccessId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize unique conversation session ID
  useEffect(() => {
    let savedId = sessionStorage.getItem('detox_conv_id');
    if (!savedId) {
      savedId = `conv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      sessionStorage.setItem('detox_conv_id', savedId);
    }
    setConversationId(savedId);

    // Initial welcome message
    setMessages([
      {
        id: 'welcome-0',
        role: 'assistant',
        content: "👋 Hey! I'm the **Social Detox Assistant**.\n\nI can help you synchronize focus rooms, understand points & streaks, and troubleshoot app errors (including `SD-001`). What's on your mind?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    // Global event listener to open chat with contextual question
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e.detail?.prompt) {
        handleSendMessage(e.detail.prompt, e.detail?.errorCode);
      }
    };
    window.addEventListener('open-detox-assistant', handleOpenChat as EventListener);
    return () => window.removeEventListener('open-detox-assistant', handleOpenChat as EventListener);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend?: string, specificErrorCode?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage({
        conversationId,
        message: text,
        route: window.location.pathname,
        errorCode: specificErrorCode,
      });

      const assistantMsg: ChatMessage = {
        id: response.messageId || `asst-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        suggestTicket: response.suggestTicket,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Unable to connect to assistant service right now.'}\n\nYou can still browse our verified [Help & FAQ](/faq) or [submit a support ticket](/support).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestTicket: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'helpful' | 'not_helpful') => {
    try {
      await api.submitAssistantFeedback({
        conversationId,
        messageId,
        rating,
      });

      setFeedbackSuccessId(messageId);
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, feedbackGiven: rating } : m))
      );
      setTimeout(() => setFeedbackSuccessId(null), 3000);
    } catch (err: any) {
      console.warn('Feedback could not be recorded:', err.message);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] max-h-[85vh] bg-[#0B0F19] border border-violet-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-violet-900/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>Social Detox Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-slate-400">Grounding via PostgreSQL & FAQ Engine</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMessages(messages.slice(0, 1))}
                title="Reset conversation"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Sources tag if available */}
                  {msg.sources?.faqs && msg.sources.faqs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-violet-300 flex items-center space-x-1">
                      <HelpCircle className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <span>Verified from PostgreSQL FAQ Knowledge Base</span>
                    </div>
                  )}

                  {msg.sources?.errorCode && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-cyan-300 flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      <span>Matched Code: {msg.sources.errorCode}</span>
                    </div>
                  )}

                  {/* Ticket Suggestion Action */}
                  {msg.suggestTicket && (
                    <div className="mt-3 p-2 bg-violet-950/40 border border-violet-500/30 rounded-xl">
                      <p className="text-[11px] font-medium text-violet-200 mb-1.5">
                        Need engineering assistance or issue resolution?
                      </p>
                      <Link
                        to={`/support?conversation=${conversationId}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                      >
                        <LifeBuoy className="w-3 h-3" />
                        <span>Create Support Ticket</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-1 px-1">
                  <span className="text-[9px] text-slate-400">{msg.timestamp}</span>

                  {/* Helpful / Not helpful feedback buttons */}
                  {msg.role === 'assistant' && msg.id !== 'welcome-0' && (
                    <div className="flex items-center space-x-1 text-slate-400">
                      <button
                        onClick={() => handleFeedback(msg.id, 'helpful')}
                        className={`p-0.5 hover:text-emerald-400 transition-colors ${
                          msg.feedbackGiven === 'helpful' ? 'text-emerald-400' : ''
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'not_helpful')}
                        className={`p-0.5 hover:text-rose-400 transition-colors ${
                          msg.feedbackGiven === 'not_helpful' ? 'text-rose-400' : ''
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-2.5 h-2.5" />
                      </button>
                      {feedbackSuccessId === msg.id && (
                        <span className="text-[9px] text-emerald-400">Saved!</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 p-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[11px]">Searching FAQ knowledge base...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
            <span className="text-slate-400 flex items-center space-x-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Try:</span>
            </span>
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="flex-shrink-0 px-2 py-1 rounded-full bg-slate-800/80 hover:bg-violet-600/30 text-slate-300 hover:text-violet-200 border border-slate-700/60 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about timers, SD-001, streaks..."
              disabled={loading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border border-violet-400/30"
        aria-label="Open Social Detox AI Assistant"
      >
        <Bot className="w-5 h-5 text-cyan-200" />
        <span className="text-xs font-bold hidden sm:inline">Ask Assistant</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </button>
    </div>
  );
};

// Global helper function so any component or error page can trigger the assistant
export function triggerAssistantPrompt(prompt: string, errorCode?: string) {
  window.dispatchEvent(
    new CustomEvent('open-detox-assistant', {
      detail: { prompt, errorCode },
    })
  );
}
