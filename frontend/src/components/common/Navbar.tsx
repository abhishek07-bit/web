import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Monitor, User, Menu, X, Layers,
  Home, Mic, BarChart3, Upload, Settings, LogOut, FileText, ChevronDown, Zap, Activity
} from 'lucide-react';
import { useSettingsStore, type ThemeMode } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import Shuffle from './Shuffle';

const drawerLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Resume Audit', path: '/resume', icon: Upload },
  { label: 'Tactical Practice', path: '/interview/setup', icon: Mic },
  { label: 'Sector Intelligence', path: '/company-prep', icon: FileText },
  { label: 'Performance Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'System Settings', path: '/settings', icon: Settings },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useSettingsStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'system' ? Monitor : Sun;

  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || '?'
    : '?';

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header className="glass sticky top-0 z-50 px-8 py-5 border-b border-outline-variant/30 backdrop-blur-xl">
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-16">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
                <div className="relative bg-primary p-2 rounded-xl rotate-3 group-hover:rotate-0 transition-all duration-500 shadow-lg">
                  <Zap size={22} className="text-on-primary" />
                </div>
              </div>
              <Shuffle
                text="PrepMate AI"
                className="font-display text-3xl tracking-tight text-primary font-bold italic"
                shuffleDirection="down"
                duration={0.5}
                stagger={0.05}
                animationMode="evenodd"
                threshold={0}
                loop={true}
                loopDelay={4}
              />
            </Link>

            {/* Desktop Nav: Tactical Links */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-10">
                {drawerLinks.slice(0, 4).map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative font-label-bold text-[10px] uppercase tracking-[0.25em] transition-all py-2 ${
                        active ? 'text-primary' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full animate-fade-in" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Theme Toggle: Minimalist */}
            <button
              onClick={cycleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-2xl text-secondary hover:text-primary hover:bg-primary/5 transition-all"
              title="Toggle Intelligence Matrix"
            >
              <ThemeIcon size={20} strokeWidth={1.5} />
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl glass border border-outline-variant/30 hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-display font-bold text-[10px]">
                    {initials}
                  </div>
                  <ChevronDown size={14} className={`text-secondary transition-transform duration-500 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-14 w-64 glass border border-outline-variant/30 rounded-[28px] shadow-premium py-4 z-50 animate-scale-in">
                    <div className="px-6 py-4 border-b border-outline-variant/20 mb-2">
                      <p className="font-display font-bold text-base text-primary truncate leading-none mb-2">{user?.firstName} {user?.lastName}</p>
                      <div className="flex items-center gap-2">
                        <Activity size={10} className="text-primary animate-pulse" />
                        <p className="font-label-bold text-[9px] text-secondary truncate uppercase tracking-[0.2em]">{user?.email}</p>
                      </div>
                    </div>
                    <Link to="/settings" className="flex items-center gap-3 px-6 py-3 text-secondary hover:bg-primary/5 hover:text-primary transition-all font-label-bold text-[10px] uppercase tracking-widest">
                      <Settings size={14} /> Profile Matrix
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-6 py-3 text-red-500 hover:bg-red-50 transition-all font-label-bold text-[10px] uppercase tracking-widest w-full text-left"
                    >
                      <LogOut size={14} /> Terminal Exit
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex bg-primary text-on-primary font-display font-bold px-10 py-3.5 rounded-[20px] shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Access Portal
              </Link>
            )}

            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all"
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Sleek Tactical Drawer */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-500 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-[300px] bg-surface-container-lowest border-l border-outline-variant/30 shadow-2xl flex flex-col transform transition-transform duration-500 ease-out ${
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
            <span className="font-display font-bold text-lg text-primary tracking-tight italic">Menu</span>
            <button onClick={() => setDrawerOpen(false)} className="text-secondary hover:text-primary">
              <X size={22} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-6 space-y-2">
            {(isAuthenticated ? drawerLinks : [
              { label: 'Access Portal', path: '/login', icon: User },
              { label: 'Initialize Account', path: '/signup', icon: User },
            ]).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                  isActive(link.path) 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                    : 'text-secondary hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <link.icon size={20} strokeWidth={1.5} />
                <span className="font-label-bold text-xs uppercase tracking-widest">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-outline-variant/20 bg-surface-container-low/50">
            <div className="flex gap-2 p-1 bg-surface-container-high rounded-2xl">
              {(['light', 'dark', 'system'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setTheme(v)}
                  className={`flex-1 flex justify-center py-3 rounded-xl transition-all ${
                    theme === v ? 'bg-primary text-on-primary shadow-md' : 'text-secondary'
                  }`}
                >
                  {v === 'light' ? <Sun size={16} /> : v === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
                </button>
              ))}
            </div>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full mt-4 py-4 rounded-2xl border border-red-500/20 text-red-500 font-label-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Terminal Exit
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
