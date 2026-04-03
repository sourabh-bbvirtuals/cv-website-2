import React from 'react';
import { useNavigate } from '@remix-run/react';
import { ShoppingCartIcon, ArrowRightIcon, HomeIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  showBackToHome?: boolean;
  customAction?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
}

export function EmptyState({ 
  title, 
  description, 
  showBackToHome = true, 
  customAction,
  icon = "alert-circle"
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="bg-slate-50 flex justify-center px-4 py-12">
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
          <ShoppingCartIcon className="h-full w-full" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {title}
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {customAction && (
            <button
              onClick={customAction.onClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowRightIcon className="w-4 h-4" />
              {customAction.label}
            </button>
          )}
          
          {showBackToHome && (
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
