import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  RefreshCw, 
  HelpCircle, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Bot, 
  Terminal,
  Zap,
  Play
} from 'lucide-react';
import { api } from '../services/api';
import { ErrorCodeDef } from '../types';
import { triggerAssistantPrompt } from '../components/assistant/ChatWidget';

export const ErrorsPage: React.FC = () => {
  const [errorCodes, setErrorCodes] = useState<ErrorCodeDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [testedCode, setTestedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadErrorCodes() {
      try {
        const data = await api.getErrorCodes();
        setErrorCodes(data);
      } catch (err) {
        console.error('Failed to load error registry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadErrorCodes();
  }, []);

  const handleTestError = async (code: string) => {
    setTestedCode(code);
    setTestResult(null);
    try {
      const response = await fetch(`/api/v1/test-error/${code}`);
      const data = await response.json();
      setTestResult({
        httpStatus: response.status,
        response: data,
      });
    } catch (err: any) {
      setTestResult({
        error: err.message,
      });
    }
  };

  const handleAskAssistant = (code: ErrorCodeDef) => {
    triggerAssistantPrompt(`Can you explain error ${code.code} (${code.title}) and how I can resolve it?`, code.code);
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          <span>Structured Error Code Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Error Code Reference</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          Comprehensive diagnostic handbook for HTTP status codes and Social Detox platform-specific codes. Recognized and fully supported by our AI Assistant.
        </p>
      </div>

      {/* Live Test Output Console if triggered */}
      {testResult && (
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-cyan-500/40 shadow-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 font-bold">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Live Test Result for Endpoint: /api/v1/test-error/{testedCode}</span>
            </div>
            <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Codes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-400">
            Loading error codes from registry...
          </div>
        ) : (
          errorCodes.map((err) => (
            <div
              key={err.code}
              id={`error-${err.code}`}
              className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-800 hover:border-violet-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm font-extrabold font-mono px-3 py-1 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      {err.code}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">{err.title}</h3>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{err.category}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    err.isRetryable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {err.isRetryable ? 'Retryable' : 'Action Required'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {err.explanation}
                </p>

                {/* Common Causes */}
                <div className="space-y-1 pt-1">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Likely Causes:</h4>
                  <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
                    {Array.isArray(err.causes) ? err.causes.map((cause, i) => (
                      <li key={i} className="text-[11px]">{cause}</li>
                    )) : <li>{String(err.causes)}</li>}
                  </ul>
                </div>

                {/* Recommended Resolution Steps */}
                <div className="space-y-1 pt-1">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolution:</h4>
                  <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
                    {Array.isArray(err.resolutionSteps) ? err.resolutionSteps.map((step, i) => (
                      <li key={i} className="text-[11px] text-emerald-300/90">{step}</li>
                    )) : <li>{String(err.resolutionSteps)}</li>}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleAskAssistant(err)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask Assistant</span>
                </button>

                <button
                  onClick={() => handleTestError(err.code)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Test API Response</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
