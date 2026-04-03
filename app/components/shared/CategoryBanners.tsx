import React from 'react';
import { Icon } from './Icon';

interface CategoryBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
}

interface CategoryBannersProps {
  banners: CategoryBanner[];
  className?: string;
}

export function CategoryBanners({ banners, className = '' }: CategoryBannersProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${banners.length} gap-3 sm:gap-4 ${className}`}>
      {banners.map((banner) => (
        <div 
          key={banner.id}
          className={`rounded-lg border border-slate-200 text-white p-3 sm:p-4 ${banner.gradient}`}
        >
          <div className="text-xs font-medium">{banner.title}</div>
          <div className="mt-1 text-lg sm:text-xl font-semibold tracking-tight">{banner.subtitle}</div>
          <div className="mt-2 flex items-center text-xs opacity-90 gap-1 sm:gap-2">
            <Icon name={banner.icon} size={12} />
            {banner.description}
          </div>
        </div>
      ))}
    </div>
  );
}
