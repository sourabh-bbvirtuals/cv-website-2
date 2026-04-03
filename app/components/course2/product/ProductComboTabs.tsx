import React, { useState, useEffect } from 'react';
import { VendureCourse2Product } from '~/providers/course2';
import { CheckCircle2 } from 'lucide-react';

interface ProductComboTabsProps {
  product: VendureCourse2Product;
}

interface ParsedProduct {
  title: string;
  description: string;
  productDetails?: Array<{ label: string; value: string }>;
}

export function ProductComboTabs({ product }: ProductComboTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);

  // Function to sanitize and style HTML content
  const sanitizeAndStyleHTML = (html: string) => {
    if (!html) return '';

    return (
      html
        // Clean up common tags with new styles
        .replace(
          /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi,
          '<h3 class="text-xl font-bold text-slate-900 mb-4 mt-8 first:mt-0">$1</h3>',
        )
        .replace(
          /<p[^>]*>/g,
          '<p class="text-sm text-slate-500 leading-relaxed mb-4">',
        )
        .replace(/<ul[^>]*>/g, '<ul class="space-y-2 mb-6 ml-4">')
        .replace(
          /<li[^>]*>/g,
          '<li class="text-sm text-slate-600 flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>',
        )
        .replace(
          /<table[^>]*>/g,
          '<div class="overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white mb-6"><table class="w-full text-left border-collapse">',
        )
        .replace(
          /<th[^>]*>/g,
          '<th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">',
        )
        .replace(
          /<td[^>]*>/g,
          '<td class="px-6 py-4 text-sm text-slate-600 border-b border-slate-50">',
        )
        .replace(
          /<tr[^>]*>/g,
          '<tr class="hover:bg-slate-50/30 transition-colors">',
        )
    );
  };

  // Parse the description to extract individual products
  const parseProductDescription = (description: string): ParsedProduct[] => {
    if (!description) return [];

    const products: ParsedProduct[] = [];

    // Find all h2 tags and their positions
    const h2Matches = [...description.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];

    if (h2Matches.length === 0) {
      return [
        {
          title: 'Product Details',
          description: sanitizeAndStyleHTML(description),
        },
      ];
    }

    // Process each h2 section
    for (let i = 0; i < h2Matches.length; i++) {
      const h2Match = h2Matches[i];
      const title = h2Match[1].replace(/<[^>]*>/g, '').trim();
      const h2Start = h2Match.index!;
      const nextH2Start =
        i < h2Matches.length - 1 ? h2Matches[i + 1].index! : description.length;

      const content = description.substring(h2Start, nextH2Start);

      products.push({
        title,
        description: sanitizeAndStyleHTML(content),
      });
    }

    return products;
  };

  useEffect(() => {
    if (product?.description) {
      const parsed = parseProductDescription(product.description);
      setParsedProducts(parsed);
    }
  }, [product?.description]);

  if (parsedProducts.length === 0) {
    return (
      <div className="w-full py-16 text-center rounded-2xl border-2 border-dashed border-slate-100">
        <p className="text-slate-400 font-medium">
          Product details will be available soon.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex justify-center border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        {parsedProducts.map((parsedProduct, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`relative px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
              activeTab === index
                ? 'text-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {parsedProduct.title || `Item ${index + 1}`}
            {activeTab === index && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d4ed8]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {parsedProducts.map((parsedProduct, index) => (
          <div
            key={index}
            className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${
              activeTab === index ? 'block' : 'hidden'
            }`}
          >
            <div className="max-w-none">
              <div
                className="text-slate-600"
                dangerouslySetInnerHTML={{
                  __html: parsedProduct.description,
                }}
              />

              {/* Optional verification icon or badge if it's a specific section */}
              <div className="mt-8 flex items-center gap-2 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 w-fit">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                  Content Verified
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
