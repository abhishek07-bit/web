import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Zap, FileText, Target } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="w-full max-w-max-width mx-auto px-lg md:px-container-padding py-section flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-xs px-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full mb-lg">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">AI-Powered Interview Prep</span>
          </div>
          <h1 className="font-display text-display text-primary max-w-3xl mb-lg leading-tight">
            Master the Interview with Quiet Intelligence.
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl mb-xl">
            A disciplined approach to interview preparation. Elevate your narrative through adaptive logic, removing noise to focus purely on performance.
          </p>
          <div className="flex gap-md flex-wrap justify-center">
            <Link
              to="/signup"
              className="bg-primary text-on-primary font-label-bold text-label-bold px-xl py-md rounded-full hover:opacity-90 transition-all duration-300 flex items-center gap-sm"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="bg-surface-container-lowest text-primary border border-outline-variant font-label-bold text-label-bold px-xl py-md rounded-full hover:bg-surface-container-low transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full max-w-max-width mx-auto px-lg md:px-container-padding py-[80px]">
          <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-xl">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {[
              { icon: FileText, step: '01', title: 'Upload Resume', desc: 'Upload your resume and the AI extracts your skills, experience, and strengths to generate targeted questions.' },
              { icon: Target, step: '02', title: 'Practice', desc: 'Choose your target role and company. The AI simulates a realistic interview with adaptive difficulty.' },
              { icon: Zap, step: '03', title: 'Get Feedback', desc: 'Receive detailed scoring, strength analysis, and actionable improvement areas after each session.' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-pebble flex flex-col group hover:border-primary/40 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center mb-lg">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-sm">Step {card.step}</span>
                  <h3 className="font-headline-md text-headline-md text-primary mb-md">{card.title}</h3>
                  <p className="font-body-md text-body-md text-secondary flex-grow">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="w-full bg-surface py-section">
          <div className="max-w-max-width mx-auto px-lg md:px-container-padding">
            <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-xl">Built for Real Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-4xl mx-auto">
              {[
                { title: 'Multi-AI Fallback Stack', desc: 'Gemini, Groq, OpenRouter, and Cerebras working together — if one provider fails, another picks up seamlessly.' },
                { title: 'Resume-Aware Questions', desc: 'AI reads your resume and crafts questions specific to your experience, skills, and career trajectory.' },
                { title: 'Real-Time Scoring', desc: 'Each answer is evaluated on clarity, depth, structure, and relevance with actionable feedback.' },
                { title: 'Adaptive Difficulty', desc: 'Five rigor levels from Baseline to Bar Raiser — the AI adjusts to challenge you appropriately.' },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-md items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <div>
                    <h3 className="font-label-bold text-label-bold text-primary mb-xs">{feature.title}</h3>
                    <p className="font-body-md text-body-md text-secondary">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full bg-primary text-on-primary py-section px-lg md:px-container-padding text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="font-display text-display mb-lg">Begin Preparation.</h2>
            <p className="font-body-lg text-body-lg text-surface-dim mb-xl max-w-xl">
              Step into the quiet logic of structured interview prep. Elevate your communication.
            </p>
            <Link
              to="/signup"
              className="bg-surface-container-lowest text-primary font-label-bold text-label-bold px-xl py-lg rounded-full hover:bg-surface-container-low transition-colors duration-300 flex items-center gap-sm"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
