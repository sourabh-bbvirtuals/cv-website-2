import { ProductCard } from './ProductCard';
import { BookProductCard } from './BookProductCard';
import { ProductListItem } from '~/providers/products';

interface ProductGridProps {
  products: ProductListItem[];
  isFiltering: boolean;
  gridFacets: string[];
  coverImage?: boolean;
  onProductNavigation: (productSlug: string, newTab: boolean) => void;
  collectionName?: string;
  onClearFilters: () => void;
}

export function ProductGrid({
  products,
  isFiltering,
  gridFacets,
  coverImage = false,
  onProductNavigation,
  collectionName = 'products',
  onClearFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-500 text-lg font-medium mb-2">
          No {collectionName.toLowerCase()} found with current filters
        </div>
        <div className="text-slate-400 text-sm mb-4">
          We have {collectionName.toLowerCase()} available, but none match your current
          filters. Try adjusting your filters or clear all filters to see all available
          {collectionName.toLowerCase()}.
        </div>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isFiltering && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg border">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <span className="text-sm font-medium text-slate-700">
              Filtering {collectionName.toLowerCase()}...
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 sm:gap-8">
        {products
          ?.map((product) => {
            // Ensure required props are present
            if (!product?.id || !product?.slug) {
              console.warn(
                'Product missing required fields:',
                product,
              );
              return null;
            }
            console.log('🔍 Product image:', product.image);
            
            // Check if product is a book
            const productTypeFacet = product.productFacets?.find(
              (facet) =>
                facet.code.toLowerCase() === 'product-type' ||
                facet.name.toLowerCase() === 'product type'
            );
            
            const productTypeValue = productTypeFacet?.values?.[0]?.name?.toLowerCase() || '';
            const isBook = productTypeValue.includes('book');
            
            // Render BookProductCard for books, regular ProductCard for others
            if (isBook) {
              return (
                <BookProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  image={product.image}
                  price={product.price}
                  currency={product.currency}
                  pricing={product.pricing}
                  faculty={product.faculty}
                  productFacets={product.productFacets}
                  totalDiscount={product.totalDiscount}
                  sellerSku={product.sellerSku}
                  onBuyNow={(newTab) =>
                    onProductNavigation(product.slug, newTab)
                  }
                />
              );
            }
            
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                image={product.image}
                price={product.price}
                currency={product.currency}
                pricing={product.pricing}
                faculty={product.faculty}
                productFacets={product.productFacets}
                sellerSku={product.sellerSku}
                orderNumber={product.orderNumber}
                isFeatured={product.isFeatured}
                totalDiscount={product.totalDiscount}
                gridFacets={gridFacets}
                coverImage={coverImage}
                onBuyNow={(newTab) =>
                  onProductNavigation(product.slug, newTab)
                }
              />
            );
          })
          .filter(Boolean)}
      </div>
    </div>
  );
}
