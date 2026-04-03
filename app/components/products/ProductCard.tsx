import { SearchQuery } from '~/generated/graphql';
import { Link } from '@remix-run/react';
import { Price } from './Price';

export type ProductCardProps = SearchQuery['search']['items'][number];
export function ProductCard({
  productAsset,
  productName,
  slug,
  priceWithTax,
  currencyCode,
  currentProductType,
}: ProductCardProps & { currentProductType: string }) {
  return (
    <Link to={`/product/${slug}`} className="block">
      <div className="flex flex-col w-full h-full bg-white border rounded-xl max-w-xs sm:max-w-md mx-auto transition-transform duration-200 md:hover:scale-105 cursor-pointer">
        {/* Card Content */}
        <div className="flex-1 p-4">
          {/* Responsive Image */}
          <div className="relative w-full border cursor-pointer aspect-square rounded-2xl overflow-hidden">
            <img
              src={productAsset?.preview}
              alt="Product Image"
              width={1000}
              height={1000}
              loading="lazy"
              decoding="async"
              className="object-cover "
            />
          </div>

          <h3 className="font-medium text-sm lg:text-lg my-4 text-start">
            {productName}
          </h3>

          {/* Language & Books Info */}
          <div className="space-y-2 text-sm font-medium">
            <div className="border p-1.5 rounded-xl max-w-max text-start">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 whitespace-nowrap">
                  Product Type:
                </span>
                <span className="truncate">{currentProductType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-l mt-1 border-dashed border-gray-600 border-b max-w-[90%] w-full mx-auto" />

        {/* Card Footer */}
        <div className="flex flex-wrap items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-900 mt-0.5 md:mt-0">
              <Price priceWithTax={priceWithTax} currencyCode={currencyCode} />
            </span>
            {/* {price < originalPrice && <span className="text-gray-500 line-through mt-0.5">₹{originalPrice}</span>} */}
          </div>
          <button className="w-full mt-4 sm:mt-0 sm:w-auto p-2 px-4 border-2 border-blue-800 font-bold rounded-xl text-indigo-800 hover:bg-blue-800 hover:text-white transition">
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}
