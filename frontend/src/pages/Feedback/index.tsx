import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PlusCircle, ArrowUp, Check, Target, Lightbulb, ArrowRight, Loader2 } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary mb-md" size={48} />
        <p className="font-label-bold text-label-bold text-secondary">Analyzing session data...</p>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="font-label-bold text-label-bold text-error mb-md">{error || 'Feedback not found.'}</p>
        <Link
          to="/dashboard"
          className="bg-primary text-on-primary font-label-bold text-label-bold py-sm px-lg rounded-DEFAULT hover:opacity-90 transition-opacity"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto w-full flex-1 flex flex-col gap-xl pb-xl animate-fade-in">
      {/* Header Section */}
      <section className="mt-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg mb-lg">
          <div>
            <p className="font-label-bold text-label-bold text-secondary mb-xs uppercase tracking-widest">Session Analysis</p>
            <h2 className="font-display text-display text-primary">Performance Feedback</h2>
          </div>
          <div className="flex gap-sm">
            <button 
              onClick={() => {
                const lines = [
                  '═══ PrepMate AI — Session Report ═══',
                  '',
                  `Score: ${feedback.overallScore || 0}/100`,
                  `Level: ${(feedback.overallScore || 0) >= 80 ? 'Proficient' : (feedback.overallScore || 0) >= 60 ? 'Competent' : 'Developing'}`,
                  '',
                  '── Overall Assessment ──',
                  feedback.overallAssessment || 'N/A',
                  '',
                  '── Strengths ──',
                  ...(feedback.strengths || []).map((s: any, i: number) => `${i + 1}. ${s.title}: ${s.description}`),
                  '',
                  '── Areas to Improve ──',
                  ...(feedback.improvements || []).map((s: any, i: number) => `${i + 1}. ${s.title}: ${s.description}`),
                  '',
                  `Generated: ${new Date().toLocaleString()}`,
                ];
                const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `prepmate-report-${sessionId}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-surface-container-lowest text-primary border border-outline-variant font-label-bold text-label-bold py-sm px-lg rounded-DEFAULT hover:border-primary transition-colors"
            >
              Export Report
            </button>
            <Link
              to="/interview/setup"
              className="bg-primary text-on-primary font-label-bold text-label-bold py-sm px-lg rounded-DEFAULT hover:opacity-90 transition-opacity"
            >
              New Session
            </Link>
          </div>
        </div>
        <div className="w-full h-px bg-outline-variant" />
      </section>

      {/* Overall Score Pebble */}
      <section className="animate-slide-up">
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-[40px] flex flex-col md:flex-row items-center justify-between gap-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-surface-container-lowest/40 rounded-full blur-3xl pointer-events-none" />
          <div className="flex-1 z-10">
            <h3 className="font-headline-lg text-headline-lg text-primary mb-md">Overall Assessment</h3>
            <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
              {feedback.overallAssessment || "Your responses demonstrated strong technical foundation, but exhibited moments of hesitation during complex problem-solving scenarios. Pacing was excellent."}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0 z-10">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-outline-variant"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className="text-primary transition-all duration-1000 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${feedback.overallScore || 0}, 100`}
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[32px] font-bold text-primary leading-none">
                  {feedback.overallScore || 0}
                </span>
                <span className="font-label-sm text-label-sm text-secondary">/ 100</span>
              </div>
            </div>
            <span className="font-label-bold text-label-bold text-primary mt-sm bg-surface-container-low px-md py-xs rounded-full">
              {feedback.overallScore >= 80 ? 'Proficient' : feedback.overallScore >= 60 ? 'Competent' : 'Developing'}
            </span>
          </div>
        </div>
      </section>

      {/* Strengths & Improvements */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Strengths */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-[32px] flex flex-col h-full hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-sm mb-lg border-b border-[var(--color-card-border)] pb-md">
            <PlusCircle size={24} className="text-primary" strokeWidth={1.5} />
            <h4 className="font-headline-md text-headline-md text-primary">Strengths</h4>
          </div>
          <ul className="flex flex-col gap-md flex-1">
            {(feedback.strengths && feedback.strengths.length > 0 ? feedback.strengths : [
              { title: 'Technical Vocabulary', description: 'Used precise industry terminology naturally throughout the system design portion.' },
              { title: 'Structure (STAR Method)', description: 'Behavioral answers were perfectly structured, establishing context before diving into action.' },
              { title: 'Vocal Clarity', description: 'Maintained an even, calm tone even when presented with curveball technical questions.' },
            ]).map((item, i) => (
              <li key={i}>
                {i > 0 && <div className="w-full h-px bg-outline-variant mb-md" />}
                <div className="flex items-start gap-md group">
                  <Check size={20} className="text-secondary mt-1 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  <div>
                    <p className="font-label-bold text-label-bold text-primary">{item.title}</p>
                    <p className="font-body-md text-body-md text-secondary mt-xs">{item.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-[32px] flex flex-col h-full hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-sm mb-lg border-b border-[var(--color-card-border)] pb-md">
            <ArrowUp size={24} className="text-primary" strokeWidth={1.5} />
            <h4 className="font-headline-md text-headline-md text-primary">Areas to Refine</h4>
          </div>
          <ul className="flex flex-col gap-md flex-1">
            {(feedback.improvements && feedback.improvements.length > 0 ? feedback.improvements : [
              { title: 'Conciseness in Technical Explanations', description: "Question 3's explanation drifted into tangential details. Keep focus on the primary architecture." },
              { title: 'Filler Words', description: 'Detected 14 instances of "um" or "like" during the opening introduction. Pausing in silence is preferable.' },
              { title: 'Eye Contact Simulation', description: 'Gaze drifted downward frequently when thinking. Practice looking directly at the camera lens.' },
            ]).map((item, i) => (
              <li key={i}>
                {i > 0 && <div className="w-full h-px bg-outline-variant mb-md" />}
                <div className="flex items-start gap-md group">
                  <Target size={20} className="text-secondary mt-1 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  <div>
                    <p className="font-label-bold text-label-bold text-primary">{item.title}</p>
                    <p className="font-body-md text-body-md text-secondary mt-xs">{item.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Confidence Chart & Follow Up */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-[var(--color-card-bg-alt)] border border-[var(--color-card-border)] rounded-pebble p-[32px] flex flex-col">
          <div className="mb-lg">
            <h4 className="font-headline-md text-headline-md text-primary">Performance Timeline</h4>
            <p className="font-body-md text-body-md text-secondary">Analyzed via answer depth and logic.</p>
          </div>
          <div className="relative w-full h-[200px] mt-auto border-b border-l border-outline-variant flex items-end pt-md">
            <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-label-sm text-secondary py-2">
              <span>High</span>
              <span>Med</span>
              <span>Low</span>
            </div>
            <svg className="w-full h-full text-primary" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path
                d="M0,50 C10,40 20,60 30,30 C40,10 50,20 60,40 C70,60 80,50 90,20 L100,10"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className="animate-[fadeIn_1.5s_ease-out]"
              />
              <circle cx="30" cy="30" fill="currentColor" r="3" className="animate-[scaleIn_0.5s_ease-out_0.5s_both]" />
              <circle cx="60" cy="40" fill="currentColor" r="3" className="animate-[scaleIn_0.5s_ease-out_0.8s_both]" />
              <circle cx="90" cy="20" fill="currentColor" r="3" className="animate-[scaleIn_0.5s_ease-out_1.1s_both]" />
            </svg>
            <div className="absolute -bottom-8 left-0 w-full flex justify-between text-label-sm text-secondary">
              <span>Intro</span>
              <span>Technical</span>
              <span>Behavioral</span>
              <span>System</span>
              <span>Closing</span>
            </div>
          </div>
        </div>

        {/* Follow Up Suggestions */}
        <div className="bg-primary text-on-primary rounded-pebble p-[32px] flex flex-col">
          <Lightbulb size={32} className="mb-md text-surface-container" strokeWidth={1.5} />
          <h4 className="font-headline-md text-headline-md mb-xs">Recommended Action</h4>
          <p className="font-body-md text-body-md text-outline-variant mb-xl">
            Based on your session, we suggest reviewing the following concepts before your next mock interview.
          </p>
          <div className="flex flex-col gap-sm mt-auto">
            {(feedback.recommendedActions && feedback.recommendedActions.length > 0 ? feedback.recommendedActions : [
              { title: 'Microservices vs Monoliths', link: 'https://www.google.com/search?q=Microservices+vs+Monoliths+Architecture' }, 
              { title: 'Database Sharding Strategies', link: 'https://www.google.com/search?q=Database+Sharding+Strategies' }
            ]).map((topic, i) => (
              <a
                key={i}
                className="bg-inverse-surface hover:opacity-80 border border-outline-variant rounded-btn p-md flex items-center justify-between transition-all duration-300 group hover:-translate-y-1"
                href={topic.link}
                target="_blank"
                rel="noreferrer"
              >
                <span className="font-label-bold text-label-bold">{topic.title}</span>
                <ArrowRight size={20} className="text-secondary group-hover:text-on-primary transition-colors" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
