import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Monitor, User, Menu, X, Layers,
  Home, Mic, BarChart3, Upload, Settings, LogOut, FileText
} from 'lucide-react';
import { useSettingsStore, type ThemeMode } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import Shuffle from './Shuffle';

const drawerLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Practice', path: '/interview/setup', icon: Mic },
  { label: 'Company Prep', path: '/company-prep', icon: FileText },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Resume', path: '/resume', icon: Upload },
  { label: 'Settings', path: '/settings', icon: Settings },
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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close drawer on route change
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
      {/* Main Navbar */}
      <header className="bg-surface-container-lowest w-full px-lg md:px-container-padding py-md sticky top-0 z-40 border-b border-outline-variant">
        <div className="flex justify-between items-center max-w-max-width mx-auto w-full">
          {/* Left: Logo (Now using Shuffle) */}
          <div className="flex items-center gap-xl">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-sm group">
              <Layers size={24} className="text-primary group-hover:scale-105 transition-transform duration-300" strokeWidth={1.5} />
              <Shuffle
                text="PrepMate AI"
                className="font-headline-md tracking-tighter text-primary font-semibold"
                shuffleDirection="down"
                duration={0.4}
                stagger={0.04}
                animationMode="evenodd"
                loop={true}
                loopDelay={2}
              />
            </Link>
          </div>

          {/* Right: Theme + Profile + Hamburger */}
          <div className="flex items-center gap-sm">
            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              aria-label={`Current theme: ${theme}. Click to switch.`}
              className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
              title={`Theme: ${theme}`}
            >
              <ThemeIcon size={20} strokeWidth={1.5} />
            </button>

            {/* Profile */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-bold text-label-bold hover:opacity-90 transition-opacity"
                  aria-label="Profile menu"
                >
                  {initials}
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-surface-container-lowest border border-outline-variant rounded-[16px] shadow-2xl py-xs z-50 animate-fade-in">
                    <div className="px-md py-xs border-b border-outline-variant mb-xs">
                      <p className="font-label-bold text-label-sm text-primary truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="font-label-sm text-[11px] text-secondary truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-sm px-md py-xs text-error hover:bg-error-container transition-colors font-label-bold text-label-sm w-full text-left rounded-b-[16px]"
                    >
                      <LogOut size={14} strokeWidth={1.5} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex bg-primary text-on-primary font-label-bold text-label-bold px-md py-sm rounded-full hover:opacity-90 transition-opacity items-center gap-xs"
              >
                Sign In
              </Link>
            )}

            {/* Hamburger - visible on ALL screens */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              className="w-9 h-9 flex items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
            >
              {drawerOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>


      {/* Curtain Drawer */}
      <aside
        className={`fixed inset-0 w-full h-screen bg-surface-container-lowest z-[60] flex flex-col transform transition-transform duration-500 ease-in-out ${
          drawerOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Header inside curtain */}
        <div className="w-full max-w-max-width mx-auto px-lg md:px-container-padding py-md flex justify-between items-center border-b border-outline-variant">
          <div className="flex items-center gap-sm">
            <Layers size={24} className="text-primary" strokeWidth={1.5} />
            <span className="font-headline-md text-primary font-semibold tracking-tighter">PrepMate AI</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Links Container (Centered) */}
        <div className="flex-1 flex flex-col items-center justify-center gap-md px-lg">
          {(isAuthenticated ? drawerLinks : [
            { label: 'Sign In', path: '/login', icon: User },
            { label: 'Sign Up', path: '/signup', icon: User },
          ]).map((link, index) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center justify-center gap-md py-sm px-xl rounded-full transition-colors duration-200 ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'text-secondary hover:text-primary hover:bg-surface-container'
                } font-display text-headline-lg`}
              >
                <Icon size={28} strokeWidth={1.5} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Theme selector at bottom */}
        <div className="pb-xl w-full max-w-md mx-auto px-lg">
          <div className="flex w-full bg-surface-container border border-outline-variant rounded-full p-xs">
            {([
              { value: 'light' as ThemeMode, label: 'Light', icon: Sun },
              { value: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
              { value: 'system' as ThemeMode, label: 'Auto', icon: Monitor },
            ]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center justify-center gap-xs px-sm py-md rounded-full font-label-bold text-label-sm transition-colors ${
                  theme === value
                    ? 'bg-primary text-on-primary'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
