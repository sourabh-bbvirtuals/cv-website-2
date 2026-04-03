import React from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SearchIcon, 
  ShoppingCartIcon, 
  MenuIcon, 
  FilterIcon, 
  StarIcon, 
  ClockIcon, 
  CreditCardIcon, 
  XIcon, 
  UsersIcon, 
  BookOpenIcon, 
  PlayIcon, 
  AwardIcon, 
  ZapIcon, 
  TargetIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  HeadphonesIcon, 
  BadgeCheckIcon 
} from 'lucide-react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

// Helper function to map icon names to Lucide React components
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'chevron-left': ChevronLeftIcon,
    'chevron-right': ChevronRightIcon,
    'search': SearchIcon,
    'shopping-cart': ShoppingCartIcon,
    'shopping-bag': ShoppingBagIcon,
    'menu': MenuIcon,
    'filter': FilterIcon,
    'star': StarIcon,
    'clock': ClockIcon,
    'credit-card': CreditCardIcon,
    'x': XIcon,
    'users': UsersIcon,
    'book-open': BookOpenIcon,
    'play': PlayIcon,
    'award': AwardIcon,
    'zap': ZapIcon,
    'target': TargetIcon,
    'shield-check': ShieldCheckIcon,
    'truck': TruckIcon,
    'headphones': HeadphonesIcon,
    'badge-check': BadgeCheckIcon,
  };
  
  return iconMap[iconName] || XIcon; // fallback to XIcon
};

export function Icon({ name, size = 16, className = '' }: IconProps) {
  const IconComponent = getIconComponent(name);
  return (
    <IconComponent 
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

// Common icon components
export const ChevronLeft = ({ size = 20, className = '' }) => (
  <ChevronLeftIcon size={size} className={className} />
);

export const ChevronRight = ({ size = 20, className = '' }) => (
  <ChevronRightIcon size={size} className={className} />
);

export const Search = ({ size = 16, className = '' }) => (
  <SearchIcon size={size} className={className} />
);

export const ShoppingCart = ({ size = 16, className = '' }) => (
  <ShoppingCartIcon size={size} className={className} />
);

export const Menu = ({ size = 20, className = '' }) => (
  <MenuIcon size={size} className={className} />
);

export const Filter = ({ size = 16, className = '' }) => (
  <FilterIcon size={size} className={className} />
);

export const Star = ({ size = 16, className = '' }) => (
  <StarIcon size={size} className={className} />
);

export const Clock = ({ size = 16, className = '' }) => (
  <ClockIcon size={size} className={className} />
);

export const CreditCard = ({ size = 16, className = '' }) => (
  <CreditCardIcon size={size} className={className} />
);

export const X = ({ size = 16, className = '' }) => (
  <XIcon size={size} className={className} />
);

export const Users = ({ size = 16, className = '' }) => (
  <UsersIcon size={size} className={className} />
);

export const BookOpen = ({ size = 16, className = '' }) => (
  <BookOpenIcon size={size} className={className} />
);

export const Play = ({ size = 16, className = '' }) => (
  <PlayIcon size={size} className={className} />
);

export const Award = ({ size = 16, className = '' }) => (
  <AwardIcon size={size} className={className} />
);

export const Zap = ({ size = 16, className = '' }) => (
  <ZapIcon size={size} className={className} />
);

export const Target = ({ size = 16, className = '' }) => (
  <TargetIcon size={size} className={className} />
);

export const ShieldCheck = ({ size = 16, className = '' }) => (
  <ShieldCheckIcon size={size} className={className} />
);

export const Truck = ({ size = 16, className = '' }) => (
  <TruckIcon size={size} className={className} />
);

export const Headphones = ({ size = 16, className = '' }) => (
  <HeadphonesIcon size={size} className={className} />
);

export const BadgeCheck = ({ size = 16, className = '' }) => (
  <BadgeCheckIcon size={size} className={className} />
);
