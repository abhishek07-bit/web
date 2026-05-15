import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Clock, Info, Activity, Zap, Target, History, ChevronRight, BarChart3, ShieldCheck } from 'lucide-react';
import { useInterviewStore } from '../../store/interviewStore';

export default function AnalyticsPage() {
  const sessions = useInterviewStore((s) => s.sessions);

  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions)
    : 0;

  // Calculate weekly trend
  const thisWeek = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });
  const lastWeek = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7 && diffDays <= 14;
  });
  const thisWeekAvg = thisWeek.length > 0
    ? Math.round(thisWeek.reduce((sum, s) => sum + (s.score || 0), 0) / thisWeek.length)
    : 0;
  const lastWeekAvg = lastWeek.length > 0
    ? Math.round(lastWeek.reduce((sum, s) => sum + (s.score || 0), 0) / lastWeek.length)
    : 0;
  const trend = thisWeekAvg - lastWeekAvg;

  // Group sessions by topic
  const topicScores: Record<string, number[]> = {};
  sessions.forEach((s) => {
    const topic = s.role || 'General Simulation';
    if (!topicScores[topic]) topicScores[topic] = [];
    if (s.score) topicScores[topic].push(s.score);
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-fade-in">
      
      {/* Intelligence Header */}
      <header className="pt-12 mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-[0.2em]">
          <BarChart3 size={14} />
          Intelligence Hub
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-primary tracking-tight">
          Performance Analytics.
        </h1>
        <p className="font-body-lg text-secondary text-xl max-w-2xl">
          A deep-dive analysis of your simulation history, technical depth, and career readiness.
        </p>
      </header>

      {/* Primary Intel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="glass rounded-[32px] p-6 shadow-sm border-l-4 border-primary">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={18} className="text-primary" />
            <h3 className="font-label-bold text-[10px] uppercase tracking-widest text-secondary">Readiness</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-primary">{avgScore}%</span>
            {trend !== 0 && (
              <span className={`text-[10px] font-label-bold px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {trend > 0 ? '↑' : '↓'}{Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>

        <div className="glass rounded-[32px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={18} className="text-primary" />
            <h3 className="font-label-bold text-[10px] uppercase tracking-widest text-secondary">Operations</h3>
          </div>
          <span className="font-display text-4xl font-bold text-primary">{totalSessions}</span>
        </div>

        <div className="glass rounded-[32px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={18} className="text-primary" />
            <h3 className="font-label-bold text-[10px] uppercase tracking-widest text-secondary">Neural Load</h3>
          </div>
          <span className="font-display text-4xl font-bold text-primary">{totalSessions > 0 ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) : 0}m</span>
        </div>

        <div className="glass rounded-[32px] p-6 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={18} className="text-primary" />
            <h3 className="font-label-bold text-[10px] uppercase tracking-widest text-secondary">Stability</h3>
          </div>
          <span className="font-display text-4xl font-bold text-primary">Stable</span>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/10">
            <div className="h-full bg-primary/30 w-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cinematic Performance Chart */}
      <section className="glass rounded-[40px] p-10 mb-12 shadow-premium relative overflow-hidden">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h3 className="font-display text-2xl font-bold text-primary">Neural Growth Curve</h3>
            <p className="text-[10px] font-label-bold text-secondary uppercase tracking-[0.2em]">Readiness Delta Over Last 10 Missions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[9px] font-label-bold text-secondary uppercase tracking-widest">Score Vector</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full relative">
          {totalSessions > 1 ? (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {[0, 50, 100, 150, 200].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="var(--md-sys-color-outline-variant)" strokeWidth="0.5" strokeDasharray="4,4" />
              ))}
              
              {/* Line Area */}
              <path
                d={`M 0 200 ${sessions.slice(-10).map((s, i) => `L ${(i / 9) * 1000} ${200 - ((s.score || 0) * 2)}`).join(' ')} L 1000 200 Z`}
                fill="url(#chartGradient)"
                className="animate-fade-in"
              />
              
              {/* Main Line */}
              <path
                d={sessions.slice(-10).map((s, i) => `${i === 0 ? 'M' : 'L'} ${(i / 9) * 1000} ${200 - ((s.score || 0) * 2)}`).join(' ')}
                fill="none"
                stroke="var(--md-sys-color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-path"
                style={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
              />
              
              {/* Data Points */}
              {sessions.slice(-10).map((s, i) => (
                <circle
                  key={s.id}
                  cx={(i / 9) * 1000}
                  cy={200 - ((s.score || 0) * 2)}
                  r="4"
                  className="fill-surface-container-lowest stroke-primary stroke-2"
                />
              ))}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed border-outline-variant/30 rounded-3xl text-outline font-label-bold text-xs uppercase tracking-widest">
              Insufficient Data for Growth Matrix
            </div>
          )}
        </div>
      </section>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Topic Breakdown */}
        <section className="lg:col-span-8 glass rounded-[40px] p-10 shadow-premium">
          <div className="flex items-center gap-3 mb-10">
            <Target size={24} className="text-primary" />
            <h3 className="font-display text-2xl font-bold text-primary">Topic Performance Matrix</h3>
          </div>
          
          {Object.keys(topicScores).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(topicScores).map(([topic, scores]) => {
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                return (
                  <div key={topic} className="group">
                    <div className="flex justify-between items-end mb-3">
                      <span className="font-label-bold text-sm text-primary">{topic}</span>
                      <span className="font-display text-lg font-bold text-primary">{avg}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.4)]"
                        style={{ width: `${avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center">
                <Info size={32} className="text-outline" />
              </div>
              <p className="font-body-lg text-secondary max-w-sm">Simulation history empty. Engage in training to generate intelligence data.</p>
              <Link to="/interview/setup" className="bg-primary text-on-primary font-display font-bold px-8 py-3 rounded-2xl">
                Begin Simulation
              </Link>
            </div>
          )}
        </section>

        {/* Operation History List */}
        <section className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3 text-primary mb-2">
            <History size={20} />
            <h3 className="font-display text-xl font-bold">Operation History</h3>
          </div>
          
          <div className="space-y-4">
            {sessions.length > 0 ? (
              sessions.slice(0, 8).map((s) => (
                <Link key={s.id} to={`/feedback/${s.id}`} className="flex items-center justify-between p-5 glass rounded-[24px] border border-outline-variant/20 hover:border-primary/30 transition-all group">
                  <div className="min-w-0 flex-1 mr-4">
                    <h4 className="font-label-bold text-xs text-primary truncate uppercase tracking-widest">{s.role}</h4>
                    <p className="font-body-sm text-[10px] text-secondary">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg font-bold text-primary">{s.score}%</span>
                    <ChevronRight size={16} className="text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="font-body-sm text-secondary text-center py-10">No records found.</p>
            )}
          </div>
          
          {sessions.length > 0 && (
            <div className="p-6 bg-primary text-on-primary rounded-[32px] shadow-lg shadow-primary/20 relative overflow-hidden group">
              <ShieldCheck size={40} className="mb-4 opacity-30" />
              <h4 className="font-display text-lg font-bold mb-2">Growth Path</h4>
              <p className="text-[11px] text-white/70 leading-relaxed">
                Consistency is key. You've completed {totalSessions} operations. Reach 10 to unlock your Advanced Neural Profile.
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
