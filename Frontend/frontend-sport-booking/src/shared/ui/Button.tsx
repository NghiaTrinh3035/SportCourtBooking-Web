import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
}

const baseClassName =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-250 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-600/30 active:translate-y-0 focus-visible:ring-teal-500',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 hover:ring-slate-300 hover:shadow-md active:bg-slate-100 focus-visible:ring-slate-400',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400',
  danger:
    'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/30 active:translate-y-0 focus-visible:ring-rose-500',
};

const Button = ({
  variant = 'primary',
  fullWidth,
  loading,
  className = '',
  disabled,
  children,
  ...rest
}: PropsWithChildren<ButtonProps>) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClassName} ${variantClassName[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isDisabled}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
