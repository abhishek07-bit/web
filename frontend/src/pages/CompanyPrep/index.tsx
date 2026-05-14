import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, Code, Globe, Clock, Play, ArrowRight, Target, Search, Loader2, Zap } from 'lucide-react';
import { companyAPI } from '../../api/client';

const iconMap: Record<string, any> = {
  Brain,
  Code,
  Globe,
  Target,
  Zap
};

export default function CompanyPrepPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompany = searchParams.get('company') || 'Google';
  
  const [company, setCompany] = useState(initialCompany);
  const [searchInput, setSearchInput] = useState(initialCompany);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!company) return;
      setLoading(true);
      setError('');
      try {
        const response = await companyAPI.getPrep(company);
        setData(response.data);
      } catch (err) {
        console.error('Failed to load company prep:', err);
        setError('Failed to load preparation data. Please try again.');
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
    <div className="max-w-max-width mx-auto w-full flex-1 flex flex-col px-container-padding animate-fade-in pb-xl">
      {/* Search Header */}
      <header className="mb-[60px] mt-[40px] flex flex-col md:flex-row justify-between md:items-end gap-lg border-b border-outline-variant pb-lg">
        <div>
          <h1 className="font-display text-display text-primary mb-xs">Company Prep</h1>
          <p className="font-body-md text-body-md text-secondary max-w-xl">
            Enter a company name to generate a tailored interview preparation guide, focusing on their unique technical and behavioral expectations.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-sm w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} strokeWidth={1.5} />
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. Amazon, Netflix..." 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-full pl-10 pr-4 py-2 font-body-md text-body-md text-on-background focus:border-primary focus:ring-0 outline-none transition-colors"
            />
          </div>
          <button type="submit" disabled={loading || !searchInput.trim()} className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </form>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="animate-spin text-primary mb-md" size={48} />
          <p className="font-label-bold text-label-bold text-secondary">Analyzing {company}'s interview process...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh]">
          <p className="font-label-bold text-label-bold text-error bg-error-container px-6 py-3 rounded-full">{error}</p>
        </div>
      ) : data ? (
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-sm px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-lg">
            <Target size={16} className="text-primary" strokeWidth={1.5} />
            <span className="font-label-bold text-label-bold text-primary uppercase tracking-wider text-[11px]">{data.company} Path Active</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-md">{data.company} Preparation Path</h2>
          <p className="font-body-lg text-body-lg text-secondary max-w-3xl mb-xl">
            {data.description}
          </p>

          {/* Bento Grid: Core Philosophy */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-lg mb-[80px]">
            {data.corePhilosophy?.map((card: any, idx: number) => {
              const Icon = iconMap[card.icon] || Brain;
              return (
                <div key={idx} className="md:col-span-4 bg-surface-container-low border border-outline-variant rounded-pebble p-lg flex flex-col justify-between h-full group hover:border-primary transition-colors duration-300">
                  <div>
                    <div className="w-12 h-12 rounded-full border border-outline-variant bg-surface flex items-center justify-center mb-md">
                      <Icon size={24} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-sm">{card.title}</h3>
                    <p className="font-body-md text-body-md text-secondary">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Question Bank */}
          <section>
            <div className="flex items-end justify-between mb-lg">
              <h2 className="font-headline-lg text-headline-lg text-primary">Targeted Scenarios</h2>
            </div>
            <div className="flex flex-col gap-md">
              {data.targetedScenarios?.map((question: any, idx: number) => (
                <div key={idx} className="bg-surface border border-outline-variant rounded-pebble p-lg flex flex-col md:flex-row md:items-center justify-between gap-lg hover:border-primary transition-all duration-200 cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-sm">
                      <span className="px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-primary border border-outline-variant">
                        {question.category}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary flex items-center gap-xs">
                        <Clock size={14} strokeWidth={1.5} /> {question.time}
                      </span>
                    </div>
                    <h4 className="font-headline-md text-headline-md text-primary mb-xs">{question.title}</h4>
                    <p className="font-body-md text-body-md text-secondary line-clamp-1">{question.desc}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-md">
                    <div className="h-10 w-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors">
                      <Play size={20} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
