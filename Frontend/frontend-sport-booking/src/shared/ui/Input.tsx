import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = ({ label, error, className = '', ...rest }: InputProps) => {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <input
        className={`w-full rounded-xl border bg-white/90 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
            : 'border-slate-200'
        } ${className}`}
        {...rest}
      />
      {error && (
        <p className="text-xs font-medium text-rose-500">{error}</p>
      )}
    </label>
  );
};

export default Input;
