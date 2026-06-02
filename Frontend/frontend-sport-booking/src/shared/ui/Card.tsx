import type { PropsWithChildren } from 'react';

interface CardProps {
  className?: string;
  hoverable?: boolean;
}

const Card = ({ children, className = '', hoverable = false }: PropsWithChildren<CardProps>) => {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/90 p-5 shadow-card backdrop-blur-sm transition-all duration-300 ${
        hoverable
          ? 'hover:-translate-y-1 hover:shadow-card-hover hover:border-teal-100/60'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
