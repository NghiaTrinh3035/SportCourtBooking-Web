import type { ElementType } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description?: string;
  className?: string;
}

const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-slate-100 text-teal-400">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-sm text-slate-400">{description}</p>}
    </div>
  );
};

export default EmptyState;
