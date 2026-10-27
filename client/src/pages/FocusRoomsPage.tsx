import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Zap, 
  Users, 
  Clock, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert, 
  Lock, 
  Sparkles, 
  RefreshCw,
  Award,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { FocusRoom } from '../types';
import { triggerAssistantPrompt } from '../components/assistant/ChatWidget';

export const FocusRoomsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, loginAsDemo, refreshProfile } = useAuth();

  const [rooms, setRooms] = useState<FocusRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<FocusRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Synchronized countdown state
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomDuration, setNewRoomDuration] = useState(25);
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);

  // Check-in state & Confetti
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [syncErrorSimulated, setSyncErrorSimulated] = useState(false);

  // Load rooms
  const fetchRooms = async () => {
    try {
      const data = await api.getRooms();
      setRooms(data);

      const targetJoinId = searchParams.get('join');
      if (targetJoinId) {
        const found = data.find(r => r.id === targetJoinId || r.code === targetJoinId);
        if (found) setSelectedRoom(found);
      } else if (!selectedRoom && data.length > 0) {
        setSelectedRoom(data[0]);
      } else if (selectedRoom) {
        const updated = data.find(r => r.id === selectedRoom.id);
        if (updated) setSelectedRoom(updated);
      }
    } catch (err) {
      console.error('Failed to load focus rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000); // Poll rooms state every 10s
    return () => clearInterval(interval);
  }, []);

  // Update remaining seconds whenever selectedRoom changes
  useEffect(() => {
    if (selectedRoom) {
      setRemainingSeconds(selectedRoom.remainingSeconds);
    }
  }, [selectedRoom]);

  // Local tick countdown for smooth second-by-second display while active
  useEffect(() => {
    let tick: any = null;
    if (selectedRoom?.status === 'active' && remainingSeconds > 0 && !syncErrorSimulated) {
      tick = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            handleCompleteRoom();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(tick);
  }, [selectedRoom?.status, remainingSeconds, syncErrorSimulated]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await loginAsDemo();
    }
    try {
      setActionLoading(true);
      const created = await api.createRoom({
        name: newRoomName,
        description: newRoomDesc,
        plannedDurationMinutes: newRoomDuration,
        isPrivate: newRoomPrivate,
      });
      setCreateModalOpen(false);
      setNewRoomName('');
      setNewRoomDesc('');
      await fetchRooms();
      setSelectedRoom(created);
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) {
      await loginAsDemo();
    }
    try {
      setActionLoading(true);
      const updated = await api.joinRoom(roomId);
      setSelectedRoom(updated);
      await fetchRooms();
    } catch (err: any) {
      alert(err.message || 'Failed to join room');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoomAction = async (action: 'start' | 'pause' | 'resume' | 'complete') => {
    if (!selectedRoom) return;
    try {
      setActionLoading(true);
      const updated = await api.roomAction(selectedRoom.id, action);
      setSelectedRoom(updated);
      await fetchRooms();

      if (action === 'complete') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        await refreshProfile();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRoom = async () => {
    if (!selectedRoom || selectedRoom.status === 'completed') return;
    try {
      const updated = await api.roomAction(selectedRoom.id, 'complete');
      setSelectedRoom(updated);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      await refreshProfile();
      await fetchRooms();
    } catch {
      // Ignored
    }
  };

  const handleCheckIn = async () => {
    if (!selectedRoom || !user) return;
    try {
      await api.roomCheckIn(selectedRoom.id);
      setCheckInSuccess(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      await refreshProfile();
      await fetchRooms();
      setTimeout(() => setCheckInSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handleResyncTimer = async () => {
    if (!selectedRoom) return;
    try {
      const fresh = await api.getRoom(selectedRoom.id);
      setSelectedRoom(fresh);
      setRemainingSeconds(fresh.remainingSeconds);
      setSyncErrorSimulated(false);
    } catch (err: any) {
      alert(err.message || 'Resync failed');
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isHost = user && selectedRoom && selectedRoom.hostUserId === user.id;

  return (
    <div className="space-y-8 py-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-violet-400 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>REAL-TIME CO-STUDY ARENA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Focus Rooms</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Study simultaneously with peers under server-synchronized master timers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-bold shadow-glow-violet transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Room</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Room Stage + Available Rooms List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Room Master Stage */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRoom ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-violet-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      {selectedRoom.code}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      selectedRoom.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      selectedRoom.status === 'paused' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      selectedRoom.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {selectedRoom.status.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">{selectedRoom.name}</h2>
                  <p className="text-xs text-slate-400">{selectedRoom.description || 'Sprint without distractions.'}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Host: <span className="text-white font-semibold">{selectedRoom.hostName}</span></div>
                  <div className="text-xs text-slate-400">{selectedRoom.participantCount} / {selectedRoom.maxParticipants} participants</div>
                </div>
              </div>

              {/* SD-001 Sync Error Banner if simulated */}
              {syncErrorSimulated && (
                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Error SD-001: Focus Session Synchronization Failed</span>
                    </div>
                    <button
                      onClick={handleResyncTimer}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resync Timer</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Network drift interrupted WebSocket master clock. Click <strong>Resync Timer</strong> to restore synchronized state from the server.
                  </p>
                  <button
                    onClick={() => triggerAssistantPrompt("Why did my focus room fail to synchronize with SD-001?", "SD-001")}
                    className="text-[10px] text-rose-300 underline font-medium hover:text-white"
                  >
                    Ask Assistant to explain Error SD-001 →
                  </button>
                </div>
              )}

              {/* Master Digital Countdown Clock */}
              <div className="py-8 rounded-2xl bg-[#070A13] border border-violet-500/40 text-center space-y-3 shadow-inner relative">
                <div className="text-6xl sm:text-7xl font-extrabold font-mono text-violet-300 tracking-wider">
                  {formatTimer(remainingSeconds)}
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Server Master Clock Governed ({selectedRoom.plannedDurationMinutes} min session)</span>
                </div>
              </div>

              {/* Host & Participant Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  {isHost ? (
                    <>
                      {selectedRoom.status === 'waiting' && (
                        <button
                          onClick={() => handleRoomAction('start')}
                          disabled={actionLoading}
                          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-violet transition-all flex items-center space-x-1.5"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Room Session</span>
                        </button>
                      )}
                      {selectedRoom.status === 'active' && (
                        <button
                          onClick={() => handleRoomAction('pause')}
                          disabled={actionLoading}
                          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                        >
                          <Pause className="w-4 h-4" />
                          <span>Pause Session</span>
                        </button>
                      )}
                      {selectedRoom.status === 'paused' && (
                        <button
                          onClick={() => handleRoomAction('resume')}
                          disabled={actionLoading}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                        >
                          <Play className="w-4 h-4" />
                          <span>Resume Session</span>
                        </button>
                      )}
                      {selectedRoom.status !== 'completed' && (
                        <button
                          onClick={() => handleRoomAction('complete')}
                          disabled={actionLoading}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                        >
                          End Early
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleJoinRoom(selectedRoom.id)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-violet transition-all flex items-center space-x-1.5"
                    >
                      <Users className="w-4 h-4" />
                      <span>Join This Session</span>
                    </button>
                  )}

                  {/* Check-In Action Button */}
                  <button
                    onClick={handleCheckIn}
                    disabled={selectedRoom.status !== 'active'}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-emerald-400 text-xs font-semibold transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Check In (+5 pts)</span>
                  </button>
                </div>

                {/* SD-001 Simulation Toggle & Resync */}
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => setSyncErrorSimulated(!syncErrorSimulated)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Simulate network drift to test SD-001 error response"
                  >
                    Simulate SD-001 Error
                  </button>
                  <button
                    onClick={handleResyncTimer}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Resync with Master Server"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Check-in success toast */}
              {checkInSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Accountability confirmed! +5 bonus consistency points awarded.</span>
                </div>
              )}

              {/* Room Participants Section */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Room Squad ({selectedRoom.participants.length})</span>
                  <span className="text-[10px] text-violet-400">Active Presence</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRoom.participants.map((p) => (
                    <div key={p.userId} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.displayName} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs">
                            {p.displayName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-200">{p.displayName}</p>
                          <p className="text-[10px] text-slate-400">@{p.username}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          {p.checkinCount} Check-ins
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Zap className="w-8 h-8 text-violet-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No room currently selected.</p>
              <p className="text-xs">Select a room from the directory or create a new room for your squad.</p>
            </div>
          )}
        </div>

        {/* Right: Available Focus Rooms Directory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campus Directory</h3>
            <span className="text-xs text-slate-400">{rooms.length} Rooms</span>
          </div>

          <div className="space-y-3">
            {rooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-violet-950/40 border-violet-500 shadow-glow-violet'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-violet-300">
                      {room.code}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      room.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{room.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
                    <span>{room.plannedDurationMinutes}m Sprint</span>
                    <span>{room.participantCount} / {room.maxParticipants} peers</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-violet-500/40 rounded-2xl p-6 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Create Synchronized Focus Room</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Homework Sprint"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Objective / Topic</label>
                <input
                  type="text"
                  placeholder="What is the group focusing on?"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 45, 60].map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => setNewRoomDuration(dur)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        newRoomDuration === dur
                          ? 'bg-violet-600 text-white border-violet-500 shadow-glow-violet'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="privateToggle"
                  checked={newRoomPrivate}
                  onChange={(e) => setNewRoomPrivate(e.target.checked)}
                  className="rounded border-slate-700 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="privateToggle" className="text-xs text-slate-300">
                  Private room (only squad members with room code can join)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !newRoomName.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet transition-colors"
                >
                  Create & Launch Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
