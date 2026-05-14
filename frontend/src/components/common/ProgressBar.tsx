interface ProgressBarProps {
  value: number;
  max?: number;
  height?: string;
  className?: string;
}

export default function ProgressBar({ value, max = 100, height = '2px', className = '' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full bg-surface-variant rounded-full overflow-hidden ${className}`} style={{ height }}>
      <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
    </div>
  );
}
