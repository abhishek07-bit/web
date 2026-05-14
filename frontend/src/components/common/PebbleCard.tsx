import { ReactNode } from 'react';

interface PebbleCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'default' | 'large';
}

export default function PebbleCard({ children, className = '', padding = 'default' }: PebbleCardProps) {
  const pad = padding === 'large' ? 'p-pebble' : 'p-lg';
  return (
    <div className={`bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble ${pad} ${className}`}>
      {children}
    </div>
  );
}
