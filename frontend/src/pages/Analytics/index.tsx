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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="glass rounded-[32px] p-8 shadow-sm group">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <h3 className="font-label-bold text-xs uppercase tracking-[0.1em] text-secondary">Readiness Index</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-primary">{avgScore}%</span>
            {trend !== 0 && (
              <span className={`text-[10px] font-label-bold px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <p className="text-[10px] font-label-bold text-outline mt-4 uppercase tracking-widest">Global Ranking: Top 15%</p>
        </div>

        <div className="glass rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Zap size={20} />
            </div>
            <h3 className="font-label-bold text-xs uppercase tracking-[0.1em] text-secondary">Active Sessions</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-primary">{totalSessions}</span>
            <span className="text-secondary font-label-bold text-xs">Total</span>
          </div>
          <p className="text-[10px] font-label-bold text-outline mt-4 uppercase tracking-widest">{thisWeek.length} completed this week</p>
        </div>

        <div className="glass rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Clock size={20} />
            </div>
            <h3 className="font-label-bold text-xs uppercase tracking-[0.1em] text-secondary">Neural Training</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-primary">{totalSessions > 0 ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) : 0}</span>
            <span className="text-secondary font-label-bold text-xs">Mins</span>
          </div>
          <p className="text-[10px] font-label-bold text-outline mt-4 uppercase tracking-widest">Avg {totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions) : 0}m / session</p>
        </div>
      </div>

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
