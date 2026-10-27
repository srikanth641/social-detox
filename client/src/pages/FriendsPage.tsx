import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Flame, 
  Target, 
  Award, 
  Share2, 
  Plus, 
  CheckCircle, 
  Copy, 
  Sparkles,
  TreePine,
  ShieldAlert,
  BookOpen,
  Unlock,
  MessageSquareOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { FriendCircle, Challenge, Achievement } from '../types';

export const FriendsPage: React.FC = () => {
  const { user, loginAsDemo } = useAuth();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [circles, setCircles] = useState<FriendCircle[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Inputs
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [createCircleOpen, setCreateCircleOpen] = useState(false);
  const [circleInviteCode, setCircleInviteCode] = useState('');
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [shareSuccessBadge, setShareSuccessBadge] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [lb, circ, chal, ach] = await Promise.all([
        api.getLeaderboard(),
        api.getCircles(),
        api.getChallenges(),
        api.getAchievements(),
      ]);
      setLeaderboard(lb);
      setCircles(circ);
      setChallenges(chal);
      setAchievements(ach);
    } catch (err) {
      console.error('Failed to load friends & challenges data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoinCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) await loginAsDemo();
    try {
      await api.joinCircle(circleInviteCode);
      setJoinModalOpen(false);
      setCircleInviteCode('');
      confetti({ particleCount: 50, spread: 60 });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to join circle');
    }
  };

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) await loginAsDemo();
    try {
      await api.createCircle({ name: newCircleName, description: newCircleDesc });
      setCreateCircleOpen(false);
      setNewCircleName('');
      setNewCircleDesc('');
      confetti({ particleCount: 70, spread: 60 });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create circle');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) await loginAsDemo();
    try {
      await api.joinChallenge(challengeId);
      confetti({ particleCount: 60, spread: 70 });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to join challenge');
    }
  };

  const handleShareAchievement = (title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`🔥 I just flexed offline: Unlocked "${title}" on Social Detox! Check my focus streak at https://social-detox.app`);
      setShareSuccessBadge(title);
      setTimeout(() => setShareSuccessBadge(null), 3000);
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'trees':
        return <TreePine className="w-5 h-5 text-emerald-400" />;
      case 'shield-alert':
        return <ShieldAlert className="w-5 h-5 text-blue-400" />;
      case 'book-open':
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'unlock':
        return <Unlock className="w-5 h-5 text-cyan-400" />;
      case 'message-square-off':
        return <MessageSquareOff className="w-5 h-5 text-rose-400" />;
      default:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-12 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-violet-400 mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>ACCOUNTABILITY & CIRCLES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Friends & Challenges</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Form study squads, complete offline milestones, and compete on the weekly consistency leaderboard.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setJoinModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
          >
            Join with Code
          </button>
          <button
            onClick={() => setCreateCircleOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-violet transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Squad</span>
          </button>
        </div>
      </div>

      {/* Friend Circles Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Users className="w-4 h-4 text-violet-400" />
          <span>Active Friend Circles</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {circles.map((c) => (
            <div key={c.id} className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">
                  Code: {c.invite_code}
                </span>
                <span className="text-xs text-slate-400">{c.member_count} Members</span>
              </div>
              <h4 className="text-base font-bold text-white">{c.name}</h4>
              <p className="text-xs text-slate-400">{c.description || 'Campus study squad holding each other accountable.'}</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Created by <strong className="text-slate-200">{c.creator_name}</strong></span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(c.invite_code);
                    alert(`Copied invite code: ${c.invite_code}`);
                  }}
                  className="flex items-center space-x-1 text-violet-400 hover:text-violet-300 font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Focus Challenges */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Active Campus Challenges</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((ch) => (
            <div key={ch.id} className="glass-panel rounded-2xl p-6 space-y-4 border border-cyan-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{ch.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{ch.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                    +{ch.reward_points} pts
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Goal: {ch.target_focus_minutes} mins in {ch.target_days} days</span>
                  <span>{ch.participant_count} Students Joined</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{
                      width: ch.userProgress
                        ? `${Math.min(100, (ch.userProgress.progress_minutes / ch.target_focus_minutes) * 100)}%`
                        : '0%',
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {ch.userProgress?.is_completed ? 'Completed 🎉' : ch.userProgress ? `${ch.userProgress.progress_minutes}m completed` : 'Not joined yet'}
                </span>
                <button
                  onClick={() => handleJoinChallenge(ch.id)}
                  disabled={Boolean(ch.userProgress)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                >
                  {ch.userProgress ? 'Participating' : 'Join Challenge'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Consistency Leaderboard */}
      <div className="glass-panel rounded-3xl p-6 space-y-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Weekly Consistency Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-400">
              Scoring strictly rewards <strong>daily consistency and completed focus sessions</strong>, preventing multi-hour idling hacks.
            </p>
          </div>
          <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            Formula: (Streak Days × 50) + Points
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Streak</th>
                <th className="py-3 px-3">Total Focus</th>
                <th className="py-3 px-3">Consistency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    user && user.id === entry.id ? 'bg-violet-600/10 border-l-2 border-violet-500' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-[10px]">
                          {entry.display_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-200">{entry.display_name}</div>
                        <div className="text-[10px] text-slate-400">@{entry.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1 font-semibold text-orange-400">
                      <Flame className="w-3.5 h-3.5 fill-orange-400/20" />
                      <span>{entry.streak_days}d</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    {entry.total_focus_minutes}m
                  </td>
                  <td className="py-3 px-3 font-mono font-extrabold text-violet-300">
                    {entry.consistency_score} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shareable Achievement Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Award className="w-4 h-4 text-violet-400" />
            <span>Digital Independence Achievements</span>
          </h3>
          <span className="text-xs text-slate-400">Click to copy shareable milestone badge</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div key={ach.id} className="glass-card rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {getAchievementIcon(ach.icon)}
                  </div>
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                    +{ach.points} pts
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Offline Trophy</span>
                <button
                  onClick={() => handleShareAchievement(ach.title)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-300 text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{shareSuccessBadge === ach.title ? 'Copied Flex!' : 'Share'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Circle Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-violet-500/40 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white">Join Friend Circle</h3>
            <p className="text-xs text-slate-400">Enter your squad's invite code (e.g. DETOX-2026 or CODE-MID):</p>
            <form onSubmit={handleJoinCircle} className="space-y-3">
              <input
                type="text"
                required
                placeholder="DETOX-2026"
                value={circleInviteCode}
                onChange={(e) => setCircleInviteCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 uppercase font-mono"
              />
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setJoinModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white">Join Squad</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Circle Modal */}
      {createCircleOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-violet-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white">Create New Friend Circle</h3>
            <form onSubmit={handleCreateCircle} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Circle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics 101 Deep Work Guild"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <input
                  type="text"
                  placeholder="What is the group's mission?"
                  value={newCircleDesc}
                  onChange={(e) => setNewCircleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setCreateCircleOpen(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white">Create Circle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
