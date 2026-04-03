import { useEffect, useState } from 'react';
import {
  Link,
  useLoaderData,
  useSubmit,
  useSearchParams,
  useNavigation,
} from '@remix-run/react';
import { getCollections } from '~/providers/collections/collections';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { filteredSearchLoaderFromPagination } from '~/utils/filtered-search-loader';

// Pagination configuration
const paginationLimitMinimumDefault = 25;
const allowedPaginationLimits = new Set<number>([
  paginationLimitMinimumDefault,
  50,
  100,
]);
const { validator, filteredSearchLoader } = filteredSearchLoaderFromPagination(
  allowedPaginationLimits,
  paginationLimitMinimumDefault,
);

// Loader function
export async function loader({ request, params, context }: DataFunctionArgs) {
  try {
    // Debug: Log params
    console.log('Loader: Params:', params);

    // Fetch collections
    const collections = await getCollections(request);

    // Debug: Log collections
    console.log('Loader: Collections:', collections);

    // Get the collection slug from query parameters
    const url = new URL(request.url);
    const slugFromQuery = url.searchParams.get('slug');

    // Set collectionSlug with fallback
    const collectionSlug = slugFromQuery || collections[0]?.slug || '';

    // Debug: Log collectionSlug and params for filteredSearchLoader
    console.log('Loader: Collection Slug:', collectionSlug);
    console.log('Loader: Params for filteredSearchLoader:', {
      slug: collectionSlug,
    });

    // If no valid slug, return empty results
    if (!collectionSlug) {
      console.log('Loader: No valid slug, returning empty results');
      return {
        collections,
        collectionSlug: '',
        result: { search: { items: [] } },
        resultWithoutFacetValueFilters: { search: { items: [] } },
        facetValueIds: [],
        appliedPaginationLimit: paginationLimitMinimumDefault,
        appliedPaginationPage: 1,
        term: '',
      };
    }

    // Fetch products using filteredSearchLoader
    const searchResults = await filteredSearchLoader({
      params: { slug: collectionSlug },
      request,
      context,
    });

    // Debug: Log search results
    console.log('Loader: Search Results:', searchResults);

    // Ensure response is structured correctly
    const response = {
      collections,
      collectionSlug,
      ...searchResults,
    };
    console.log('Loader: Returning Response:', response);
    return response;
  } catch (error) {
    console.error('Loader Error:', error);
    throw new Response('Error loading data', { status: 500 });
  }
}

// Component
export default function TopProducts() {
  const loaderData = useLoaderData<typeof loader>();
  const { collections, collectionSlug, result } = loaderData;

  // Debug: Log loader data
  console.log('Component: Loader Data:', loaderData);
  console.log('Component: Collection Slug:', collectionSlug);

  // Set default selectedCategory
  const defaultCategory =
    collections.find((c) => c.slug === collectionSlug)?.name ||
    collections[0]?.name ||
    'No Category';
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  // Update selected category when collectionSlug changes
  useEffect(() => {
    const selectedCollection = collections.find(
      (c) => c.slug === collectionSlug,
    );
    if (selectedCollection) {
      setSelectedCategory(selectedCollection.name);
    } else {
      setSelectedCategory(collections[0]?.name || 'No Category');
    }
    console.log('Component: Selected Category:', selectedCategory);
  }, [collectionSlug, collections]);

  // Handle category button click
  const handleCategoryClick = (slug: string, name: string) => {
    setSelectedCategory(name);
    // Update URL query parameter to trigger loader
    const formData = new FormData();
    formData.append('slug', slug);
    console.log('Component: Submitting FormData with slug:', slug);
    submit(formData, {
      method: 'get',
      action: '.', // Submit to current route
      replace: true, // Avoid adding to browser history
      preventScrollReset: true,
    });
  };

  return (
    <div className="py-8 px-4 md:px-6 bg-lightGray">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Explore Top CA Courses</h1>
          {collections.length > 0 ? (
            <div className="flex md:justify-center md:items-center overflow-x-auto whitespace-nowrap scrollbar-hide mb-4">
              <div className="flex gap-3 px-2">
                {collections.map((collection) => (
                  <button
                    key={collection.slug}
                    onClick={() =>
                      handleCategoryClick(collection.slug, collection.name)
                    }
                    className={`border p-2 px-4 rounded-xl font-medium ${
                      selectedCategory === collection.name
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'hover:bg-gray-200'
                    }`}
                    aria-selected={selectedCategory === collection.name}
                    aria-label={`Select ${collection.name} category`}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No categories available.</p>
          )}
        </div>

        {/* Loading State */}
        {navigation.state === 'loading' && (
          <p className="text-center text-gray-500">Loading products...</p>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link to="/courses">
            <button className="font-medium w-28 p-2 rounded-xl bg-indigo-600 text-white">
              View all
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Error Boundary
export function CatchBoundary() {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold">Error loading data</h2>
      <p>Please try again later.</p>
    </div>
  );
}
