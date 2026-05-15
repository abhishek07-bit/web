import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, Code, Globe, Clock, Play, Target, Search, Loader2, Zap, AlertCircle, Shield, ChevronRight, Activity } from 'lucide-react';
import { companyAPI } from '../../api/client';

const iconMap: Record<string, any> = {
  Brain,
  Code,
  Globe,
  Target,
  Zap
};

interface PrepScenario {
  title: string;
  category: string;
  time: string;
  desc: string;
}

interface PrepPhilosophy {
  title: string;
  desc: string;
  icon: string;
}

interface CompanyPrepData {
  company: string;
  description: string;
  corePhilosophy: PrepPhilosophy[];
  targetedScenarios: PrepScenario[];
  isFallback?: boolean;
}

export default function CompanyPrepPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompany = searchParams.get('company') || 'Google';
  
  const [company, setCompany] = useState(initialCompany);
  const [searchInput, setSearchInput] = useState(initialCompany);
  const [data, setData] = useState<CompanyPrepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed && trimmed !== company) {
        setCompany(trimmed);
        setSearchParams({ company: trimmed });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, company, setSearchParams]);

  useEffect(() => {
    async function fetchData() {
      if (!company) return;
      setLoading(true);
      setError('');
      try {
        const response = await companyAPI.getPrep(company);
        setData(response.data as CompanyPrepData);
      } catch (err: unknown) {
        setError('Strategic intelligence retrieval failed.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [company]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCompany(searchInput.trim());
      setSearchParams({ company: searchInput.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-fade-in">
      
      {/* Search Header */}
      <header className="pt-12 mb-16 flex flex-col md:flex-row justify-between md:items-end gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-[0.2em]">
            <Activity size={14} />
            Strategic Dossier
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-primary tracking-tight">
            Target <span className="text-secondary">Intel.</span>
          </h1>
          <p className="font-body-lg text-secondary text-xl max-w-2xl leading-relaxed">
            Neural mapping of company-specific interview vectors and cultural engineering benchmarks.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-[400px] group">
          <div className="absolute inset-0 bg-primary/5 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative glass rounded-[24px] border border-outline-variant/30 p-2 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Target Company..." 
                className="w-full bg-transparent pl-12 pr-4 py-3 font-display font-bold text-primary placeholder:text-outline/50 outline-none"
              />
            </div>
            <button type="submit" disabled={loading || !searchInput.trim() || searchInput.trim() === company} className="bg-primary text-on-primary font-display font-bold px-8 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center">
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Map'}
            </button>
          </div>
        </form>
      </header>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-[30px] bg-primary/10 flex items-center justify-center mb-8 shadow-inner animate-pulse">
            <Activity className="text-primary animate-spin" size={32} />
          </div>
          <p className="font-display text-2xl text-secondary text-center">Infiltrating {company} databases...</p>
          <p className="text-[10px] text-outline uppercase tracking-[0.3em] font-bold mt-2">Neural Extraction in progress</p>
        </div>
      ) : error ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <div className="p-6 rounded-[30px] bg-red-50 border border-red-100 text-red-600 font-display font-bold text-lg">
            {error}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-16 animate-slide-up">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-outline-variant/30">
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-3">
                  <Shield size={16} className="text-primary" />
                  <span className="font-label-bold text-xs text-primary uppercase tracking-widest">{data.company} Sector Verified</span>
                </div>
                {data.isFallback && (
                  <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-3">
                    <AlertCircle size={16} className="text-amber-600" />
                    <span className="font-label-bold text-xs text-amber-600 uppercase tracking-widest">Cached Intel</span>
                  </div>
                )}
              </div>
              <h2 className="font-display text-4xl font-bold text-primary italic">"The {data.company} Protocol"</h2>
              <p className="font-body-lg text-secondary text-xl leading-relaxed">
                {data.description}
              </p>
            </div>
          </div>

          {/* Core Philosophy: Premium Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.corePhilosophy?.map((card, idx) => {
              const Icon = iconMap[card.icon] || Brain;
              return (
                <div key={idx} className="glass rounded-[32px] p-10 flex flex-col justify-between group hover:bg-white/40 transition-all duration-500 shadow-premium">
                  <div>
                    <div className="w-14 h-14 rounded-[20px] bg-primary/5 border border-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Icon size={28} className="text-primary" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-primary mb-4 tracking-tight">{card.title}</h3>
                    <p className="font-body-md text-secondary leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-end">
                    <ChevronRight size={20} className="text-outline group-hover:text-primary group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              );
            })}
          </section>

          {/* Question Bank: Elite List */}
          <section className="space-y-10">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-4xl font-bold text-primary">Strategic Scenarios</h2>
              <div className="text-[10px] font-bold text-outline uppercase tracking-widest bg-surface-container px-3 py-1 rounded-full">
                {data.targetedScenarios?.length} Active Vectors
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {data.targetedScenarios?.map((question, idx) => (
                <div key={idx} className="glass rounded-[28px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-premium group transition-all duration-300">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-primary/5 rounded-full font-label-bold text-[10px] text-primary uppercase tracking-widest border border-primary/10">
                        {question.category}
                      </span>
                      <div className="flex items-center gap-2 text-outline font-label-bold text-[10px] uppercase tracking-widest">
                        <Clock size={14} /> {question.time} Limit
                      </div>
                    </div>
                    <h4 className="font-display text-xl font-bold text-primary">{question.title}</h4>
                    <p className="font-body-md text-secondary max-w-3xl italic">"{question.desc}"</p>
                  </div>
                  <button className="shrink-0 w-16 h-16 rounded-[24px] bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all group-hover:shadow-lg shadow-primary/20">
                    <Play size={24} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
