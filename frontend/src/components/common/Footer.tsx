import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Globe, Mail, MessageCircle, Zap, ShieldCheck, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full glass border-t border-outline-variant/30 mt-auto bg-surface/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Elite Brand Section */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="bg-primary p-2 rounded-xl group-hover:rotate-6 transition-transform">
                <Zap size={20} className="text-on-primary" />
              </div>
              <span className="font-display text-2xl tracking-tight text-primary font-bold italic">PrepMate AI</span>
            </Link>
            <p className="font-body-md text-secondary leading-relaxed text-sm">
              Dominating technical interviews through neural-first simulation, context-aware challenges, and sub-second feedback matrices.
            </p>
            <div className="flex gap-4 mt-2">
              {[
                { icon: Globe, label: 'Global' },
                { icon: MessageCircle, label: 'Comms' },
                { icon: Mail, label: 'Secure' }
              ].map((item, i) => (
                <Link key={i} to="#" className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 transition-all">
                  <item.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Strategic Links */}
          {[
            {
              title: 'PROTOCOL',
              links: [
                { label: 'Command Center', path: '/dashboard' },
                { label: 'Tactical Practice', path: '/interview/setup' },
                { label: 'Sector Intelligence', path: '/company-prep' },
                { label: 'Resume Audit', path: '/resume' }
              ]
            },
            {
              title: 'RESOURCES',
              links: [
                { label: 'System Design', path: '#' },
                { label: 'Behavioral Vector', path: '#' },
                { label: 'Neural Blog', path: '#' },
                { label: 'Help Matrix', path: '#' }
              ]
            },
            {
              title: 'LEGAL',
              links: [
                { label: 'Privacy Protocol', path: '#' },
                { label: 'Terms of Engagement', path: '#' },
                { label: 'Cookie Registry', path: '#' }
              ]
            }
          ].map((column) => (
            <div key={column.title} className="col-span-1 flex flex-col gap-5">
              <h4 className="font-label-bold text-[10px] text-primary uppercase tracking-[0.3em] mb-2">{column.title}</h4>
              {column.links.map((link) => (
                <Link key={link.label} to={link.path} className="font-label-bold text-xs text-secondary hover:text-primary transition-all hover:translate-x-1 inline-block">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Tactical Status Bar */}
        <div className="mt-20 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="font-label-bold text-[10px] text-outline uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} PREPMATE AI. CORE_STABLE_V2.0
            </p>
            <div className="hidden md:block w-px h-3 bg-outline-variant/30" />
            <Link to="#" className="font-label-bold text-[10px] text-secondary hover:text-primary uppercase tracking-[0.2em] transition-all">
              OPERATIONAL_CAREERS
            </Link>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full glass border-primary/20">
              <Activity size={14} className="text-green-500 animate-pulse" />
              <span className="font-label-bold text-[10px] text-primary uppercase tracking-[0.3em]">Neural Stack: Optimal</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full glass border-outline-variant/30">
              <ShieldCheck size={14} className="text-primary" />
              <span className="font-label-bold text-[10px] text-outline uppercase tracking-[0.3em]">SSL_ENCRYPTED_LINK</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
