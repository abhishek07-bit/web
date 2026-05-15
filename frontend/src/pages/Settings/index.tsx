import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, Plus, X, Sun, Moon, Monitor, LogOut, Loader2, ShieldCheck, Zap, User, Target, SlidersHorizontal, Activity } from 'lucide-react';
import { useSettingsStore, type ThemeMode } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { useResumeStore } from '../../store/resumeStore';
import Toggle from '../../components/common/Toggle';
import { resumeAPI } from '../../api/client';

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resume = useResumeStore();
  const {
    difficulty,
    setDifficulty,
    targetRoles,
    addRole,
    removeRole,
    strictTiming,
    toggleStrictTiming,
    audioFeedback,
    toggleAudioFeedback,
    theme,
    setTheme,
  } = useSettingsStore();

  const [newRole, setNewRole] = useState('');
  const [showAddRole, setShowAddRole] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const settingsFileRef = useRef<HTMLInputElement>(null);

  const handleSettingsUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Artifact size exceeds 5MB limit.');
      return;
    }
    setUploadError(null);
    resume.setUploading(true);
    resume.setFile({ name: file.name, size: file.size });
    try {
      const { data } = await resumeAPI.upload(file);
      resume.setParsedData({ skills: data.skills || [], experience: [] });
    } catch (err) {
      resume.setFile(null);
      resume.setParsedData(null);
      setUploadError('Artifact uplink failed.');
    } finally {
      resume.setUploading(false);
    }
  };

  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || '?'
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddRole = () => {
    if (newRole.trim() && !targetRoles.includes(newRole.trim())) {
      addRole(newRole.trim());
    }
    setNewRole('');
    setShowAddRole(false);
  };

  const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Lumen', icon: Sun },
    { value: 'dark', label: 'Void', icon: Moon },
    { value: 'system', label: 'Auto', icon: Monitor },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-fade-in">
      
      {/* Settings Header */}
      <header className="pt-12 mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-[0.2em]">
          <Activity size={14} />
          System Calibration
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-primary tracking-tight">
          Command <span className="text-secondary">Config.</span>
        </h1>
        <p className="font-body-lg text-secondary text-xl max-w-2xl leading-relaxed">
          Fine-tune your identity matrix and neural simulation protocols for maximum operational efficiency.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Identity & Artifacts */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          
          {/* Identity Matrix */}
          <section className="glass rounded-[40px] p-10 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/30">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary">Identity Matrix</h3>
            </div>

            <div className="flex items-center gap-8 mb-12">
              <div className="w-24 h-24 rounded-[32px] bg-primary text-on-primary flex items-center justify-center font-display text-3xl font-bold shadow-xl shadow-primary/20">
                {initials}
              </div>
              <div className="space-y-1">
                <p className="font-display text-2xl font-bold text-primary italic leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="font-label-bold text-[11px] text-secondary uppercase tracking-[0.2em]">{user?.email || 'Unauthorized'}</p>
              </div>
            </div>

            <form className="space-y-8" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
              const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
              const store = useAuthStore.getState();
              if (store.user) store.updateUser({ firstName, lastName });
              setSaveStatus('saved');
              setTimeout(() => setSaveStatus('idle'), 2000);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="font-label-bold text-[10px] text-primary uppercase tracking-widest pl-1" htmlFor="firstName">First Vector</label>
                  <input className="w-full glass border border-outline-variant/30 rounded-2xl py-4 px-6 font-display font-bold text-lg text-primary focus:border-primary/40 outline-none transition-all shadow-sm" id="firstName" name="firstName" type="text" defaultValue={user?.firstName || ''} />
                </div>
                <div className="space-y-2">
                  <label className="font-label-bold text-[10px] text-primary uppercase tracking-widest pl-1" htmlFor="lastName">Last Vector</label>
                  <input className="w-full glass border border-outline-variant/30 rounded-2xl py-4 px-6 font-display font-bold text-lg text-primary focus:border-primary/40 outline-none transition-all shadow-sm" id="lastName" name="lastName" type="text" defaultValue={user?.lastName || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-bold text-[10px] text-primary uppercase tracking-widest pl-1" htmlFor="email">Comms Registry (Read-Only)</label>
                <input className="w-full glass border border-outline-variant/30 rounded-2xl py-4 px-6 font-display font-bold text-lg text-primary opacity-50 cursor-not-allowed outline-none" id="email" type="email" defaultValue={user?.email || ''} disabled />
              </div>
              <div className="pt-6 flex justify-end items-center gap-6">
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-2 text-primary font-label-bold text-[10px] uppercase tracking-widest animate-fade-in">
                    <ShieldCheck size={14} /> Synchronized
                  </div>
                )}
                <button className="bg-primary text-on-primary px-10 py-4 rounded-[20px] font-display font-bold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-primary/20" type="submit">Update Matrix</button>
              </div>
            </form>
          </section>

          {/* Artifact Audit (Resume) */}
          <section className="glass rounded-[40px] p-10 shadow-premium relative">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/30">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary">Artifact Audit</h3>
            </div>
            
            <p className="font-body-md text-secondary text-lg leading-relaxed mb-10 italic">
              "Your career artifacts are used to synthesize high-fidelity interview vectors and cultural engineering benchmarks."
            </p>

            {resume.file ? (
              <div className="glass border border-primary/20 rounded-[28px] p-8 flex items-center justify-between mb-10 shadow-lg bg-white/40 group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    <FileText size={28} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg text-primary">{resume.file.name}</p>
                    <p className="font-label-bold text-[10px] text-outline uppercase tracking-widest">{(resume.file.size / 1024 / 1024).toFixed(1)} MB Active Artifact</p>
                  </div>
                </div>
                <button
                  onClick={() => { resume.setFile(null); resume.setParsedData(null); }}
                  className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="Purge Artifact"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ) : (
              <div className="px-8 py-4 bg-primary/5 border border-primary/10 rounded-2xl text-[10px] font-label-bold text-primary uppercase tracking-[0.2em] mb-10 text-center">
                Artifact Reservoir Empty
              </div>
            )}

            <div
              onClick={() => settingsFileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleSettingsUpload(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-outline-variant/30 hover:border-primary/40 rounded-[32px] p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-surface-container-lowest/50 hover:bg-white/40 group shadow-inner"
            >
              {resume.isUploading ? (
                <div className="space-y-4">
                  <Loader2 size={32} className="text-primary animate-spin" />
                  <p className="font-display font-bold text-primary uppercase tracking-widest text-xs">Uplinking Intel...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-secondary" />
                  </div>
                  <h4 className="font-display font-bold text-xl text-primary tracking-tight">Deploy New Artifact</h4>
                  <p className="font-label-bold text-[10px] text-outline uppercase tracking-[0.2em]">PDF, DOCX — SECURE CHANNEL</p>
                </div>
              )}
            </div>
            {uploadError && (
              <div className="mt-4 flex items-center gap-2 text-red-500 font-label-bold text-[10px] uppercase tracking-widest pl-2 animate-fade-in">
                <Zap size={14} /> {uploadError}
              </div>
            )}
            <input
              ref={settingsFileRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => e.target.files?.[0] && handleSettingsUpload(e.target.files[0])}
              className="hidden"
            />
          </section>
        </div>

        {/* Right Column: Protocols & Appearance */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          
          {/* Neural Calibration (Preferences) */}
          <section className="glass rounded-[40px] p-10 shadow-premium relative">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/30">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <SlidersHorizontal size={20} />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary">Neural Calibration</h3>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="font-label-bold text-[10px] text-primary uppercase tracking-widest pl-1">Standard Rigor Index</label>
                <div className="flex flex-wrap gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-label-bold uppercase tracking-widest transition-all border ${
                        difficulty === level
                          ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20'
                          : 'glass border-outline-variant/30 text-secondary hover:border-primary/40'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="font-label-bold text-[10px] text-primary uppercase tracking-widest pl-1">Target Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {targetRoles.map((role) => (
                    <span key={role} className="glass border border-primary/20 px-4 py-2 rounded-xl font-label-bold text-[10px] text-primary uppercase tracking-widest flex items-center gap-3">
                      {role}
                      <button onClick={() => removeRole(role)} className="text-outline hover:text-red-500 transition-colors"><X size={14} /></button>
                    </span>
                  ))}
                  {showAddRole ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="glass border border-primary/30 rounded-xl px-4 py-2 font-label-bold text-[10px] text-primary uppercase tracking-widest outline-none w-40"
                        placeholder="NEW SECTOR..."
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
                        autoFocus
                      />
                      <button onClick={handleAddRole} className="text-primary hover:scale-110 transition-transform"><Plus size={18} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddRole(true)}
                      className="border border-dashed border-outline-variant/30 px-4 py-2 rounded-xl font-label-bold text-[10px] text-outline uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all flex items-center gap-2"
                    >
                      <Plus size={14} /> Add Sector
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-8 pt-4 border-t border-outline-variant/20">
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="font-display font-bold text-lg text-primary tracking-tight">Strict Chrono Protocol</p>
                    <p className="font-label-bold text-[10px] text-secondary uppercase tracking-widest">Enforce session time limits</p>
                  </div>
                  <Toggle checked={strictTiming} onChange={toggleStrictTiming} />
                </div>
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="font-display font-bold text-lg text-primary tracking-tight">Neural Audio Uplink</p>
                    <p className="font-label-bold text-[10px] text-secondary uppercase tracking-widest">Enable AI voice feedback</p>
                  </div>
                  <Toggle checked={audioFeedback} onChange={toggleAudioFeedback} />
                </div>
              </div>
            </div>
          </section>

          {/* Matrix Appearance (Theme) */}
          <section className="glass rounded-[40px] p-10 shadow-premium relative">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/30">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Monitor size={20} />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary">Matrix Appearance</h3>
            </div>

            <div className="space-y-6">
              <label className="font-label-bold text-[10px] text-primary uppercase tracking-widest pl-1">Lumen Frequency</label>
              <div className="flex bg-surface-container-low/50 border border-outline-variant/20 rounded-[28px] p-2 shadow-inner">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex-1 py-4 rounded-[20px] font-display font-bold text-xs transition-all flex flex-col items-center justify-center gap-2 ${
                      theme === value
                        ? 'bg-primary text-on-primary shadow-xl shadow-primary/20 scale-[1.02]'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-label-bold text-[9px] uppercase tracking-[0.3em]">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Terminal Exit */}
          <section className="pt-4 flex justify-center">
            <button 
              onClick={handleLogout} 
              className="group flex items-center gap-3 px-8 py-3 rounded-full hover:bg-red-50 text-red-500 font-label-bold text-[10px] uppercase tracking-[0.4em] transition-all"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
              Terminal Exit
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
