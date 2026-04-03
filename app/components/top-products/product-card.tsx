'use client';

import { Link } from '@remix-run/react';
import { useEffect } from 'react';

interface ProductCardProps {
  title: string;
  price: number;
  originalPrice: number;
  language: string;
  hasBooks: boolean;
  image: string;
  handle: string;
}

export function ProductCard({
  title,
  price,
  originalPrice,
  language,
  hasBooks,
  image,
  handle,
}: ProductCardProps) {
  return (
    <Link to={`/courses/${handle}`} className="block">
      <div className="flex flex-col w-full h-full bg-white border rounded-xl max-w-xs sm:max-w-md mx-auto transition-transform duration-200 md:hover:scale-105 cursor-pointer">
        {/* Card Content */}
        <div className="flex-1 p-4">
          {/* Responsive Image */}
          <div className="relative w-full cursor-pointer aspect-square rounded-2xl overflow-hidden">
            <img src={image} alt="Product Image" className="object-cover" />
          </div>

          <h3 className="font-medium text-sm lg:text-lg mb-4 text-start">
            {title}
          </h3>

          {/* Language & Books Info */}
          <div className="space-y-2 text-sm font-medium">
            <div className="flex flex-wrap items-center gap-2 border p-1.5 rounded-xl max-w-full sm:max-w-max">
              <span className="text-gray-500 whitespace-nowrap">Language:</span>
              <span className="truncate">{language}</span>
            </div>
            {hasBooks && (
              <div className="border p-1.5 rounded-xl max-w-full sm:max-w-max text-start">
                <div>Books & PDF Included</div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-l mt-1 border-dashed border-gray-600 border-b max-w-[90%] w-full mx-auto" />

        {/* Card Footer */}
        <div className="flex flex-wrap items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-900 mt-0.5 md:mt-0">
              ₹{Math.max(0, price - 1)}
            </span>
            {price < originalPrice && (
              <span className="text-gray-500 line-through mt-0.5">
                ₹{Math.max(0, originalPrice - 1)}
              </span>
            )}
          </div>
          <button className="w-full mt-4 sm:mt-0 sm:w-auto p-2 px-4 border-2 border-blue-800 font-bold rounded-xl text-indigo-800 hover:bg-blue-800 hover:text-white transition">
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}
