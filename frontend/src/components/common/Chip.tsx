import { X } from 'lucide-react';

interface ChipProps {
  label: string;
  active?: boolean;
  removable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'dashed' | 'outlined';
}

export default function Chip({
  label,
  active = false,
  removable = false,
  onClick,
  onRemove,
  variant = 'default',
}: ChipProps) {
  const baseClasses =
    'px-md py-xs rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-xs';

  const variantClasses = {
    default: active
      ? 'bg-primary text-on-primary border border-primary'
      : 'bg-surface-container border border-outline-variant text-primary hover:border-primary cursor-pointer',
    dashed:
      'border border-dashed border-outline-variant text-secondary hover:text-primary hover:border-primary cursor-pointer',
    outlined:
      'bg-surface text-primary border border-outline-variant',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`} onClick={onClick}>
      {label}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="hover:text-error"
        >
          <X size={16} />
        </button>
      )}
    </span>
  );
}
