import { useUIStore } from '../../store/uiStore';
import { X, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slide-up"
        >
          <div className="glass rounded-2xl p-4 pr-12 min-w-[300px] max-w-[400px] shadow-premium relative border-l-4 overflow-hidden"
            style={{ 
              borderLeftColor: 
                toast.type === 'success' ? '#10b981' : 
                toast.type === 'error' ? '#ef4444' : 
                toast.type === 'neural' ? '#000000' : '#3b82f6' 
            }}
          >
            <div className="flex gap-3 items-center">
              <div className={`p-2 rounded-xl bg-opacity-10 ${
                toast.type === 'success' ? 'bg-green-500 text-green-600' : 
                toast.type === 'error' ? 'bg-red-500 text-red-600' : 
                toast.type === 'neural' ? 'bg-primary text-primary' : 'bg-blue-500 text-blue-600'
              }`}>
                {toast.type === 'success' && <CheckCircle size={18} />}
                {toast.type === 'error' && <AlertTriangle size={18} />}
                {toast.type === 'neural' && <Zap size={18} />}
                {toast.type === 'info' && <Info size={18} />}
              </div>
              <p className="font-label-bold text-xs text-primary uppercase tracking-wider">{toast.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-4 right-4 text-outline hover:text-primary transition-colors"
            >
              <X size={16} />
            </button>
            
            {/* Neural progress bar at bottom of toast */}
            <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full overflow-hidden">
              <div className="h-full bg-primary/30 animate-[neural-pulse_5s_linear_infinite]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
