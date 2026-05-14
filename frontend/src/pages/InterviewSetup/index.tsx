import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Brain, SlidersHorizontal, Search, Building, Play, BarChart3, Gavel, Handshake, Loader2 } from 'lucide-react';
import { useInterviewStore } from '../../store/interviewStore';
import { interviewAPI } from '../../api/client';

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const setupSession = useInterviewStore((s) => s.setupSession);
  const setQuestions = useInterviewStore((s) => s.setQuestions);
  
  const [selectedRole, setSelectedRole] = useState('Product Manager');
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedPersona, setSelectedPersona] = useState('analytical');
  const [rigorLevel, setRigorLevel] = useState(4);
  const [loading, setLoading] = useState(false);

  const rigorLabels = ['Baseline', 'Standard', 'Advanced', 'Expert', 'Bar Raiser'];

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await interviewAPI.setup({
        role: selectedRole,
        company: selectedCompany,
        persona: selectedPersona,
        rigorLevel: rigorLevel,
      });

      if (data.sessionId) {
        setupSession({
          sessionId: data.sessionId,
          role: selectedRole,
          company: selectedCompany,
          persona: selectedPersona,
        });

        // Fetch initial questions
        const qRes = await interviewAPI.getQuestions(data.sessionId);
        setQuestions(qRes.data);
        
        navigate('/interview/session');
      }
    } catch (error) {
      console.error('Failed to setup interview:', error);
      // Fallback for demo if backend is down
      setupSession({
        sessionId: `mock-${Date.now()}`,
        role: selectedRole,
        company: selectedCompany,
        persona: selectedPersona,
      });
      navigate('/interview/session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-max-width mx-auto px-container-padding py-section">
      <div className="mb-xl max-w-2xl">
        <h1 className="font-display text-display text-primary mb-md">Configure Chamber</h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Define the parameters of your upcoming mock interview. Precision in setup leads to accuracy in performance analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        {/* Left Column: Settings Cards */}
        <div className="lg:col-span-8 flex flex-col gap-lg">
          {/* Role & Company Pebble */}
          <section className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-pebble">
            <div className="flex items-center gap-sm mb-lg">
              <Briefcase size={24} className="text-primary" strokeWidth={1.5} />
              <h2 className="font-headline-md text-headline-md text-primary">Target Role</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Role Input */}
              <div>
                <label className="block font-label-bold text-label-bold text-primary mb-sm">Position</label>
                <div className="relative">
                  <Search size={24} className="absolute left-md top-1/2 -translate-y-1/2 text-secondary" strokeWidth={1.5} />
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-input py-md pl-xl pr-md font-body-md text-body-md text-on-background focus:border-primary focus:ring-0 transition-colors"
                    placeholder="e.g. Senior Product Manager"
                    type="text"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-sm mt-md">
                  {['Software Engineer', 'Product Manager', 'Data Scientist'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={
                        selectedRole === role
                          ? 'bg-primary text-on-primary rounded-full px-md py-sm font-label-sm text-label-sm transition-colors'
                          : 'bg-surface-container-low border border-outline-variant rounded-full px-md py-sm font-label-sm text-label-sm text-primary hover:bg-surface-container-highest transition-colors'
                      }
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              {/* Company Input */}
              <div>
                <label className="block font-label-bold text-label-bold text-primary mb-sm">Target Company</label>
                <div className="relative">
                  <Building size={24} className="absolute left-md top-1/2 -translate-y-1/2 text-secondary" strokeWidth={1.5} />
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-input py-md pl-xl pr-md font-body-md text-body-md text-on-background focus:border-primary focus:ring-0 transition-colors"
                    placeholder="e.g. Google, Stripe"
                    type="text"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-sm mt-md">
                  {['Google', 'Amazon', 'Meta'].map((company) => (
                    <button
                      key={company}
                      onClick={() => setSelectedCompany(company)}
                      className={
                        selectedCompany === company
                          ? 'bg-primary text-on-primary rounded-full px-md py-sm font-label-sm text-label-sm transition-colors'
                          : 'bg-surface-container-low border border-outline-variant rounded-full px-md py-sm font-label-sm text-label-sm text-primary hover:bg-surface-container-highest transition-colors'
                      }
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Interviewer Persona Pebble */}
          <section className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-pebble">
            <div className="flex items-center gap-sm mb-lg">
              <Brain size={24} className="text-primary" strokeWidth={1.5} />
              <h2 className="font-headline-md text-headline-md text-primary">Interviewer Persona</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {[
                { id: 'analytical', icon: BarChart3, label: 'Analytical', desc: 'Focuses deeply on frameworks, metrics, and logical deduction.' },
                { id: 'challenging', icon: Gavel, label: 'Challenging', desc: 'Frequently interrupts, questions assumptions, high pressure.' },
                { id: 'conversational', icon: Handshake, label: 'Conversational', desc: 'Warm, encouraging, focuses on behavioral fit and collaboration.' },
              ].map((persona) => {
                const Icon = persona.icon;
                const isSelected = selectedPersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`bg-surface-container-lowest border ${
                      isSelected ? 'border-primary ring-2 ring-primary' : 'border-outline-variant hover:border-outline'
                    } rounded-input p-lg text-left h-full transition-all`}
                  >
                    <Icon size={30} className="text-primary mb-sm" strokeWidth={1.5} />
                    <h3 className="font-label-bold text-label-bold text-primary mb-xs">{persona.label}</h3>
                    <p className="font-label-sm text-label-sm text-secondary">{persona.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Difficulty Slider Pebble */}
          <section className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-pebble">
            <div className="flex items-center gap-sm mb-lg">
              <SlidersHorizontal size={24} className="text-primary" strokeWidth={1.5} />
              <h2 className="font-headline-md text-headline-md text-primary">Rigor Level</h2>
            </div>
            <div className="px-sm py-md">
              <input
                className="w-full accent-primary"
                max={5}
                min={1}
                type="range"
                value={rigorLevel}
                onChange={(e) => setRigorLevel(Number(e.target.value))}
              />
              <div className="flex justify-between mt-md">
                {rigorLabels.map((label, i) => (
                  <span
                    key={label}
                    className={`font-label-sm text-label-sm ${
                      rigorLevel === i + 1 ? 'text-primary font-bold' : 'text-secondary'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Summary & CTA */}
        <div className="lg:col-span-4 sticky top-[100px]">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-pebble p-pebble">
            <h3 className="font-headline-md text-headline-md text-primary mb-xl border-b border-outline-variant pb-md">
              Session Overview
            </h3>
            <ul className="flex flex-col gap-md mb-xl">
              {[
                { label: 'Role', value: selectedRole },
                { label: 'Target', value: selectedCompany },
                { label: 'Persona', value: selectedPersona.charAt(0).toUpperCase() + selectedPersona.slice(1) },
                { label: 'Rigor', value: `${rigorLabels[rigorLevel - 1]} (L${rigorLevel})` },
                { label: 'Est. Duration', value: '45 Mins' },
              ].map((item) => (
                <li key={item.label} className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-secondary">{item.label}</span>
                  <span className="font-label-bold text-label-bold text-primary">{item.value}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-lg rounded-btn hover:bg-surface-tint disabled:opacity-50 transition-colors flex items-center justify-center gap-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Play size={20} strokeWidth={1.5} />
              )}
              {loading ? 'Initializing...' : 'Start Mock Interview'}
            </button>
            <p className="font-label-sm text-label-sm text-center text-secondary mt-md">
              Microphone access will be required on the next screen.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
