import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function InputField({ label, error, id, className = '', ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label className="font-label-bold text-label-bold text-primary" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`bg-surface-container-lowest border border-outline-variant rounded-DEFAULT px-md py-sm font-body-md text-body-md text-primary focus:border-primary focus:ring-0 outline-none transition-colors placeholder:text-outline ${className}`}
        {...props}
      />
      {error && <span className="font-label-sm text-label-sm text-error">{error}</span>}
    </div>
  );
}
