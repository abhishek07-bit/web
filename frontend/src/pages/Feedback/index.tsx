import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PlusCircle, ArrowUp, Check, Target, Lightbulb, ArrowRight, Loader2, Sparkles, ShieldCheck, Download, LayoutDashboard, History } from 'lucide-react';
import { interviewAPI } from '../../api/client';
import { FeedbackReport } from '../../types';

export default function FeedbackPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      if (!sessionId) return;
      try {
        const { data } = await interviewAPI.getFeedback(sessionId);
        setFeedback(data);
      } catch (err) {
        console.error('Failed to load feedback:', err);
        setError('Failed to load feedback. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, [sessionId]);

  const handleExport = () => {
    if (!feedback) return;
    const lines = [
      '═══ PREPMATE AI PERFORMANCE REPORT ═══',
      '',
      `Session ID: ${sessionId}`,
      `Overall Score: ${feedback.overallScore}/100`,
      `Status: ${feedback.overallScore >= 80 ? 'EXCEPTIONAL' : feedback.overallScore >= 60 ? 'STRONG' : 'DEVELOPING'}`,
      '',
      '── CORE ASSESSMENT ──',
      feedback.overallAssessment,
      '',
      '── KEY STRENGTHS ──',
      ...(feedback.strengths || []).map((s, i) => `${i + 1}. ${s.title}: ${s.description}`),
      '',
      '── AREAS FOR GROWTH ──',
      ...(feedback.improvements || []).map((s, i) => `${i + 1}. ${s.title}: ${s.description}`),
      '',
      `Generated: ${new Date().toLocaleString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prepmate-analysis-${sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
        </div>
        <h2 className="font-display text-2xl font-bold text-primary mb-2">Neural Synthesis</h2>
        <p className="font-body-md text-secondary">Generating high-fidelity performance metrics...</p>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-3xl mb-8 border border-red-100">
          <p className="font-label-bold">{error || 'Data packet not found.'}</p>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 bg-primary text-on-primary font-display font-bold py-4 px-10 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          <LayoutDashboard size={20} />
          Return to Command
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-fade-in">
      {/* HUD Header */}
      <header className="pt-12 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-[0.2em]">
            <History size={14} />
            Post-Session Briefing
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-primary tracking-tight">
            Performance Analysis.
          </h1>
          <p className="font-body-lg text-secondary text-xl max-w-2xl">
            Detailed breakdown of your neural simulation metrics and strategic growth paths.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-surface-container-low border border-outline-variant text-primary font-display font-bold py-4 px-8 rounded-2xl hover:bg-surface-container-high transition-all shadow-sm"
          >
            <Download size={20} />
            Export Intel
          </button>
          <Link
            to="/interview/setup"
            className="flex items-center gap-2 bg-primary text-on-primary font-display font-bold py-4 px-8 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20"
          >
            <PlusCircle size={20} />
            New Simulation
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: PRIMARY METRICS */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Executive Summary Card */}
          <section className="glass rounded-[40px] p-10 shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              {/* Radial Score */}
              <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle className="text-outline-variant/30" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle 
                    className="text-primary transition-all duration-1500 ease-out" 
                    cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeDasharray={`${feedback.overallScore}, 100`}
                    strokeLinecap="round"
                    style={{ strokeDashoffset: 0 }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-display text-6xl font-bold text-primary tracking-tighter">{feedback.overallScore}</span>
                  <span className="text-[10px] font-label-bold text-secondary uppercase tracking-widest">Readiness</span>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <Sparkles size={24} />
                  <h2 className="font-display text-3xl font-bold">Executive Summary</h2>
                </div>
                <p className="font-body-lg text-lg text-secondary leading-relaxed italic">
                  "{feedback.overallAssessment}"
                </p>
                <div className="flex gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-widest">
                    Level: {feedback.overallScore >= 80 ? 'Tier 1' : feedback.overallScore >= 60 ? 'Tier 2' : 'Foundation'}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-secondary font-label-bold text-[10px] uppercase tracking-widest">
                    Duration: 24 mins
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Strengths/Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="glass rounded-[32px] p-8 shadow-sm border-l-4 border-l-green-500/50">
              <div className="flex items-center gap-3 mb-8 border-b border-outline-variant/30 pb-6">
                <div className="p-2 rounded-xl bg-green-500/10 text-green-600">
                  <Check size={20} strokeWidth={3} />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">Core Strengths</h3>
              </div>
              <div className="space-y-6">
                {feedback.strengths?.map((s, i) => (
                  <div key={i} className="group">
                    <h4 className="font-label-bold text-sm text-primary mb-1 group-hover:text-green-600 transition-colors">{s.title}</h4>
                    <p className="font-body-md text-sm text-secondary leading-relaxed">{s.description}</p>
                    {i < feedback.strengths!.length - 1 && <div className="mt-6 border-t border-outline-variant/20" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Areas */}
            <div className="glass rounded-[32px] p-8 shadow-sm border-l-4 border-l-primary/50">
              <div className="flex items-center gap-3 mb-8 border-b border-outline-variant/30 pb-6">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Target size={20} strokeWidth={2.5} />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">Critical Growth</h3>
              </div>
              <div className="space-y-6">
                {feedback.improvements?.map((s, i) => (
                  <div key={i} className="group">
                    <h4 className="font-label-bold text-sm text-primary mb-1 group-hover:text-primary transition-colors">{s.title}</h4>
                    <p className="font-body-md text-sm text-secondary leading-relaxed">{s.description}</p>
                    {i < feedback.improvements!.length - 1 && <div className="mt-6 border-t border-outline-variant/20" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: INSIGHTS & NEXT STEPS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Neural Intelligence Insight */}
          <section className="bg-primary text-on-primary rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors" />
            <ShieldCheck size={40} className="mb-6 text-white/40" />
            <h3 className="font-display text-2xl font-bold mb-4">Neural Intelligence</h3>
            <p className="font-body-md text-white/70 leading-relaxed mb-8">
              Our AI detected high semantic consistency in your technical answers, but noticed a slight dip in vocal confidence during the system design phase.
            </p>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between text-[10px] font-label-bold uppercase tracking-widest text-white/50 mb-2">
                  <span>Logic Depth</span>
                  <span>92%</span>
                </div>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[92%] animate-slide-up" />
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between text-[10px] font-label-bold uppercase tracking-widest text-white/50 mb-2">
                  <span>Tone Stability</span>
                  <span>78%</span>
                </div>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[78%] animate-slide-up" />
                </div>
              </div>
            </div>
          </section>

          {/* Actionable Learning Path */}
          <section className="glass rounded-[32px] p-8 border border-primary/20">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb size={24} className="text-primary" />
              <h3 className="font-display text-xl font-bold text-primary">Next Steps</h3>
            </div>
            <div className="space-y-3">
              {feedback.recommendedActions?.map((action, i) => (
                <a
                  key={i}
                  href={action.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-all group"
                >
                  <span className="font-label-bold text-sm text-primary">{action.title}</span>
                  <ArrowRight size={18} className="text-outline group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </a>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
