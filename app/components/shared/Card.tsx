import React from 'react';

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export function Card({ children, hover = false, className = '' }: CardProps) {
  const baseClasses = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}
