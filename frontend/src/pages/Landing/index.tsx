import { Link } from 'react-router-dom';
import { ArrowRight, Zap, FileText, Target, Activity, ShieldCheck, Cpu, BarChart3, ChevronRight, Globe, Layers } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex-grow flex flex-col selection:bg-primary/20">
      <main className="flex-grow flex flex-col">
        
        {/* Elite Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 py-32 md:py-48 flex flex-col items-center text-center overflow-hidden">
          {/* Animated Background Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] animate-bounce" style={{ animationDuration: '8s' }} />
          </div>

          <div className="inline-flex items-center gap-3 px-4 py-2 glass border-primary/20 rounded-full mb-10 animate-fade-in shadow-premium">
            <Activity size={14} className="text-primary animate-pulse" />
            <span className="font-label-bold text-[10px] text-primary uppercase tracking-[0.3em]">Neural Link Protocol Active</span>
          </div>
          
          <h1 className="font-display text-6xl md:text-8xl font-bold text-primary max-w-5xl mb-10 leading-[1.05] tracking-tight animate-slide-up">
            Master the Interview with <span className="text-secondary italic">Quiet Intelligence.</span>
          </h1>
          
          <p className="font-body-lg text-secondary text-xl md:text-2xl max-w-3xl mb-16 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            A disciplined, neural-first approach to career mastery. Elevate your narrative through adaptive logic and precise performance engineering.
          </p>
          
          <div className="flex gap-6 flex-wrap justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {user ? (
              <Link
                to="/dashboard"
                className="bg-primary text-on-primary font-display text-lg font-bold px-12 py-5 rounded-[24px] shadow-2xl shadow-primary/30 hover:scale-[1.02] hover:-translate-y-1 transition-all flex items-center gap-3 group"
              >
                Go to Command Center <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-primary text-on-primary font-display text-lg font-bold px-12 py-5 rounded-[24px] shadow-2xl shadow-primary/30 hover:scale-[1.02] hover:-translate-y-1 transition-all flex items-center gap-3 group"
                >
                  Initiate Prep <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="glass text-primary border border-primary/20 font-display text-lg font-bold px-12 py-5 rounded-[24px] hover:bg-white/40 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Protocol Matrix (How It Works) */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 border-b border-outline-variant/30 pb-12">
            <div className="space-y-4">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">System Protocols.</h2>
              <p className="font-body-lg text-secondary text-xl max-w-xl">The three-stage neural architecture for interview dominance.</p>
            </div>
            <div className="text-[10px] font-bold text-outline uppercase tracking-[0.3em]">Operational Readiness 100%</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FileText, step: 'Protocol 01', title: 'Data Extraction', desc: 'Upload your experience matrix. Our neural engine audits your skills and career trajectory to map relevant challenge vectors.', color: 'primary' },
              { icon: Target, step: 'Protocol 02', title: 'Tactical Simulation', desc: 'Engage in company-specific chambers. Our adaptive AI simulates high-rigor interviews with real-time logic shifting.', color: 'secondary' },
              { icon: BarChart3, step: 'Protocol 03', title: 'Performance Intel', desc: 'Receive high-fidelity performance metrics, linguistic auditing, and actionable strategic insights after each mission.', color: 'primary' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="glass rounded-[40px] p-10 flex flex-col group hover:bg-white/40 transition-all duration-500 shadow-premium">
                  <div className={`w-16 h-16 rounded-[22px] bg-${card.color}/10 border border-${card.color}/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className={`text-${card.color}`} />
                  </div>
                  <span className="font-label-bold text-[10px] text-outline uppercase tracking-[0.3em] mb-3">{card.step}</span>
                  <h3 className="font-display text-2xl font-bold text-primary mb-6 tracking-tight">{card.title}</h3>
                  <p className="font-body-md text-secondary leading-relaxed text-lg italic opacity-80 group-hover:opacity-100 transition-opacity">"{card.desc}"</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Intelligence Matrix */}
        <section className="w-full bg-surface-container-low/30 border-y border-outline-variant/20 py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24 space-y-6">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight italic">Built for <span className="text-secondary">Elite Result.</span></h2>
              <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {[
                { icon: Layers, title: 'Multi-AI Neural Stack', desc: 'Gemini, Groq, and Cerebras orchestrated in a fail-safe cluster for zero-latency intelligence retrieval.' },
                { icon: Globe, title: 'Resume-Aware Vectors', desc: 'Deep-mapping of your career artifacts to craft contextually precise challenges unique to your trajectory.' },
                { icon: Activity, title: 'Real-Time Neural Scoring', desc: 'Instant linguistic and technical evaluation across 12 distinct performance metrics with sub-second feedback.' },
                { icon: Cpu, title: 'Adaptive Rigor Logic', desc: 'Dynamic difficulty scaling from Baseline to Bar-Raiser intensity, tailored to your evolving performance data.' },
              ].map((feature) => (
                <div key={feature.title} className="glass rounded-[32px] p-8 flex gap-8 items-start group hover:shadow-premium transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:rotate-6 transition-transform">
                    <feature.icon size={24} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold text-primary tracking-tight">{feature.title}</h3>
                    <p className="font-body-md text-secondary leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Strategic Close Section */}
        <section className="relative w-full py-40 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-primary -z-10" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay -z-10" />
          
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            <h2 className="font-display text-5xl md:text-7xl font-bold text-on-primary tracking-tight">Begin Preparation Protocol.</h2>
            <p className="font-body-lg text-surface-dim text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed opacity-80">
              Step into the quiet logic of structured career dominance. Initialize your neural simulation now.
            </p>
            <div className="flex justify-center pt-8">
              <Link
                to="/signup"
                className="bg-surface-container-lowest text-primary font-display text-xl font-bold px-16 py-6 rounded-[30px] hover:scale-105 transition-all shadow-2xl flex items-center gap-4"
              >
                Get Started Free <ArrowRight size={24} />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 text-on-primary/40 font-label-bold text-[10px] uppercase tracking-[0.4em] pt-12">
              <ShieldCheck size={16} />
              Secured Neural Gateway
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
