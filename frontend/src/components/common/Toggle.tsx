interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-sm">
      {(label || description) && (
        <div>
          {label && <p className="font-label-bold text-label-bold text-primary">{label}</p>}
          {description && <p className="font-label-sm text-label-sm text-secondary">{description}</p>}
        </div>
      )}
      <button
        role="switch"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none ${
          checked ? 'bg-primary' : 'bg-surface border border-outline-variant'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
            checked ? 'right-1 bg-on-primary' : 'left-1 bg-outline'
          }`}
        />
      </button>
    </div>
  );
}
