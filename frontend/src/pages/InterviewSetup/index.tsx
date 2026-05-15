import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, SlidersHorizontal, Search, Building, BarChart3, Gavel, Handshake, Loader2, Target, Zap, ChevronRight, Activity, ShieldAlert } from 'lucide-react';
import { useInterviewStore } from '../../store/interviewStore';
import { interviewAPI } from '../../api/client';
import NeuralLoader from '../../components/common/NeuralLoader';

const POPULAR_ROLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'Frontend Developer', 'Backend Engineer',
  'Fullstack Developer', 'System Architect', 'UI/UX Designer', 'DevOps Engineer', 'AI Researcher'
];

const POPULAR_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Netflix', 'Microsoft',
  'Apple', 'Stripe', 'OpenAI', 'Tesla', 'Airbnb'
];

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const setupSession = useInterviewStore((s) => s.setupSession);
  const setQuestions = useInterviewStore((s) => s.setQuestions);
  
  const [selectedRole, setSelectedRole] = useState('Senior Software Engineer');
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedPersona, setSelectedPersona] = useState('analytical');
  const [rigorLevel, setRigorLevel] = useState(4);
  const [loading, setLoading] = useState(false);

  const rigorLabels = ['Baseline', 'Standard', 'Advanced', 'Expert', 'Bar Raiser'];

  const handleStart = async () => {
    if (!selectedRole || !selectedCompany) return;
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

        const qRes = await interviewAPI.getQuestions(data.sessionId);
        setQuestions(qRes.data);
        navigate('/interview/session');
      }
    } catch (error) {
      console.error('Failed to setup interview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NeuralLoader message="Calibrating Simulation Chamber..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in">
      
      {/* Simulation Header */}
      <header className="pt-12 mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-[0.2em]">
          <Activity size={14} />
          Simulation Core
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-primary tracking-tight">
          Configure <span className="text-secondary">Chamber.</span>
        </h1>
        <p className="font-body-lg text-secondary text-xl max-w-2xl leading-relaxed">
          Calibrate your target vectors and adjust the neural simulation intensity for maximum impact.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Configuration Matrix */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Target Parameters */}
          <div className="glass rounded-[40px] p-10 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <h3 className="font-label-bold text-xs text-secondary uppercase tracking-widest mb-10 flex items-center gap-2">
              <Target size={16} /> Target Parameters
            </h3>

            <div className="space-y-12">
              {/* Position Vector */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-bold text-xs text-primary uppercase tracking-widest pl-1">Target Position</label>
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      className="w-full glass border border-outline-variant/30 rounded-2xl py-5 pl-14 pr-6 font-display font-bold text-lg text-primary focus:border-primary/40 outline-none transition-all shadow-sm"
                      placeholder="e.g. Principal Architect"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-4 py-2 rounded-full text-[10px] font-label-bold transition-all border uppercase tracking-widest ${
                        selectedRole === role 
                          ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                          : 'bg-surface-container-lowest text-secondary border-outline-variant/40 hover:border-primary/40'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Vector */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-bold text-xs text-primary uppercase tracking-widest pl-1">Target Organization</label>
                  <div className="relative group">
                    <Building className="absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      className="w-full glass border border-outline-variant/30 rounded-2xl py-5 pl-14 pr-6 font-display font-bold text-lg text-primary focus:border-primary/40 outline-none transition-all shadow-sm"
                      placeholder="e.g. OpenAI"
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_COMPANIES.map(company => (
                    <button
                      key={company}
                      onClick={() => setSelectedCompany(company)}
                      className={`px-4 py-2 rounded-full text-[10px] font-label-bold transition-all border uppercase tracking-widest ${
                        selectedCompany === company 
                          ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                          : 'bg-surface-container-lowest text-secondary border-outline-variant/40 hover:border-primary/40'
                      }`}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Persona & Intensity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Interviewer Persona */}
            <div className="glass rounded-[40px] p-10 shadow-premium">
              <h3 className="font-label-bold text-xs text-secondary uppercase tracking-widest mb-8 flex items-center gap-2">
                <Brain size={16} /> Neural Persona
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'analytical', icon: BarChart3, label: 'Analytical', desc: 'Frameworks & Logic' },
                  { id: 'challenging', icon: Gavel, label: 'Ruthless', desc: 'High Pressure Stress Test' },
                  { id: 'conversational', icon: Handshake, label: 'Collaborative', desc: 'Behavioral & Culture' },
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPersona === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersona(p.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-[24px] text-left transition-all duration-300 border ${
                        isSelected 
                          ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                          : 'bg-surface-container-lowest text-primary border-outline-variant/30 hover:border-primary/30'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-primary/5'}`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm leading-none mb-1">{p.label}</h3>
                        <p className={`text-[10px] font-medium ${isSelected ? 'text-white/70' : 'text-secondary'}`}>{p.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rigor Intensity */}
            <div className="glass rounded-[40px] p-10 shadow-premium">
              <h3 className="font-label-bold text-xs text-secondary uppercase tracking-widest mb-8 flex items-center gap-2">
                <SlidersHorizontal size={16} /> Rigor Intensity
              </h3>
              <div className="space-y-10 h-full flex flex-col justify-center pb-10">
                <div className="relative pt-6">
                  <input
                    type="range"
                    max={5}
                    min={1}
                    value={rigorLevel}
                    onChange={(e) => setRigorLevel(Number(e.target.value))}
                    className="w-full h-1.5 bg-outline-variant/30 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="absolute -top-4 left-0 w-full flex justify-between">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <div key={v} className={`w-1 h-3 rounded-full ${rigorLevel >= v ? 'bg-primary' : 'bg-outline-variant/30'}`} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {rigorLabels.map((label, i) => (
                    <div key={label} className="text-center">
                      <span className={`text-[8px] font-bold uppercase tracking-tighter block ${rigorLevel === i + 1 ? 'text-primary scale-110' : 'text-outline/50'} transition-all`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Briefing Overlay */}
        <div className="lg:col-span-4 lg:sticky lg:top-12">
          <div className="glass rounded-[48px] p-10 border-2 border-primary/20 shadow-premium relative overflow-hidden bg-white/40">
            <div className="absolute right-0 top-0 w-40 h-40 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
            
            <div className="flex items-center justify-between mb-12 relative z-10">
              <h3 className="font-display text-2xl font-bold text-primary italic">Mission Briefing</h3>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Zap size={22} />
              </div>
            </div>
            
            <div className="space-y-8 mb-16 relative z-10">
              {[
                { label: 'Role Vector', val: selectedRole },
                { label: 'Target Sector', val: selectedCompany },
                { label: 'Neural Mindset', val: selectedPersona.toUpperCase() },
                { label: 'Intensity Index', val: rigorLabels[rigorLevel-1] }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-outline-variant/20 pb-4">
                  <span className="text-outline font-label-bold text-[9px] uppercase tracking-[0.2em]">{item.label}</span>
                  <span className="text-primary font-display font-bold text-base">{item.val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-primary text-on-primary font-display text-lg font-bold py-6 rounded-[30px] shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 relative z-10 group"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ShieldAlert size={24} className="group-hover:rotate-12 transition-transform" />}
              {loading ? 'Initializing Neural Link...' : 'Engage Simulation'}
            </button>
            
            <div className="mt-8 text-center relative z-10">
              <div className="inline-flex items-center gap-2 text-outline font-label-bold text-[9px] uppercase tracking-[0.3em]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Neural Network Online
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
