import type { PropsWithChildren } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand';

interface BadgeProps {
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  error: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/60',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
  brand: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200/60',
};

const Badge = ({
  variant = 'neutral',
  pulse = false,
  className = '',
  children,
}: PropsWithChildren<BadgeProps>) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${variantStyles[variant]} ${
        pulse ? 'animate-pulse-soft' : ''
      } ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current opacity-70" />
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
