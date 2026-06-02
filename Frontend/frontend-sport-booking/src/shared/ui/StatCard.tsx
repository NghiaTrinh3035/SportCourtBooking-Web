import type { ElementType } from 'react';

interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string | number;
  accentColor?: string;
  className?: string;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  accentColor = 'from-teal-500 to-emerald-500',
  className = '',
}: StatCardProps) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover ${className}`}
    >
      {/* Accent gradient bar */}
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accentColor}`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentColor} text-white shadow-lg shadow-teal-500/20 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
