import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, Search, History, Code, Landmark, ArrowRight, Loader2, Zap, ShieldCheck, Target, Sparkles, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useInterviewStore } from '../../store/interviewStore';
import NeuralLoader from '../../components/common/NeuralLoader';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { sessions, fetchSessions, loading } = useInterviewStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const firstName = user?.firstName || 'there';
  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions)
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-fade-in">
      
      {/* Hero Greeting Section */}
      <header className="pt-12 mb-12 space-y-4 relative">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-[0.2em]">
            <Zap size={14} />
            Command Center Active
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 font-label-bold text-[10px] uppercase tracking-[0.2em]">
            <ShieldCheck size={14} />
            Neural Link: Stable
          </div>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
          {getGreeting()}, <span className="text-secondary">{firstName}.</span>
        </h1>
        <p className="font-body-lg text-secondary text-lg max-w-xl leading-relaxed">
          {totalSessions === 0 && !loading
            ? 'Your neural profile is currently baseline.'
            : `Your readiness is currently at ${avgScore}%.`}
        </p>

        {/* Tactical HUD Overlay */}
        <div className="absolute top-12 right-0 hidden xl:flex flex-col gap-2 p-4 glass rounded-3xl border-dashed">
          <div className="flex items-center justify-between gap-8">
            <span className="text-[9px] font-label-bold text-secondary uppercase tracking-widest">AI Cluster</span>
            <span className="text-[9px] font-label-bold text-primary uppercase tracking-widest">Gemini-2.0-F</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-[9px] font-label-bold text-secondary uppercase tracking-widest">Latency</span>
            <span className="text-[9px] font-label-bold text-green-500 uppercase tracking-widest">24ms</span>
          </div>
          <div className="w-full h-[2px] bg-outline-variant/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Readiness Hero Card */}
        <section className="lg:col-span-8 glass rounded-[32px] p-8 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0 neural-pulse">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle className="text-outline-variant/30" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle 
                  className="text-primary transition-all duration-1500 glow-primary" 
                  cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeDasharray={`${avgScore}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display text-3xl font-bold text-primary">{loading ? '—' : `${avgScore}%`}</span>
                <span className="text-[9px] font-label-bold text-secondary uppercase tracking-widest">Readiness</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp size={20} />
                <h3 className="font-display text-xl font-bold">Neural Readiness Index</h3>
              </div>
              <p className="font-body-md text-secondary leading-relaxed text-sm">
                Based on your last {totalSessions} simulations.
              </p>
              <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary font-label-bold text-[10px] uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  Status: {avgScore >= 80 ? 'Exceptional' : 'Advancing'}
                </div>
                <Link to="/analytics" className="text-secondary font-label-bold text-[9px] uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                  Details <ChevronRight size={10} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Tiles */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
          <Link to="/interview/setup" className="group relative bg-primary text-on-primary rounded-[32px] p-8 overflow-hidden shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={120} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">New Simulation</h3>
            <p className="text-white/70 text-xs mb-6">Enter the interview chamber and test your skills.</p>
            <div className="inline-flex items-center gap-2 font-label-bold text-[10px] uppercase tracking-[0.2em] bg-white/10 px-4 py-2 rounded-full">
              Engage <ArrowRight size={12} />
            </div>
          </Link>

          <Link to="/resume" className="group glass rounded-[32px] p-8 border border-outline-variant/30 hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                <Target size={24} />
              </div>
              <ChevronRight size={20} className="text-outline group-hover:text-primary transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="font-display text-xl font-bold text-primary mb-1">Career Audit</h3>
            <p className="font-body-sm text-secondary text-xs">Analyze your resume against AI benchmarks.</p>
          </Link>
        </div>

        {/* Recent Operations */}
        <section className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <div className="flex items-center gap-3 text-primary">
              <History size={24} />
              <h3 className="font-display text-2xl font-bold">Recent Operations</h3>
            </div>
            <Link to="/analytics" className="text-secondary font-label-bold text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
              View History
            </Link>
          </div>

          {loading ? (
            <NeuralLoader message="Synchronizing Neural Profile..." />
          ) : totalSessions === 0 ? (
            <div className="py-20 text-center glass rounded-[40px] border-dashed">
              <p className="font-body-lg text-secondary mb-8">No historical data found in your neural profile.</p>
              <Link to="/interview/setup" className="bg-primary text-on-primary font-display font-bold px-10 py-4 rounded-2xl">
                Start First Simulation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.slice(0, 6).map((session) => (
                <Link key={session.id} to={`/feedback/${session.id}`} className="glass rounded-[32px] p-6 hover:border-primary/40 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-surface-container-high text-secondary group-hover:text-primary transition-colors">
                      {session.role?.includes('Design') ? <Landmark size={20} /> : <Code size={20} />}
                    </div>
                    <span className="font-display text-xl font-bold text-primary">{session.score}%</span>
                  </div>
                  <h4 className="font-label-bold text-sm text-primary mb-1 truncate">{session.role}</h4>
                  <p className="font-body-sm text-secondary text-[11px] mb-4">{session.company}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                    <span className="text-[9px] font-label-bold text-outline uppercase tracking-widest">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-primary font-label-bold text-[9px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Details <ChevronRight size={10} className="inline" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
