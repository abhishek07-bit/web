import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Globe, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="max-w-max-width mx-auto px-lg md:px-container-padding py-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-md">
            <Link to="/" className="flex items-center gap-sm group">
              <Layers size={24} className="text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              <span className="font-headline-md tracking-tighter text-primary font-semibold">PrepMate AI</span>
            </Link>
            <p className="font-body-md text-label-sm text-secondary">
              Master your tech interviews with AI-driven mock sessions, real-time feedback, and dynamic company paths.
            </p>
            <div className="flex gap-md mt-sm">
              <a href="#" className="text-secondary hover:text-primary transition-colors"><Globe size={18} strokeWidth={1.5} /></a>
              <a href="#" className="text-secondary hover:text-primary transition-colors"><MessageCircle size={18} strokeWidth={1.5} /></a>
              <a href="#" className="text-secondary hover:text-primary transition-colors"><Mail size={18} strokeWidth={1.5} /></a>
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1 flex flex-col gap-sm">
            <h4 className="font-label-bold text-label-bold text-primary mb-xs">Product</h4>
            <Link to="/dashboard" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/interview/setup" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Mock Interviews</Link>
            <Link to="/company-prep" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Company Prep</Link>
            <Link to="/resume" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Resume Upload</Link>
          </div>

          {/* Resources */}
          <div className="col-span-1 flex flex-col gap-sm">
            <h4 className="font-label-bold text-label-bold text-primary mb-xs">Resources</h4>
            <a href="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">System Design Guide</a>
            <a href="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Behavioral Questions</a>
            <a href="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Blog</a>
            <a href="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Help Center</a>
          </div>

          {/* Legal */}
          <div className="col-span-1 flex flex-col gap-sm">
            <h4 className="font-label-bold text-label-bold text-primary mb-xs">Legal</h4>
            <a href="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>

        <div className="mt-xl pt-lg border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-label-sm text-label-sm text-secondary">
            © {new Date().getFullYear()} PrepMate AI. All rights reserved.
          </p>
          <div className="flex gap-lg">
            <span className="font-label-sm text-[11px] text-secondary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
