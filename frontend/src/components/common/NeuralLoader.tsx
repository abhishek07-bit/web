import { Zap } from 'lucide-react';

interface NeuralLoaderProps {
  message?: string;
}

export default function NeuralLoader({ message = 'Calibrating Neural Matrix...' }: NeuralLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-fade-in">
      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-[ping_3s_linear_infinite]" />
        <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-[ping_3s_linear_infinite_1s]" />
        
        <div className="relative w-24 h-24 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-premium">
          <Zap size={40} className="animate-pulse" />
        </div>
        
        {/* Orbiting Particles */}
        <div className="absolute top-0 left-0 w-full h-full animate-[spin_4s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary rounded-full blur-[1px]" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="font-display text-xl font-bold text-primary tracking-tight italic">{message}</h3>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" 
              style={{ animationDelay: `${i * 0.2}s` }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
