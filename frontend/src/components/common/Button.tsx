import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variants = {
  primary:
    'bg-primary text-on-primary hover:opacity-90 transition-opacity',
  secondary:
    'bg-surface-container-lowest text-primary border border-outline-variant hover:bg-surface-container-low transition-colors',
  ghost:
    'bg-transparent text-primary font-label-bold hover:bg-surface-container-high transition-colors',
  danger:
    'text-error font-label-bold hover:underline transition-all',
};

const sizes = {
  sm: 'py-sm px-md text-label-bold font-label-bold',
  md: 'py-sm px-lg text-label-bold font-label-bold',
  lg: 'py-lg px-xl text-label-bold font-label-bold',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-DEFAULT ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } flex items-center justify-center gap-sm ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
