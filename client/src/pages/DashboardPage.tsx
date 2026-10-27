import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Flame, 
  Trophy, 
  Target, 
  Play, 
  Pause, 
  RotateCcw, 
  Quote, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { FocusRoom, MotivationQuote, Achievement } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, loginAsDemo, refreshProfile } = useAuth();
  const [motivation, setMotivation] = useState<MotivationQuote | null>(null);
  const [rooms, setRooms] = useState<FocusRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Solo Timer State
  const [soloMinutes, setSoloMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  // Weekly analytics data
  const weeklyData = [
    { day: 'Mon', minutes: 95, target: 120 },
    { day: 'Tue', minutes: 130, target: 120 },
    { day: 'Wed', minutes: 80, target: 120 },
    { day: 'Thu', minutes: 160, target: 120 },
    { day: 'Fri', minutes: 110, target: 120 },
    { day: 'Sat', minutes: 185, target: 120 },
    { day: 'Sun', minutes: (user?.totalFocusMinutes || 140) % 200, target: 120 },
  ];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [quoteRes, roomsRes] = await Promise.all([
          api.getMotivation(),
          api.getRooms(),
        ]);
        setMotivation(quoteRes);
        setRooms(roomsRes.slice(0, 3));
      } catch (err) {
        console.warn('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Timer Tick Effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerActive && secondsRemaining === 0) {
      setTimerActive(false);
      setTimerFinished(true);
      handleSoloCompletion();
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  const handleSoloCompletion = async () => {
    if (user) {
      try {
        await api.logSoloSession(soloMinutes);
        await refreshProfile();
      } catch (err) {
        console.error('Failed to log solo session:', err);
      }
    }
  };

  const handleResetTimer = (minutes: number) => {
    setSoloMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setTimerActive(false);
    setTimerFinished(false);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 py-4">
      {/* Unauthenticated / Demo Banner */}
      {!user && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-slate-900 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Viewing Dashboard in Guest Mode</h4>
              <p className="text-xs text-slate-400">Sign in to save focus sessions, earn points, and climb the consistency leaderboard.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={loginAsDemo}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet transition-colors"
            >
              Sign In As Alex Rivers
            </button>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Greeting & Motivation Quote Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-violet-400 font-semibold mb-1">
              <span>DAILY PROGRESSION OVERVIEW</span>
              <span>•</span>
              <span className="text-emerald-400">Streak Shield Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-violet-400">{user?.displayName || 'Explorer'}</span>.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              You've committed <span className="text-white font-bold">{user?.totalFocusMinutes || 140} minutes</span> of deep offline focus so far.
            </p>
          </div>

          {/* Motivation Quote from /api/v1/motivation */}
          {motivation && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
              <Quote className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="text-slate-200 italic leading-relaxed">"{motivation.quote}"</p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-violet-300">— {motivation.author}</span>
                  <span>•</span>
                  <span className="capitalize">Source: {motivation.source}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Goal Ring Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Today's Focus Goal</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="text-center py-2">
            <div className="text-4xl font-extrabold text-white">
              {Math.min(user?.totalFocusMinutes || 75, user?.focusGoalMinutesPerDay || 120)}
              <span className="text-base text-slate-400 font-normal"> / {user?.focusGoalMinutesPerDay || 120}m</span>
            </div>
            <p className="text-xs text-cyan-300 font-medium mt-1">
              {Math.round(((Math.min(user?.totalFocusMinutes || 75, user?.focusGoalMinutesPerDay || 120)) / (user?.focusGoalMinutesPerDay || 120)) * 100)}% of daily target reached
            </p>
          </div>

          {/* Goal progress bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(((user?.totalFocusMinutes || 75) / (user?.focusGoalMinutesPerDay || 120)) * 100))}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Core Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400/20" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.streakDays || 7} <span className="text-xs text-orange-400 font-normal">Days</span>
          </div>
          <p className="text-[11px] text-slate-400">Longest: {user?.longestStreak || 12} days</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Focus Minutes</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.totalFocusMinutes || 1420}
          </div>
          <p className="text-[11px] text-emerald-400">+12% vs last week</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Points Earned</span>
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.points || 640}
          </div>
          <p className="text-[11px] text-yellow-300">Consistency flex level 4</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sessions Logged</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            28
          </div>
          <p className="text-[11px] text-cyan-400">Zero session abandons</p>
        </div>
      </div>

      {/* Main Grid: Solo Quick-Start Timer + Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Solo Focus Timer */}
        <div className="glass-panel rounded-2xl p-6 space-y-5 border border-violet-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-violet-400" />
              <span>Solo Focus Sprint</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
              Instant Start
            </span>
          </div>

          {/* Sprint duration selector */}
          <div className="grid grid-cols-3 gap-2">
            {[15, 25, 45].map((m) => (
              <button
                key={m}
                onClick={() => handleResetTimer(m)}
                className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  soloMinutes === m
                    ? 'bg-violet-600 text-white border-violet-500 shadow-glow-violet'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {m} Mins
              </button>
            ))}
          </div>

          {/* Big Digital Countdown Display */}
          <div className="py-6 rounded-2xl bg-[#070A13] border border-slate-800 text-center space-y-2 shadow-inner">
            <div className="text-5xl font-extrabold font-mono text-violet-300 tracking-wider">
              {formatTimer(secondsRemaining)}
            </div>
            <p className="text-[11px] text-slate-400">
              {timerActive ? 'Deep Work In Progress • Phone Face Down' : timerFinished ? 'Sprint Completed! Points logged.' : 'Ready when you are'}
            </p>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-glow-violet flex items-center justify-center space-x-1.5"
            >
              {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{timerActive ? 'Pause Session' : 'Start Focus Session'}</span>
            </button>
            <button
              onClick={() => handleResetTimer(soloMinutes)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Focus Progress Chart (Recharts) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Weekly Focus Consistency</span>
              </h3>
              <p className="text-xs text-slate-400">Minutes focused per day against 120m target</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Streak On Track
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1424', borderColor: '#1F2E4D', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.minutes >= entry.target ? '#8B5CF6' : '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Focus Rooms Quick Jump */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>Active Campus Focus Rooms</span>
          </h3>
          <Link to="/focus-rooms" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1">
            <span>View All Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">
                  {room.code}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  room.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                }`}>
                  {room.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white line-clamp-1">{room.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{room.description || 'Synchronized study sprint'}</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{room.participantCount} / {room.maxParticipants} peers</span>
                <Link
                  to={`/focus-rooms?join=${room.id}`}
                  className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                >
                  Join Room
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
