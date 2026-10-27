import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Clock, 
  Users, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  BookOpen, 
  BarChart3,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { triggerAssistantPrompt } from '../components/assistant/ChatWidget';

export const LandingPage: React.FC = () => {
  // Interactive demo timer for the hero/preview section
  const [demoSeconds, setDemoSeconds] = useState(25 * 60);
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (demoRunning && demoSeconds > 0) {
      interval = setInterval(() => setDemoSeconds(s => s - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [demoRunning, demoSeconds]);

  const formatDemoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Anti-Doomscroll Movement for Gen Z</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Make Being Offline <br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            The New Flex.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Break the algorithmic dopamine loop. Synchronize deep study sessions with friends, earn consistency streaks, and turn your genuine focus into real-world confidence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/focus-rooms"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Your Detox</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#features"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4 text-violet-400" />
            <span>Explore Features</span>
          </a>
        </div>

        {/* Quick Trust Highlights */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Server-governed synchronization</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No spyware or invasive phone scrapers</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Consistency rewards over screen addiction</span>
          </span>
        </div>
      </section>

      {/* Interactive Focus Room & Dashboard Preview */}
      <section className="relative max-w-5xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-cyan-500/10 blur-3xl -z-10 rounded-3xl"></div>

        <div className="glass-panel rounded-2xl border border-violet-500/30 overflow-hidden shadow-2xl">
          {/* Simulated Mac / App Header */}
          <div className="bg-[#0B0F19] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="ml-2 text-xs font-mono text-slate-400">live-room://STUDY-45 (Synchronized Master Clock)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-400">4 Active Peers Focusing</span>
            </div>
          </div>

          {/* Interactive Preview Body */}
          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-gradient-to-b from-[#0D1424]/90 to-[#070A13]">
            {/* Left: Timer Column */}
            <div className="md:col-span-2 text-center md:text-left space-y-4">
              <div className="inline-block px-3 py-1 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium border border-violet-500/30">
                Focus Sprint • Late Night Algorithmic Deep Work
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Synchronized Peer Accountability
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                When one person starts the timer, everyone’s clock ticks together in real time. Periodic check-ins ensure your friend isn't sneakily switching over to TikTok or Discord.
              </p>

              {/* Live Interactive Timer Widget */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <div className="px-6 py-3 rounded-2xl bg-[#070A13] border border-violet-500/40 text-4xl font-extrabold font-mono text-violet-300 shadow-glow-violet">
                  {formatDemoTime(demoSeconds)}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setDemoRunning(!demoRunning)}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    {demoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{demoRunning ? 'Pause Session' : 'Test Live Timer'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setDemoRunning(false);
                      setDemoSeconds(25 * 60);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Peers in Room */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Room Members</span>
                <span className="text-[10px] text-violet-400">Master Sync</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-[10px]">A</div>
                    <span className="font-medium text-slate-200">Alex Rivers (Host)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Checked in ✓</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">M</div>
                    <span className="font-medium text-slate-200">Maya Lin</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Checked in ✓</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-[10px]">L</div>
                    <span className="font-medium text-slate-200">Liam Chen</span>
                  </div>
                  <span className="text-[10px] text-yellow-400 font-mono">Deep Work</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="space-y-12 max-w-6xl mx-auto">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed for Real Progress, Not Endless Metrics
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything in Social Detox is engineered to reward healthy attention habits and genuine offline living.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Synchronized Focus Rooms</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Study or code simultaneously with classmates. Server-controlled master clocks keep everyone in lockstep with zero drift.
            </p>
            <Link to="/focus-rooms" className="inline-flex items-center space-x-1 text-xs font-semibold text-violet-400 hover:text-violet-300 pt-2">
              <span>Join a room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Friend Circles & Squads</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Form campus or project circles with private invite codes. Celebrate each other's offline milestones without invasive surveillance.
            </p>
            <Link to="/friends" className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-2">
              <span>View Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Offline Achievements</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlock badges like “Touch Grass Champion”, “Survived 45 min without group chat”, and “Weekend Offline Legend”.
            </p>
            <Link to="/friends" className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 pt-2">
              <span>Explore Badges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How Social Detox Works</h2>
          <p className="text-xs text-slate-400">Three easy steps to regain your attention span.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 font-extrabold text-base mx-auto flex items-center justify-center border border-violet-500/30">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Pick a Goal or Room</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set your daily focus goal or join a 25/45/60 min synchronized room with your squad.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-extrabold text-base mx-auto flex items-center justify-center border border-blue-500/30">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Put Phone Face Down</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete your focus sprint. Check in when prompted to confirm your active attention.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-cyan-600/20 text-cyan-400 font-extrabold text-base mx-auto flex items-center justify-center border border-cyan-500/30">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Level Up Your Flex</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Collect consistency points, build your streak, and unlock shareable offline badges.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-r from-violet-900/60 via-slate-900 to-blue-950/60 border border-violet-500/30 space-y-6 shadow-2xl">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Ready to swap screen scrolling for real progress?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Start focusing right now — no credit card, no app installs, completely free and open for college students.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/focus-rooms"
            className="px-8 py-3.5 rounded-xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 transition-colors shadow-lg"
          >
            Enter Focus Rooms Now
          </Link>
          <button
            onClick={() => triggerAssistantPrompt("How do I start a focus session with friends?")}
            className="px-6 py-3.5 rounded-xl bg-slate-900/90 border border-violet-500/30 text-violet-300 font-semibold text-sm hover:bg-slate-800 transition-colors"
          >
            Ask Assistant
          </button>
        </div>
      </section>
    </div>
  );
};
