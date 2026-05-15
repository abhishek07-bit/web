import { useState, useRef, useEffect } from 'react';
import { Upload, FolderOpen, Sparkles, Brain, Briefcase, FileText, Trash2, CheckCircle, Loader2, Volume2, VolumeX, BarChart3, Target, AlertTriangle, Shield, ChevronRight, ExternalLink, Link2 } from 'lucide-react';
import { resumeAPI } from '../../api/client';
import { useResumeStore } from '../../store/resumeStore';

export default function ResumeUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    id, file, parsedData, analysis, matchAnalysis, isUploading, isAnalyzing, isMatching,
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
    setAnalyzingStep('Extracting text structure...');
    
    // Simulate steps
    const stepInterval = setInterval(() => {
      setAnalyzingStep(prev => 
        prev === 'Extracting text structure...' ? 'Analyzing ATS compatibility...' : 
        prev === 'Analyzing ATS compatibility...' ? 'Evaluating impact & brevity...' :
        'Finalizing intelligence report...'
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
      console.error('Analysis failed:', err);
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
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
      console.error('Matching failed:', err);
      setError(err.response?.data?.detail || 'Matching failed. Please try again.');
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
    if (score >= 60) return 'text-yellow-500';
    return 'text-error';
  };

  const getKillRatioColor = (prob: number) => {
    if (prob >= 70) return 'text-error';
    if (prob >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <>
      <header className="mb-xl max-w-3xl animate-fade-in">
        <h2 className="font-display text-display text-primary mb-sm">Resume Intelligence</h2>
        <p className="font-body-md text-body-md text-secondary">
          Upload your resume for a ruthless audit, LaTeX structure check, and job-specific "Kill-Ratio" analysis.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-lg items-start animate-slide-up">
        {/* Left Column: Upload & Job Context */}
        <section className="w-full lg:w-5/12 flex flex-col gap-md flex-shrink-0">
          {/* Upload Zone */}
          <div className="w-full">
            {file && !isUploading ? (
              <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                <div className="flex items-center gap-md mb-md">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle size={20} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-bold text-label-bold text-primary truncate">{file.name}</p>
                    <p className="font-label-sm text-label-sm text-secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button onClick={handleRemove} className="w-8 h-8 flex items-center justify-center rounded-full text-error hover:bg-error-container transition-colors">
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="w-full bg-surface-container-lowest border border-outline-variant text-primary font-label-bold text-label-sm py-sm rounded-btn hover:bg-surface-container transition-colors">
                  Replace File
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-pebble p-xl flex flex-col items-center justify-center text-center min-h-[220px] transition-all cursor-pointer group ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low hover:border-primary'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={32} className="text-primary animate-spin mb-md" />
                    <p className="font-label-bold text-label-bold text-primary">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="bg-surface border border-outline-variant rounded-full p-3 mb-md group-hover:scale-105 transition-transform">
                      <Upload size={24} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-label-bold text-label-bold text-primary mb-xs">Drop resume here</h3>
                    <p className="font-label-sm text-label-sm text-secondary">PDF, DOCX — Max 5MB</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Job Description Input (Target Match) */}
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
            <h4 className="font-label-bold text-label-sm text-primary tracking-widest uppercase mb-md flex items-center gap-2">
              <Target size={16} /> Job Match Analysis
            </h4>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description / Requirements here to check your Kill-Ratio..."
              className="w-full h-40 bg-surface-container-lowest border border-outline-variant rounded-pebble p-md font-body-sm text-body-sm text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
            <button
              onClick={handleMatch}
              disabled={!id || !jobDescription.trim() || isMatching}
              className="w-full mt-md bg-primary text-on-primary font-label-bold text-label-sm py-sm rounded-btn hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isMatching ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Check Kill-Ratio
            </button>
          </div>

          {error && <p className="font-label-sm text-label-sm text-error mt-xs">{error}</p>}
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleInputChange} className="hidden" />
        </section>

        {/* Right Column: Intelligence & Kill-Ratio */}
        <section className="w-full lg:w-7/12 flex flex-col gap-md">
          {/* Top Scoreboard */}
          <div className="flex items-center justify-between mb-xs px-2">
            <h3 className="font-headline-md text-headline-md text-primary">Intelligence Report</h3>
            {parsedData && !analysis && (
              <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-primary text-on-primary font-label-bold text-label-sm px-4 py-2 rounded-full hover:opacity-90 flex items-center gap-2 disabled:opacity-50 min-w-40 justify-center">
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isAnalyzing ? (analyzingStep || 'Auditing...') : 'Audit Resume'}
              </button>
            )}
          </div>

          {analysis ? (
            <div className="flex flex-col gap-md animate-fade-in pb-xl">
              {/* Granular Scores (Now 4 columns) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-md flex flex-col items-center text-center">
                  <h4 className="font-label-bold text-[10px] text-secondary tracking-widest uppercase mb-1">ATS Match</h4>
                  <div className={`text-2xl font-display font-bold ${getScoreColor(analysis.atsScore)}`}>{analysis.atsScore}</div>
                </div>
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-md flex flex-col items-center text-center">
                  <h4 className="font-label-bold text-[10px] text-secondary tracking-widest uppercase mb-1">Impact</h4>
                  <div className={`text-2xl font-display font-bold ${getScoreColor(analysis.impactScore)}`}>{analysis.impactScore}</div>
                </div>
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-md flex flex-col items-center text-center">
                  <h4 className="font-label-bold text-[10px] text-secondary tracking-widest uppercase mb-1">Brevity</h4>
                  <div className={`text-2xl font-display font-bold ${getScoreColor(analysis.brevityScore)}`}>{analysis.brevityScore}</div>
                </div>
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-md flex flex-col items-center text-center">
                  <h4 className="font-label-bold text-[10px] text-secondary tracking-widest uppercase mb-1">LaTeX Logic</h4>
                  <div className={`text-2xl font-display font-bold ${getScoreColor(analysis.latexStructureScore)}`}>{analysis.latexStructureScore}</div>
                </div>
              </div>

              {/* Kill-Ratio Results (Conditional) */}
              {matchAnalysis && (
                <div className="bg-surface-container-highest border-2 border-primary/20 rounded-pebble p-lg animate-scale-in">
                  <div className="flex items-center justify-between mb-lg">
                    <div>
                      <h4 className="font-label-bold text-label-sm text-primary tracking-widest uppercase flex items-center gap-2">
                        <AlertTriangle size={16} className="text-error" /> Kill-Ratio Analysis
                      </h4>
                      <p className="font-body-sm text-[12px] text-secondary mt-1">Based on provided Job Description</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-display font-bold leading-none ${getKillRatioColor(matchAnalysis.rejectionProbability)}`}>
                        {matchAnalysis.rejectionProbability}%
                      </div>
                      <p className="font-label-bold text-[10px] text-secondary uppercase mt-1">Rejection Prob.</p>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-md mb-md">
                    <p className="font-label-bold text-label-sm text-primary italic leading-relaxed text-center">
                      "{matchAnalysis.killRatioVerdict}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div>
                      <h5 className="font-label-bold text-[11px] text-error uppercase mb-sm">Top Rejection Reasons</h5>
                      <ul className="flex flex-col gap-2">
                        {matchAnalysis.topRejectionReasons.map((reason: string, i: number) => (
                          <li key={i} className="flex gap-2 font-body-sm text-[12px] text-primary">
                            <span className="text-error mt-1 flex-shrink-0">•</span> {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-label-bold text-[11px] text-primary uppercase mb-sm">Gap Report & Fixes</h5>
                      <div className="flex flex-col gap-sm">
                        {matchAnalysis.gapReport.map((gap: any, i: number) => (
                          <div key={i} className="bg-surface-container-lowest p-xs rounded border border-outline-variant/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-label-bold text-[10px] text-primary">{gap.missingSkill}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${gap.importance === 'High' ? 'bg-error/10 text-error' : 'bg-yellow-500/10 text-yellow-600'}`}>{gap.importance} Priority</span>
                            </div>
                            <p className="text-[10px] text-secondary flex items-center gap-1"><ChevronRight size={10} /> {gap.fixAction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular Analysis Sections */}
              <div className="bg-error/5 border border-error/20 rounded-pebble p-lg">
                <h4 className="font-label-bold text-label-sm text-error tracking-widest uppercase flex items-center gap-2 mb-md">
                  <Trash2 size={16} /> Critical Fixes Required
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
                  {analysis.criticalFixes?.map((fix: string, i: number) => (
                    <div key={i} className="bg-surface-container-lowest border border-error/10 p-sm rounded-lg flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i+1}</span>
                      <p className="font-label-bold text-[12px] text-primary leading-tight">{fix}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg relative overflow-hidden group">
                <div className="flex items-center justify-between mb-sm">
                  <h4 className="font-label-bold text-label-sm text-primary tracking-widest uppercase flex items-center gap-2">
                    <Sparkles size={14} /> Ruthless Evaluation
                  </h4>
                  <button onClick={toggleSpeech} className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-primary text-on-primary shadow-lg animate-pulse' : 'bg-surface-container hover:bg-surface-container-high text-secondary'}`}>
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
                <p className="font-body-md text-body-md text-secondary leading-relaxed relative z-10 italic">"{analysis.overallSummary}"</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                  <h4 className="font-label-bold text-label-sm text-green-500 tracking-widest uppercase mb-sm">Strengths</h4>
                  <ul className="flex flex-col gap-xs list-disc list-inside">
                    {analysis.strengths.map((str, i) => (
                      <li key={i} className="font-body-sm text-body-sm text-primary leading-tight">{str}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                  <h4 className="font-label-bold text-label-sm text-error tracking-widest uppercase mb-sm">Issues Found</h4>
                  <ul className="flex flex-col gap-xs list-disc list-inside">
                    {analysis.weaknesses.map((weak, i) => (
                      <li key={i} className="font-body-sm text-body-sm text-primary leading-tight">{weak}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Projects Table - High Structure */}
              <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg overflow-hidden">
                <h4 className="font-label-bold text-label-sm text-primary tracking-widest uppercase mb-md flex items-center gap-2">
                  <Briefcase size={16} /> Project & Hyperlink Audit
                </h4>
                <div className="overflow-x-auto -mx-lg px-lg">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-outline-variant/30">
                        <th className="pb-sm font-label-bold text-[10px] text-secondary uppercase">Project Name & Impact</th>
                        <th className="pb-sm font-label-bold text-[10px] text-secondary uppercase">Stack</th>
                        <th className="pb-sm font-label-bold text-[10px] text-secondary uppercase">GitHub</th>
                        <th className="pb-sm font-label-bold text-[10px] text-secondary uppercase">Live Demo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {analysis.projects?.map((p, i) => (
                        <tr key={i} className="group hover:bg-surface-container-lowest transition-colors">
                          <td className="py-md pr-md max-w-[300px]">
                            <p className="font-label-bold text-[12px] text-primary">{p.name}</p>
                            <p className="text-[10px] text-secondary mt-1 italic line-clamp-2">{p.impact}</p>
                          </td>
                          <td className="py-md pr-md">
                            <span className="text-[10px] text-primary opacity-80">{p.stack}</span>
                          </td>
                          <td className="py-md pr-md">
                            {p.github && p.github !== 'Not Found' ? (
                              <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-[10px] font-label-bold">
                                <Link2 size={12} /> Repo ↗
                              </a>
                            ) : <span className="text-[10px] text-secondary opacity-30">None</span>}
                          </td>
                          <td className="py-md">
                            {p.live && p.live !== 'Not Found' ? (
                              <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-[10px] font-label-bold">
                                <ExternalLink size={12} /> Live ↗
                              </a>
                            ) : <span className="text-[10px] text-secondary opacity-30">None</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!analysis.projects || analysis.projects.length === 0) && (
                    <p className="text-center py-xl text-secondary text-body-sm italic">No project data identified.</p>
                  )}
                </div>
              </div>

              {/* Source Links & Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                  <h4 className="font-label-bold text-label-sm text-primary tracking-widest uppercase mb-md flex items-center gap-2">
                    <Link2 size={16} /> Source Links Audit
                  </h4>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {analysis.allLinksFound?.length > 0 ? analysis.allLinksFound.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors flex-shrink-0" />
                        <a href={link} target="_blank" rel="noreferrer" className="font-body-sm text-[10px] text-secondary hover:text-primary truncate transition-colors">
                          {link}
                        </a>
                      </div>
                    )) : <p className="text-[11px] text-secondary italic">No URLs found.</p>}
                  </div>
                </div>

                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                  <h4 className="font-label-bold text-label-sm text-primary tracking-widest uppercase mb-md flex items-center gap-2">
                    <BarChart3 size={16} /> Performance Metrics
                  </h4>
                  <div className="flex flex-wrap gap-xs">
                    {analysis.metricsDetected?.length > 0 ? analysis.metricsDetected.map((m, i) => (
                      <span key={i} className="bg-surface-container border border-outline-variant text-primary font-label-bold text-[9px] px-2 py-1 rounded-md">{m}</span>
                    )) : <p className="text-[11px] text-secondary italic">No metrics detected.</p>}
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                <h4 className="font-label-bold text-label-sm text-secondary tracking-widest uppercase mb-sm">Recommended Roles</h4>
                <div className="flex flex-wrap gap-sm mt-sm">
                  {analysis.recommendedRoles.map((role, i) => (
                    <span key={i} className="bg-surface-container-highest border border-outline-variant text-primary font-label-bold text-label-sm px-4 py-1.5 rounded-full">{role}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="p-xl text-center text-secondary border-2 border-dashed border-outline-variant rounded-pebble">
               Upload resume and analyze to see intelligence report.
             </div>
          )}
        </section>
      </div>
    </>
  );
}
