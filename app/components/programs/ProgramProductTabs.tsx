import React, { useState, useEffect } from 'react';

interface ProgramProductTabsProps {
  products: {
    id: string;
    slug: string;
    description: string;
    abbreviation?: string;
    name?: string;
  }[];
}

export function ProgramProductTabs({ products }: ProgramProductTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Function to sanitize and style HTML content
  const sanitizeAndStyleHTML = (html: string) => {
    if (!html) return '';
    
    return html
      // Headings
      .replace(/<h1[^>]*>/g, '<h1 class="text-xl font-semibold mb-3">')
      .replace(/<h2[^>]*>/g, '<h2 class="text-lg font-semibold mb-2">')
      .replace(/<h3[^>]*>/g, '<h3 class="text-base font-semibold mb-2">')
      .replace(/<h4[^>]*>/g, '<h4 class="text-sm font-semibold mb-2">')
      .replace(/<h5[^>]*>/g, '<h5 class="text-sm font-semibold mb-2">')
      .replace(/<h6[^>]*>/g, '<h6 class="text-sm font-semibold mb-2">')
      
      // Paragraphs
      .replace(/<p[^>]*>/g, '<p class="text-sm mb-3">')
      
      // Lists
      .replace(/<ul[^>]*>/g, '<ul class="list-disc list-inside text-sm mb-3 ml-4">')
      .replace(/<ol[^>]*>/g, '<ol class="list-decimal list-inside text-sm mb-3 ml-4">')
      .replace(/<li[^>]*>/g, '<li class="text-sm">')
      
      // Text formatting
      .replace(/<strong[^>]*>/g, '<strong class="font-semibold">')
      .replace(/<b[^>]*>/g, '')
      .replace(/<\/b>/g, '')
      .replace(/<em[^>]*>/g, '<em class="italic">')
      .replace(/<i[^>]*>/g, '<i class="italic">')
      
      // Links
      .replace(/<a[^>]*>/g, '<a class="text-indigo-600 underline">')
      
      // Tables - Clean styling matching the component theme
      .replace(/<table[^>]*>/g, '<div class="ring-1 ring-neutral-200 rounded-xl mb-4 overflow-hidden"><table class="w-full border-collapse">')
      .replace(/<\/table>/g, '</table></div>')
      .replace(/<th[^>]*>/g, '<th class="bg-neutral-50 border-b border-neutral-200 px-4 py-3 text-neutral-900 font-medium text-left text-sm">')
      // Handle table rows with clean styling and auto width
      .replace(/<tr[^>]*>((?:<td[^>]*>.*?<\/td>\s*){2})<\/tr>/g, (match) => {
        let cellIndex = 0;
        return match.replace(/<td[^>]*>/g, () => {
          cellIndex++;
          return `<td class="border-b border-neutral-100 px-4 py-3 text-sm text-neutral-800">`;
        });
      })
      // Add subtle hover effect for table rows
      .replace(/<tr[^>]*>/g, '<tr class="hover:bg-neutral-50/50">')
      
      // Code
      .replace(/<code[^>]*>/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">')
      .replace(/<pre[^>]*>/g, '<pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-3">');
  };

  useEffect(() => {
    if (products && products.length > 0) {
      setActiveTab(0); // Reset to first tab
    }
  }, [products]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-xl ring-1 ring-neutral-200">
      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 flex flex-wrap">
        {products.map((product, index) => (
          <button
            key={product.id}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === index
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {product.abbreviation || `Product ${index + 1}`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {products.map((product, index) => (
        <div
          key={product.id}
          className={activeTab === index ? 'block' : 'hidden'}
        >
          <div className="p-5 space-y-5">
            {/* Product Name */}
            {product.name && (
              <div className="pb-3">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {product.name}
                </h2>
              </div>
            )}
            {/* Product Description */}
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-sm text-neutral-800 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeAndStyleHTML(product.description)
                }} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

