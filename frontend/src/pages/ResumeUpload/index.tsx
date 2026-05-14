import { useState, useRef } from 'react';
import { Upload, FolderOpen, Sparkles, Brain, Briefcase, FileText, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { resumeAPI } from '../../api/client';
import { useResumeStore } from '../../store/resumeStore';

export default function ResumeUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    id, file, parsedData, analysis, isUploading, isAnalyzing,
    setResumeId, setFile, setParsedData, setAnalysis, setUploading, setAnalyzing, clearResume 
  } = useResumeStore();
  
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const { data } = await resumeAPI.analyze(id);
      setAnalysis(data);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <header className="mb-xl max-w-3xl animate-fade-in">
        <h2 className="font-display text-display text-primary mb-sm">Resume Upload</h2>
        <p className="font-body-md text-body-md text-secondary">
          Upload your resume to generate personalized interview questions based on your experience and skills.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-lg items-start animate-slide-up">
        {/* Upload Zone */}
        <section className="w-full lg:w-5/12 flex-shrink-0">
          {file && !isUploading ? (
            /* Uploaded file preview */
            <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
              <div className="flex items-center gap-md mb-md">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle size={20} className="text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-bold text-label-bold text-primary truncate">{file.name}</p>
                  <p className="font-label-sm text-label-sm text-secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button
                  onClick={handleRemove}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-error hover:bg-error-container transition-colors"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary font-label-bold text-label-sm py-sm rounded-btn hover:bg-surface-container transition-colors"
              >
                Replace File
              </button>
            </div>
          ) : (
            /* Drop zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-pebble p-xl flex flex-col items-center justify-center text-center min-h-[280px] transition-all cursor-pointer group ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant bg-surface-container-low hover:border-primary'
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
                  <h3 className="font-label-bold text-label-bold text-primary mb-xs">Drop your resume here</h3>
                  <p className="font-label-sm text-label-sm text-secondary mb-md">PDF, DOCX — Max 5MB</p>
                  <span className="bg-surface border border-outline-variant text-primary font-label-bold text-label-sm py-2 px-4 rounded-btn inline-flex items-center gap-2">
                    <FolderOpen size={14} strokeWidth={1.5} />
                    Browse Files
                  </span>
                </>
              )}
            </div>
          )}

          {error && (
            <p className="font-label-sm text-label-sm text-error mt-sm">{error}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleInputChange}
            className="hidden"
          />
        </section>

        {/* Parsed Extraction & Analysis */}
        <section className="w-full lg:w-7/12 flex flex-col gap-md">
          <div className="flex items-center justify-between mb-xs">
            <h3 className="font-headline-md text-headline-md text-primary">Resume Intelligence</h3>
            <div className="flex items-center gap-sm">
              {parsedData && !analysis && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-primary text-on-primary font-label-bold text-label-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                </button>
              )}
              {analysis && (
                <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} strokeWidth={1.5} /> Analyzed
                </span>
              )}
            </div>
          </div>

          {/* AI Analysis View (if available) */}
          {analysis ? (
            <div className="flex flex-col gap-md animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg flex flex-col items-center justify-center text-center">
                  <h4 className="font-label-bold text-label-sm text-secondary tracking-widest uppercase mb-sm">ATS Score</h4>
                  <div className={`text-[48px] font-display font-bold leading-none ${
                    analysis.atsScore >= 80 ? 'text-green-500' : analysis.atsScore >= 60 ? 'text-yellow-500' : 'text-error'
                  }`}>
                    {analysis.atsScore}
                  </div>
                </div>
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                  <h4 className="font-label-bold text-label-sm text-secondary tracking-widest uppercase mb-sm">Summary</h4>
                  <p className="font-body-md text-label-sm text-primary leading-relaxed">{analysis.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                  <h4 className="font-label-bold text-label-sm text-secondary tracking-widest uppercase mb-sm text-green-500">Strengths</h4>
                  <ul className="flex flex-col gap-xs mt-sm list-disc list-inside">
                    {analysis.strengths.map((str, i) => (
                      <li key={i} className="font-label-sm text-label-sm text-primary">{str}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                  <h4 className="font-label-bold text-label-sm text-secondary tracking-widest uppercase mb-sm text-error">Weaknesses</h4>
                  <ul className="flex flex-col gap-xs mt-sm list-disc list-inside">
                    {analysis.weaknesses.map((weak, i) => (
                      <li key={i} className="font-label-sm text-label-sm text-primary">{weak}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                <h4 className="font-label-bold text-label-sm text-secondary tracking-widest uppercase mb-sm">Recommended Roles</h4>
                <div className="flex flex-wrap gap-sm mt-sm">
                  {analysis.recommendedRoles.map((role, i) => (
                    <span key={i} className="bg-surface-container-highest text-primary font-label-bold text-label-sm px-3 py-1 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Extracted Skills */}
              <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                <h4 className="font-label-bold text-label-sm text-secondary uppercase tracking-widest mb-md flex items-center gap-2">
                  <Brain size={14} strokeWidth={1.5} /> Skills
                </h4>
                <div className="flex flex-wrap gap-sm">
                  {parsedData?.skills && parsedData.skills.length > 0 ? (
                    parsedData.skills.map((skill) => (
                      <span key={skill} className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="font-label-sm text-label-sm text-secondary opacity-60">
                      Upload a resume to see extracted skills here.
                    </p>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg">
                <h4 className="font-label-bold text-label-sm text-secondary uppercase tracking-widest mb-md flex items-center gap-2">
                  <Briefcase size={14} strokeWidth={1.5} /> Experience
                </h4>
                {parsedData?.experience && parsedData.experience.length > 0 ? (
                  <div className="flex flex-col gap-sm">
                    {parsedData.experience.map((exp, i) => (
                      <div key={i} className="flex items-start gap-md p-sm rounded-btn bg-surface-container-lowest border border-outline-variant">
                        <FileText size={16} className="text-secondary mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="font-label-bold text-label-sm text-primary">{exp.title}</p>
                          <p className="font-label-sm text-label-sm text-secondary">{exp.company} • {exp.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-label-sm text-label-sm text-secondary opacity-60">
                    {parsedData ? 'Experience parsing coming soon.' : 'Upload a resume to see experience here.'}
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
