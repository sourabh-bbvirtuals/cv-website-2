import FiltersSortBar from './mobile-filter';
import FilterSidebar from './filter';

import { Suspense } from 'react';
import SortAndShow from './sort';
import { ProductCard } from '../top-products/product-card';
import { fakeCategoryProductMap } from '../topOffers/top-offers';

type Params = {
  searchParams: Promise<{
    limit?: number;
    sortBy?: any;
    page?: string;
    faculty?: string;
    category?: string;
    courseType?: string;
    batchType?: string;
    subject?: string;
    ['Attempt']?: string;
    ['Course Type']?: string;
    ['Batch Type']?: string;
    ['By Faculty']?: string;
    ['Language']?: string;
  }>;
  params: Promise<{
    countryCode: string;
  }>;
};
export default async function CourseListing(props: Params) {
  const queryParams: any = {};

  const searchParams = await props.searchParams;
  const {
    ['Attempt']: attempt = '',
    ['Course Type']: courseType = '',
    ['Batch Type']: batchType = '',
    ['By Faculty']: faculties,
    ['Language']: language,
    subject = '',
    limit,
    page,
  } = searchParams;

  if (faculties) {
    queryParams['faculty'] = faculties.split(',');
  }

  if (batchType) {
    queryParams['batchType'] = batchType.split(',');
  }

  if (courseType) {
    queryParams['courseType'] = courseType.split(',');
  }

  if (language) {
    queryParams['languages'] = language.split(',');
  }

  if (attempt) {
    queryParams['applicability'] = attempt.split(',');
  }

  if (subject) {
    queryParams['subject'] = subject.split(',');
  }

  const categories = Object.keys(fakeCategoryProductMap); // Extract category names

  return (
    <>
      {/* mobile filter and sort */}
      <div className="md:hidden my-6">{/* <FiltersSortBar /> */}</div>

      <div className="px-3 sm:px-6 md:px-8 lg:px-28 xl:px-32 md:py-10 mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block lg:w-[180px] md:w-[130px] xl:w-[200px] shrink-0">
            <FilterSidebar />
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <h1 className="lg:text-3xl ml-8 text-2xl font-semibold">
                All Courses
              </h1>
              {/* Sort and Show component */}
            </div>

            <div className="border-t hidden md:flex border-[#E8ECF4] my-6"></div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {fakeCategoryProductMap[categories[0]].map((course, index) => (
                <ProductCard
                  key={index}
                  title={course.name}
                  originalPrice={course.price}
                  price={course.price - course.discount}
                  language={course.languages?.[0] || 'Hinglish'}
                  hasBooks={course.materials?.includes('books')}
                  image={course.variants?.[0].product?.thumbnail ?? ''}
                  handle={course.variants?.[0].product?.handle || ''}
                />
              ))}
            </div>
            <div style={{ height: '50px' }}></div>
          </div>
        </div>
      </div>
    </>
  );
}
