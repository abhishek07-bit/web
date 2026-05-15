import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, Plus, X, Sun, Moon, Monitor, LogOut, Loader2 } from 'lucide-react';
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
      setUploadError('File too large. Max 5MB.');
      return;
    }
    setUploadError(null);
    resume.setUploading(true);
    resume.setFile({ name: file.name, size: file.size });
    try {
      const { data } = await resumeAPI.upload(file);
      resume.setParsedData({ skills: data.skills || [], experience: [] });
    } catch (err) {
      console.error('Upload failed:', err);
      resume.setFile(null);
      resume.setParsedData(null);
      setUploadError('Upload failed. Please try again.');
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
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <>
      <header className="mb-xl flex justify-between items-end">
        <div>
          <h2 className="font-display text-display text-primary mb-sm">Settings</h2>
          <p className="font-body-lg text-body-lg text-secondary">Manage your profile, resume, and interview preferences.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left Column: Profile & Resume */}
        <div className="lg:col-span-7 flex flex-col gap-lg">
          {/* Profile */}
          <section className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-container-padding">
            <h3 className="font-headline-md text-headline-md text-primary mb-lg border-b border-outline-variant pb-sm">User Profile</h3>
            <div className="flex items-center gap-lg mb-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-low border border-outline-variant shrink-0 flex items-center justify-center">
                <span className="font-headline-md text-headline-md text-primary">{initials}</span>
              </div>
              <div className="flex flex-col gap-xs">
                <p className="font-label-bold text-label-bold text-primary">{user?.firstName} {user?.lastName}</p>
                <p className="font-label-sm text-label-sm text-secondary">{user?.email || 'No email set'}</p>
              </div>
            </div>
            <form className="flex flex-col gap-md" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
              const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
              // Update the auth store with new values
              const store = useAuthStore.getState();
              if (store.user) {
                store.updateUser({ firstName, lastName });
              }
              setSaveStatus('saved');
              setTimeout(() => setSaveStatus('idle'), 2000);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-bold text-label-sm text-primary" htmlFor="firstName">First Name</label>
                  <input className="bg-surface-container-lowest border border-outline-variant rounded-input p-sm font-body-md text-body-md text-on-background focus:border-primary focus:ring-0 outline-none transition-colors" id="firstName" name="firstName" type="text" defaultValue={user?.firstName || ''} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-bold text-label-sm text-primary" htmlFor="lastName">Last Name</label>
                  <input className="bg-surface-container-lowest border border-outline-variant rounded-input p-sm font-body-md text-body-md text-on-background focus:border-primary focus:ring-0 outline-none transition-colors" id="lastName" name="lastName" type="text" defaultValue={user?.lastName || ''} />
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-sm text-primary" htmlFor="email">Email Address</label>
                <input className="bg-surface-container-lowest border border-outline-variant rounded-input p-sm font-body-md text-body-md text-on-background focus:border-primary focus:ring-0 outline-none transition-colors opacity-60 cursor-not-allowed" id="email" type="email" defaultValue={user?.email || ''} disabled title="Email cannot be changed" />
              </div>
              <div className="mt-sm flex justify-end items-center gap-md">
                {saveStatus === 'saved' && <span className="font-label-sm text-label-sm text-primary animate-fade-in">Saved!</span>}
                <button className="bg-primary text-on-primary px-md py-sm rounded-btn font-label-bold text-label-sm hover:opacity-90 transition-opacity" type="submit">Save Changes</button>
              </div>
            </form>
          </section>

          {/* Resume */}
          <section className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-container-padding">
            <h3 className="font-headline-md text-headline-md text-primary mb-md border-b border-outline-variant pb-sm">Resume Management</h3>
            <p className="font-body-md text-body-md text-secondary mb-md">Your resume is used to tailor interview questions to your experience.</p>

            {resume.file ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-btn p-md flex items-center justify-between mb-md">
                <div className="flex items-center gap-md">
                  <FileText size={24} className="text-secondary" strokeWidth={1.5} />
                  <div>
                    <p className="font-label-bold text-label-sm text-primary">{resume.file.name}</p>
                    <p className="font-label-sm text-label-sm text-secondary">{(resume.file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <button
                  aria-label="Delete Resume"
                  onClick={() => { resume.setFile(null); resume.setParsedData(null); }}
                  className="text-error hover:text-on-error-container transition-colors p-xs rounded-full hover:bg-error-container"
                >
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <p className="font-label-sm text-label-sm text-secondary mb-md opacity-60">No resume uploaded yet.</p>
            )}

            <div
              onClick={() => settingsFileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleSettingsUpload(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-outline-variant hover:border-primary rounded-pebble p-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-surface-container-lowest hover:bg-primary/5"
            >
              {resume.isUploading ? (
                <>
                  <Loader2 size={24} className="text-primary animate-spin mb-sm" />
                  <p className="font-label-bold text-label-bold text-primary">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-secondary mb-sm" strokeWidth={1.5} />
                  <h4 className="font-label-bold text-label-bold text-primary mb-xs">Drop new resume here</h4>
                  <p className="font-label-sm text-label-sm text-secondary">PDF, DOCX — Max 5MB</p>
                </>
              )}
            </div>
            {uploadError && <p className="font-label-sm text-label-sm text-error mt-xs">{uploadError}</p>}
            <input
              ref={settingsFileRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => e.target.files?.[0] && handleSettingsUpload(e.target.files[0])}
              className="hidden"
            />
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-lg">
          {/* Interview Preferences */}
          <section className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-container-padding">
            <h3 className="font-headline-md text-headline-md text-primary mb-lg border-b border-outline-variant pb-sm">Interview Preferences</h3>
            <div className="flex flex-col gap-lg">
              <div className="flex flex-col gap-sm">
                <label className="font-label-bold text-label-bold text-primary">Default Difficulty</label>
                <div className="flex flex-wrap gap-sm">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={
                        difficulty === level
                          ? 'bg-primary text-on-primary border border-primary px-md py-xs rounded-full font-label-sm text-label-sm transition-colors'
                          : 'bg-surface-container-lowest border border-outline-variant px-md py-xs rounded-full font-label-sm text-label-sm text-primary hover:border-primary transition-colors'
                      }
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <label className="font-label-bold text-label-bold text-primary">Target Roles</label>
                <div className="flex flex-wrap gap-sm">
                  {targetRoles.map((role) => (
                    <span key={role} className="bg-surface-container border border-outline-variant px-md py-xs rounded-full font-label-sm text-label-sm text-primary flex items-center gap-xs">
                      {role}
                      <button onClick={() => removeRole(role)} className="hover:text-error"><X size={16} strokeWidth={1.5} /></button>
                    </span>
                  ))}
                  {showAddRole ? (
                    <div className="flex items-center gap-xs">
                      <input
                        className="border border-outline-variant rounded-full px-md py-xs font-label-sm text-label-sm bg-surface-container-lowest text-on-background focus:border-primary outline-none w-40"
                        placeholder="e.g. Data Engineer"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
                        autoFocus
                      />
                      <button onClick={handleAddRole} className="text-primary"><Plus size={16} /></button>
                      <button onClick={() => { setShowAddRole(false); setNewRole(''); }} className="text-secondary"><X size={16} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddRole(true)}
                      className="border border-dashed border-outline-variant px-md py-xs rounded-full font-label-sm text-label-sm text-secondary hover:text-primary hover:border-primary transition-colors flex items-center gap-xs"
                    >
                      <Plus size={16} strokeWidth={1.5} /> Add Role
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t border-outline-variant mt-sm">
                <Toggle checked={strictTiming} onChange={toggleStrictTiming} label="Strict Timing" description="Enforce time limits during practice." />
              </div>
              <Toggle checked={audioFeedback} onChange={toggleAudioFeedback} label="Audio Feedback" description="AI voice responds during mock chamber." />
            </div>
          </section>

          {/* Appearance — Theme Switcher */}
          <section className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-container-padding">
            <h3 className="font-headline-md text-headline-md text-primary mb-lg border-b border-outline-variant pb-sm">Appearance</h3>
            <div className="flex flex-col gap-md">
              <p className="font-label-bold text-label-bold text-primary">Theme</p>
              <p className="font-label-sm text-label-sm text-secondary -mt-sm">Choose your preferred color scheme.</p>
              <div className="flex bg-surface-container border border-outline-variant rounded-full p-xs">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex-1 px-md py-sm rounded-full font-label-sm text-label-sm transition-all flex items-center justify-center gap-xs ${
                      theme === value
                        ? 'bg-primary text-on-primary'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Sign Out */}
          <section className="mt-auto pt-lg">
            <button onClick={handleLogout} className="text-error font-label-bold text-label-bold hover:underline transition-all flex items-center gap-xs">
              <LogOut size={18} strokeWidth={1.5} /> Sign Out
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
