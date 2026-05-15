import { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Briefcase, Trash2, CheckCircle, Loader2, Volume2, VolumeX, BarChart3, Target, AlertTriangle, Shield, ChevronRight, ExternalLink, Link2, Zap, ShieldCheck, Target as TargetIcon } from 'lucide-react';
import { resumeAPI } from '../../api/client';
import { useResumeStore } from '../../store/resumeStore';

export default function ResumeUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    id, file, analysis, matchAnalysis, isUploading, isAnalyzing, isMatching,
    setResumeId, setFile, setParsedData, setAnalysis, setMatchAnalysis, setUploading, setAnalyzing, setMatching, clearResume 
  } = useResumeStore();
  
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzingStep, setAnalyzingStep] = useState<string | null>(null);

  // Web Speech API for TTS
  useEffect(() => {
    if (analysis?.voiceSummary) {
      speakSummary(analysis.voiceSummary);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [analysis]);

  const speakSummary = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Google US English') || v.lang.includes('en-GB'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (analysis?.voiceSummary) {
      speakSummary(analysis.voiceSummary);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum 5MB.');
      return;
    }
    if (!selectedFile.name.toLowerCase().match(/\.(pdf|docx)$/)) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }

    setError(null);
    setUploading(true);
    setFile({ name: selectedFile.name, size: selectedFile.size });
    setAnalysis(null);
    setMatchAnalysis(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const { data } = await resumeAPI.upload(selectedFile);
      setResumeId(data.id);
      setParsedData({
        skills: data.skills || [],
        experience: [],
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
      clearResume();
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!id) return;
    setAnalyzing(true);
    setError(null);
    setAnalyzingStep('Extracting structure...');
    
    const stepInterval = setInterval(() => {
      setAnalyzingStep(prev => 
        prev === 'Extracting structure...' ? 'ATS Audit...' : 
        prev === 'ATS Audit...' ? 'Evaluating Impact...' :
        'Finalizing Report...'
      );
    }, 2500);

    try {
      const { data } = await resumeAPI.analyze(id);
      clearInterval(stepInterval);
      setAnalyzingStep(null);
      setAnalysis(data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setAnalyzingStep(null);
      setError(err.response?.data?.detail || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMatch = async () => {
    if (!id || !jobDescription.trim()) return;
    setMatching(true);
    setError(null);
    try {
      const { data } = await resumeAPI.match(id, jobDescription);
      setMatchAnalysis(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Matching failed.');
    } finally {
      setMatching(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const handleRemove = () => {
    clearResume();
    setError(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-fade-in">
      
      {/* HUD Header */}
      <header className="pt-12 mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-[0.2em]">
          <BarChart3 size={14} />
          Strategic Intelligence
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-primary tracking-tight">
          Career <span className="text-secondary">Audit.</span>
        </h1>
        <p className="font-body-lg text-secondary text-xl max-w-2xl leading-relaxed">
          Ruthless AI-driven analysis of your resume architecture, impact metrics, and job-specific kill ratios.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Operations Panel */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Upload Matrix */}
          <div className="glass rounded-[32px] p-8 shadow-premium group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <h3 className="font-label-bold text-xs text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <Upload size={14} /> Document Entry
            </h3>

            {file && !isUploading ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-high border border-outline-variant/30">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-bold text-sm text-primary truncate">{file.name}</p>
                    <p className="text-[10px] text-secondary uppercase font-bold tracking-tighter">{(file.size / 1024 / 1024).toFixed(1)} MB • Verified</p>
                  </div>
                  <button onClick={handleRemove} className="text-outline hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                  {isAnalyzing ? (analyzingStep || 'Auditing...') : 'Start Deep Audit'}
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant/40 bg-surface-container-lowest hover:border-primary/50'
                }`}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <Loader2 size={40} className="text-primary animate-spin" />
                    <p className="font-label-bold text-xs text-primary uppercase tracking-widest">Uploading Neural Data...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-primary">Initiate Upload</h4>
                      <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mt-1">PDF, DOCX • MAX 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleInputChange} className="hidden" />
          </div>

          {/* Target Matrix */}
          <div className="glass rounded-[32px] p-8 shadow-premium">
            <h3 className="font-label-bold text-xs text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <TargetIcon size={14} /> Mission Parameters
            </h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the Job Description to calculate your 'Kill-Ratio' for this mission..."
              className="w-full h-48 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 font-body-sm text-sm text-primary placeholder:text-outline/50 focus:border-primary/40 outline-none transition-all resize-none custom-scrollbar"
            />
            <button
              onClick={handleMatch}
              disabled={!id || !jobDescription.trim() || isMatching}
              className="w-full mt-6 bg-surface-container-highest border border-outline-variant/40 text-primary font-display font-bold py-4 rounded-2xl hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 disabled:opacity-30"
            >
              {isMatching ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Calculate Kill-Ratio
            </button>
          </div>
          {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 font-label-bold text-[10px] text-center uppercase tracking-widest">{error}</div>}
        </section>

        {/* Intelligence Report Hub */}
        <section className="lg:col-span-8 space-y-8">
          
          {!analysis ? (
            <div className="py-32 text-center glass rounded-[40px] border-dashed border-outline-variant/30">
              <Shield size={48} className="mx-auto text-outline/30 mb-6" />
              <p className="font-display text-xl text-secondary">Neural profile pending upload.</p>
              <p className="text-[10px] text-outline uppercase tracking-[0.2em] mt-2 font-bold">Awaiting secure data entry</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              
              {/* Score Matrix */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'ATS Match', val: analysis.atsScore },
                  { label: 'Impact', val: analysis.impactScore },
                  { label: 'Brevity', val: analysis.brevityScore },
                  { label: 'LaTeX Structure', val: analysis.latexStructureScore }
                ].map((s, i) => (
                  <div key={i} className="glass rounded-[24px] p-6 text-center shadow-sm">
                    <p className="text-[9px] font-label-bold text-secondary uppercase tracking-[0.2em] mb-2">{s.label}</p>
                    <p className={`font-display text-3xl font-bold ${getScoreColor(s.val)}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Kill-Ratio HUD */}
              {matchAnalysis && (
                <div className="glass rounded-[40px] p-10 border-2 border-primary/20 relative overflow-hidden group shadow-premium animate-scale-in">
                  <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="text-center md:text-left space-y-2">
                      <div className="inline-flex items-center gap-2 text-red-500 font-label-bold text-[10px] uppercase tracking-[0.2em]">
                        <AlertTriangle size={14} /> Mission Threat Level
                      </div>
                      <h3 className="font-display text-3xl font-bold text-primary italic">"{matchAnalysis.killRatioVerdict}"</h3>
                    </div>
                    <div className="shrink-0 text-center">
                      <div className={`font-display text-6xl font-bold leading-none ${matchAnalysis.rejectionProbability >= 70 ? 'text-red-500' : 'text-amber-500'}`}>
                        {matchAnalysis.rejectionProbability}%
                      </div>
                      <p className="text-[10px] font-label-bold text-secondary uppercase tracking-widest mt-2">Kill-Ratio Probability</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Audit Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass rounded-[32px] p-8 border-red-500/10">
                  <h4 className="font-label-bold text-xs text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <AlertTriangle size={14} /> Critical Weaknesses
                  </h4>
                  <ul className="space-y-4">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-3 text-sm text-primary">
                        <span className="text-red-500 font-bold">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass rounded-[32px] p-8 border-green-500/10">
                  <h4 className="font-label-bold text-xs text-green-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CheckCircle size={14} /> Core Strengths
                  </h4>
                  <ul className="space-y-4">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-primary">
                        <span className="text-green-500 font-bold">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Assessment Card */}
              <div className="glass rounded-[40px] p-10 relative overflow-hidden shadow-premium">
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h4 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
                    <Sparkles size={24} className="text-primary" /> Ruthless Assessment
                  </h4>
                  <button onClick={toggleSpeech} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSpeaking ? 'bg-primary text-on-primary animate-pulse' : 'bg-surface-container-high text-secondary hover:text-primary'}`}>
                    {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
                <p className="font-body-lg text-secondary text-lg leading-relaxed relative z-10 italic">
                  "{analysis.overallSummary}"
                </p>
              </div>

              {/* Project Intelligence Table */}
              <div className="glass rounded-[40px] p-10 shadow-premium overflow-hidden">
                <h4 className="font-display text-2xl font-bold text-primary mb-8 flex items-center gap-2">
                  <Briefcase size={24} className="text-primary" /> Project Intelligence Table
                </h4>
                <div className="overflow-x-auto -mx-10 px-10">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-[10px] uppercase font-bold tracking-widest text-secondary">
                        <th className="pb-4 pr-6">Objective & Impact</th>
                        <th className="pb-4 pr-6">Stack</th>
                        <th className="pb-4">Artifacts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {analysis.projects?.map((p, i) => (
                        <tr key={i} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="py-6 pr-6 max-w-sm">
                            <p className="font-label-bold text-sm text-primary mb-1">{p.name}</p>
                            <p className="text-[11px] text-secondary leading-relaxed line-clamp-2">{p.impact}</p>
                          </td>
                          <td className="py-6 pr-6">
                            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">{p.stack}</span>
                          </td>
                          <td className="py-6 whitespace-nowrap space-x-3">
                            {p.github && p.github !== 'Not Found' && (
                              <a href={p.github} target="_blank" rel="noreferrer" className="text-primary hover:underline text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 inline-flex">
                                <Link2 size={12} /> Repo ↗
                              </a>
                            )}
                            {p.live && p.live !== 'Not Found' && (
                              <a href={p.live} target="_blank" rel="noreferrer" className="text-primary hover:underline text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 inline-flex">
                                <ExternalLink size={12} /> Live ↗
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </section>
      </div>
    </div>
  );
}
