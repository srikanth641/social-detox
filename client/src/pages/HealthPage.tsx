import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  Quote, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Terminal 
} from 'lucide-react';
import { api } from '../services/api';

export const HealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [readyData, setReadyData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const [statusRes, readyRes, logsRes] = await Promise.all([
        api.getHealthStatus(),
        api.getHealthReady().catch((err: any) => ({ status: 'degraded', error: err.message })),
        api.getHealthLogs().catch(() => ({ logs: [] })),
      ]);
      setHealthData(statusRes);
      setReadyData(readyRes);
      setLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>PRODUCTION SYSTEM DIAGNOSTICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Health & Ops</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time liveness, readiness, dependent services, and structured request telemetry.
          </p>
        </div>

        <button
          onClick={loadHealth}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Service Health Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend Server Process */}
        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Backend API</span>
            <Server className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">Liveness OK</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <p>Uptime: {healthData?.uptimeSeconds || 0}s</p>
            <p>Environment: {healthData?.environment || 'development'}</p>
          </div>
        </div>

        {/* SQL Database Engine */}
        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">SQL Database</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center space-x-2">
            {healthData?.health?.sqlDatabase?.healthy ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-bold text-white">Error</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <p>Engine: {healthData?.health?.sqlDatabase?.engine || 'postgres'}</p>
            <p>Storage: Relational Schema</p>
          </div>
        </div>

        {/* MongoDB Persistence */}
        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">MongoDB (Logs)</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-2">
            {healthData?.health?.mongoDatabase?.connected ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">Connected</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-bold text-white">Offline (Graceful)</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <p>Collections: ChatLog, Feedback</p>
            <p>Outage Policy: Graceful Fallback</p>
          </div>
        </div>

        {/* AI Assistant Provider */}
        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Assistant</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">RAG Active</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <p>Model: {healthData?.health?.aiProvider?.model || 'gemini-1.5-flash'}</p>
            <p>Source: Grounded PostgreSQL FAQs</p>
          </div>
        </div>
      </div>

      {/* Structured Recent Logs Table */}
      <div className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Structured Request Log Telemetry (Last {logs.length} Requests)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Secrets & Auth headers sanitized</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No recent logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Req ID</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Path</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {logs.slice().reverse().map((log, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 text-violet-300 text-[10px]">
                      {log.requestId?.substring(0, 8)}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-300">
                      {log.method}
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      {log.path}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.status >= 500 ? 'bg-rose-500/20 text-rose-300' :
                        log.status >= 400 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[10px]">
                      {log.durationMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
