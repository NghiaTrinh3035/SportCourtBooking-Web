interface SkeletonProps {
  className?: string;
  lines?: number;
}

const Skeleton = ({ className = '', lines = 1 }: SkeletonProps) => {
  if (lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'} ${className}`}
          />
        ))}
      </div>
    );
  }

  return <div className={`skeleton h-4 w-full ${className}`} />;
};

export const SkeletonCard = ({ className = '' }: { className?: string }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-card ${className}`}
    >
      <div className="skeleton mb-3 h-3 w-24" />
      <div className="skeleton mb-4 h-6 w-48" />
      <div className="space-y-2.5">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
};

export default Skeleton;
