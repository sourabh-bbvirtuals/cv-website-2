import React from 'react';
import { Link } from '@remix-run/react';
import { VendureCourse2Product } from '~/providers/course2/vendureProduct';
import { ChevronRight } from 'lucide-react';

interface ProductHeaderProps {
  product: VendureCourse2Product;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  const facultyName = product.faculties?.[0]?.name || 'Faculty';

  return (
    <nav className="flex items-center space-x-2 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-slate-500 mb-6 px-1">
      <Link to="/" className="hover:text-indigo-600 transition-colors">
        Home
      </Link>

      <span className="text-indigo-600 font-semibold truncate max-w-[200px] sm:max-w-none">
        {product.title}
      </span>
    </nav>
  );
}
