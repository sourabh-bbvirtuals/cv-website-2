import { createPortal } from 'react-dom';
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/react-dom';
import { Link, useRouteLoaderData, useSearchParams } from '@remix-run/react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CourseCard } from '../new-homepage/CourseCard';
import { useBoardSelection } from '~/context/BoardSelectionContext';

// --- Types ---
export type FeaturedCourse = {
  id: string;
  title: string;
  slug: string;
  meta: string[];
  enrolled: string;
  image: string;
  imageBg: string;
  imageClass?: string;
  badge?: string;
  starts: string;
  ends: string;
  price: string;
  wasPrice: string;
  language: string;
  lectureMode: string;
  faculty: string;
  subject: string;
};

const IMG_PLACEHOLDER_FACULTY =
  'https://www.figma.com/api/mcp/asset/c51ee749-b11f-47ae-84c9-3e122e6b9053';

// --- Mapping Logic ---
function mapVendureToFeaturedCourse(product: any): FeaturedCourse {
  if (!product) return {} as FeaturedCourse; // Should not happen but safe check

  // 1. Extract specs from product customFields (Staging has it here)
  let specs: any[] = [];
  try {
    const customDataRaw = product.customFields?.customData;
    if (customDataRaw) {
      const parsed =
        typeof customDataRaw === 'string'
          ? JSON.parse(customDataRaw)
          : customDataRaw;
      // Staging JSON structure: { "specifications": { "product": [...] } }
      const specsObj = parsed.specifications || {};
      specs = Array.isArray(specsObj.product) ? specsObj.product : [];
    }
  } catch (e) {
    console.error('Error parsing customData for', product.name, e);
  }

  const courseInfo =
    specs.find(
      (s) => s && (s.identifier === 'course_info' || s.name === 'Course Info'),
    ) || {};
  const table = courseInfo?.table || {};

  // 2. Extract price — use minimum variant price for listings
  const variants = product.variants || [];
  const variant = variants[0];
  const minPrice = variants.reduce(
    (min: number, v: any) =>
      v?.priceWithTax != null && v.priceWithTax < min ? v.priceWithTax : min,
    variants[0]?.priceWithTax ?? 0,
  );
  const priceVal = minPrice / 100;

  // 3. Facets mapping — group-aware
  const facetValues = (product.facetValues || []) as Array<{
    name: string;
    facet?: { name: string };
  }>;
  const facetNames = facetValues.map((fv) => fv?.name).filter(Boolean);

  const byGroup = (group: string) =>
    facetValues
      .filter((fv) => fv?.facet?.name?.toLowerCase() === group.toLowerCase())
      .map((fv) => fv.name);

  const languageFacets = byGroup('language');
  const language = languageFacets[0] || '';

  const lectureModeFacets = byGroup('lecture mode');
  const lectureMode = lectureModeFacets[0] || '';

  const facultyFacets = byGroup('faculty');
  const faculty = facultyFacets[0] || '';

  const subjectFacets = byGroup('subject');
  const subject = subjectFacets[0] || '';

  const meta: string[] = [...facetNames];

  return {
    id: String(product.id || Math.random()),
    title: product.name || 'Untitled Course',
    slug: product.slug || '',
    meta,
    enrolled: '1240+ Students Enrolled',
    image:
      product.featuredAsset?.preview ||
      variant?.featuredAsset?.preview ||
      IMG_PLACEHOLDER_FACULTY,
    imageBg: '#f0f4ff',
    starts: table['Start Date'] || 'TBA',
    ends: table['End Date'] || 'TBA',
    price: `₹${priceVal.toLocaleString('en-IN')}`,
    wasPrice: '',
    language,
    lectureMode,
    faculty,
    subject,
  };
}

const AVATAR_BG_PALETTE = [
  '#6e93ff',
  '#e8967f',
  '#a6a0f5',
  '#8aadd4',
  '#a4ffca',
  '#f5a0ad',
  '#ffc78e',
  '#b5e6a3',
  '#d4a6f5',
  '#8ed4c8',
];

// --- Sub-components ---

// function CourseCard({ course }: { course: FeaturedCourse }) {
//   const detailTo = `/our-courses/${course.slug}`;

//   return (
//     <Link
//       to={detailTo}
//       className="block h-full rounded-[20px] text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2962ff] focus-visible:ring-offset-2"
//     >
//       <article className="flex h-full flex-col bg-white border border-[rgba(8,22,39,0.1)] rounded-[20px] overflow-hidden shadow-[0px_4px_8px_0px_rgba(0,0,0,0.03),0px_15px_15px_0px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1">
//         <div className="p-[15px] pb-0 flex flex-col gap-3">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1 text-sm leading-none font-medium text-lightgray">
//               {course.language}
//             </span>
//             <span
//               className={`flex items-center gap-1 rounded-full text-lightgray border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1 text-sm leading-none font-medium ${course.type}`}
//             >
//               {course.type === 'Live' ? (
//                 <span className="inline-block size-2 rounded-full bg-[#535150]" />
//               ) : (
//                 <svg
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                   aria-hidden
//                 >
//                   <path
//                     d="M15.7356 4.5625C15.6559 4.51976 15.5661 4.49946 15.4757 4.50375C15.3853 4.50804 15.2978 4.53677 15.2225 4.58687L13 6.06563V4.5C13 4.23478 12.8946 3.98043 12.7071 3.79289C12.5196 3.60536 12.2652 3.5 12 3.5H2C1.73478 3.5 1.48043 3.60536 1.29289 3.79289C1.10536 3.98043 1 4.23478 1 4.5V11.5C1 11.7652 1.10536 12.0196 1.29289 12.2071C1.48043 12.3946 1.73478 12.5 2 12.5H12C12.2652 12.5 12.5196 12.3946 12.7071 12.2071C12.8946 12.0196 13 11.7652 13 11.5V9.9375L15.2225 11.4194C15.305 11.473 15.4016 11.501 15.5 11.5C15.6326 11.5 15.7598 11.4473 15.8536 11.3536C15.9473 11.2598 16 11.1326 16 11V5C15.9994 4.91004 15.9745 4.82191 15.9279 4.74491C15.8814 4.66791 15.815 4.60489 15.7356 4.5625ZM12 11.5H2V4.5H12V11.5ZM15 10.0656L13 8.7325V7.2675L15 5.9375V10.0656Z"
//                     fill="#081627"
//                   />
//                 </svg>
//               )}
//               {course.type}
//             </span>
//           </div>
//           <div className="flex flex-col gap-2">
//             <h3 className="font-semibold text-xl text-lightgray leading-[120%] line-clamp-1">
//               {course.title}
//             </h3>
//           </div>
//         </div>

//         <div className="px-[15px] pt-3">
//           <div
//             className="relative h-[240px] rounded-2xl overflow-hidden"
//             style={{ backgroundColor: course.imageBg }}
//           >
//             <img
//               src={course.image}
//               alt={course.title}
//               className="absolute inset-0 h-full w-full object-cover object-top"
//             />
//             {course.badge && (
//               <div className="absolute left-3 top-3 flex items-center rounded-full border border-[rgba(8,22,39,0.1)] bg-white/80 backdrop-blur-sm px-3 py-1.5 shadow-sm">
//                 <span className="text-sm font-semibold text-lightgray leading-[1.2]">
//                   {course.badge}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="mt-4 border-t border-[rgba(8,22,39,0.1)] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 bg-white">
//           <div className="flex-1 space-y-2 sm:space-y-4 text-sm leading-[1.2] text-lightgray min-w-0 p-4 pb-0 sm:pb-4">
//             <div className="flex sm:gap-0.5 justify-between">
//               <span className="font-normal opacity-50 shrink-0">Starts on</span>
//               <span className="font-medium">{course.starts}</span>
//             </div>
//             <div className="flex sm:gap-0.5 justify-between">
//               <span className="font-normal opacity-50 shrink-0">Ends on</span>
//               <span className="font-medium">{course.ends}</span>
//             </div>
//           </div>
//           <div className="hidden sm:block w-px h-full bg-[rgba(8,22,39,0.1)] shrink-0 mx-3 min-h-[60px]" />
//           <div className="flex items-center gap-2 sm:justify-end sm:min-w-[140px] pt-0 sm:pt-4 p-4 pl-4 sm:pl-0 sm:pb-4">
//             <span className="font-bold text-xl text-lightgray leading-[1.2]">
//               {course.price}
//             </span>
//             <span className="font-medium text-sm line-through text-lightgray/40 decoration-solid">
//               {course.wasPrice}
//             </span>
//           </div>
//         </div>
//       </article>
//     </Link>
//   );
// }

// Icons
const ChevronDown = ({ isOpen }: { isOpen?: boolean }) => (
  <svg
    width="12"
    height="8"
    viewBox="0 0 12 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`ml-1 transition-transform duration-200 ease-in-out ${
      isOpen ? 'rotate-180' : ''
    }`}
  >
    <path
      d="M1 1.5L6 6.5L11 1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="10"
    height="8"
    viewBox="0 0 10 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 4L3.5 6.5L9 1"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function FilterDropdown({
  label,
  children,
  isOpen,
  onOpenChange,
  align = 'left',
  triggerClassName = '',
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  align?: 'left' | 'right';
  triggerClassName?: string;
}) {
  const { x, y, strategy, refs } = useFloating({
    open: isOpen,
    onOpenChange,
    placement: align === 'left' ? 'bottom-start' : 'bottom-end',
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        refs.reference.current &&
        !refs.reference.current.contains(event.target as Node) &&
        refs.floating.current &&
        !refs.floating.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange, refs]);

  return (
    <div className="shrink-0">
      <button
        ref={refs.setReference}
        onClick={() => onOpenChange(!isOpen)}
        className={triggerClassName}
      >
        {label}
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}

// --- Main Exported Component ---
export default function CourseListings({
  products = [],
}: {
  products?: any[];
}) {
  const [searchParams] = useSearchParams();
  const urlBoard = searchParams.get('board') || '';
  const urlClass = searchParams.get('class') || '';
  const { selectedSlug, boardOptions, setSelectedBoard } = useBoardSelection();
  const rootData = useRouteLoaderData('root') as any;
  const isLoggedIn = !!rootData?.activeCustomer?.activeCustomer;
  const selectedBoard = isLoggedIn
    ? undefined
    : boardOptions.find((o) => o.slug === selectedSlug);

  const allCourses = useMemo(
    () => products.map(mapVendureToFeaturedCourse),
    [products],
  );

  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    allCourses.forEach((c) => {
      if (c.subject) set.add(c.subject);
    });
    return Array.from(set).sort();
  }, [allCourses]);

  const facultyOptions = useMemo(() => {
    const set = new Set<string>();
    allCourses.forEach((c) => {
      if (c.faculty) set.add(c.faculty);
    });
    return Array.from(set).sort();
  }, [allCourses]);

  const languageOptions = useMemo(() => {
    const set = new Set<string>();
    allCourses.forEach((c) => {
      if (c.language) set.add(c.language);
    });
    return Array.from(set).sort();
  }, [allCourses]);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  // Detect window size for mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // States for all filters
  const [selectedSort, setSelectedSort] = useState<string>('Relevant');
  const [selectedPricing, setSelectedPricing] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string>('');
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);

  const filterScrollRef = useRef<HTMLDivElement>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);

  // Dropdowns remain open on scroll to stay anchored to the respective filters

  const handleResetFilters = () => {
    setSelectedSort('Relevant');
    setSelectedPricing('All');
    setSelectedLanguage([]);
    setSelectedSubjects('');
    setSelectedFaculties([]);
    setActiveModal(null);
  };

  const mappedCourses = useMemo(() => {
    let filtered = [...allCourses];

    const filterBoard = urlBoard || selectedBoard?.board || '';
    const rawClass = urlClass || selectedBoard?.class || '';

    const classMap: Record<string, string> = {
      'class 11': 'xi',
      'class 12': 'xii',
      xi: 'xi',
      xii: 'xii',
    };
    const filterClass = classMap[rawClass.toLowerCase()] || rawClass;

    if (filterBoard || filterClass) {
      filtered = filtered.filter((course) => {
        const facets = course.meta;
        const matchBoard =
          !filterBoard ||
          facets.some((f) => f.toLowerCase() === filterBoard.toLowerCase());
        const matchClass =
          !filterClass ||
          facets.some((f) => f.toLowerCase() === filterClass.toLowerCase());
        return matchBoard && matchClass;
      });
    }

    if (selectedLanguage.length > 0) {
      filtered = filtered.filter((course) =>
        selectedLanguage.includes(course.language),
      );
    }

    if (selectedSubjects) {
      filtered = filtered.filter(
        (course) => course.subject === selectedSubjects,
      );
    }

    if (selectedFaculties.length > 0) {
      filtered = filtered.filter((course) =>
        selectedFaculties.includes(course.faculty),
      );
    }

    if (selectedPricing && selectedPricing !== 'All') {
      filtered = filtered.filter((course) => {
        const priceStr = course.price.replace(/[₹,]/g, '');
        const price = parseFloat(priceStr);
        if (selectedPricing === 'Free') return price === 0;
        if (selectedPricing === 'Paid') return price > 0;
        return true;
      });
    }

    if (selectedSort === 'Most Popular') {
      filtered.sort((a, b) => {
        const aCount = parseInt(a.enrolled.replace(/\D/g, '')) || 0;
        const bCount = parseInt(b.enrolled.replace(/\D/g, '')) || 0;
        return bCount - aCount;
      });
    } else if (selectedSort === 'Price (High-Low)') {
      filtered.sort((a, b) => {
        const aPrice = parseFloat(a.price.replace(/[₹,]/g, ''));
        const bPrice = parseFloat(b.price.replace(/[₹,]/g, ''));
        return bPrice - aPrice;
      });
    } else if (selectedSort === 'Price (Low-High)') {
      filtered.sort((a, b) => {
        const aPrice = parseFloat(a.price.replace(/[₹,]/g, ''));
        const bPrice = parseFloat(b.price.replace(/[₹,]/g, ''));
        return aPrice - bPrice;
      });
    }

    return filtered;
  }, [
    allCourses,
    urlBoard,
    urlClass,
    selectedBoard,
    selectedLanguage,
    selectedSubjects,
    selectedFaculties,
    selectedPricing,
    selectedSort,
  ]);

  const getBtnClass = (isActive: boolean) =>
    `flex items-center justify-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-gray-700 border text-base font-medium transition-colors justify-between sm:justify-start w-full sm:w-auto whitespace-nowrap ${
      isActive
        ? 'bg-lightgray text-white border-lightgray'
        : 'bg-white text-lightgray border-lightgray/10 hover:bg-lightgray/5'
    }`;

  // Close any open dropdown when clicking outside the filter bar
  useEffect(() => {
    if (!activeModal) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterScrollRef.current &&
        !filterScrollRef.current.contains(e.target as Node)
      ) {
        setActiveModal(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeModal]);

  return (
    <section className="w-full bg-white py-4 lg:py-8 4xl:py-16!">
      <div className="custom-container">
        {/* {activeModal && (
          <button
            type="button"
            aria-label="Close filter modal"
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          />
        )} */}

        {/* desktop filters */}
        {/* <div
          className="sticky top-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 z-20 mb-2 md:mb-4 bg-white py-4"
          ref={desktopFilterRef}
        > */}
        <div
          className="sticky top-0 z-20 mb-4 py-3 sm:py-4 backdrop-blur-xs bg-white"
          ref={filtersContainerRef}
        >
          <div className="custom-container flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 lg:block">
              <span className="font-semibold text-lightgray text-lg sm:text-2xl whitespace-nowrap">
                {mappedCourses.length} Courses
              </span>

              <button
                onClick={handleResetFilters}
                className="text-sm sm:text-base font-medium text-lightgray/60 hover:text-lightgray transition-colors cursor-pointer lg:hidden whitespace-nowrap"
              >
                Reset
              </button>
            </div>

            <div
              className="relative scrollbar-hide overflow-x-auto overflow-y-visible flex items-center gap-2 sm:gap-3 md:gap-3 sm:flex-wrap"
              ref={filterScrollRef}
            >
              {/* Board Selector — visible for guests */}
              {!isLoggedIn && boardOptions.length > 0 && (
                <FilterDropdown
                  isOpen={activeModal === 'board'}
                  onOpenChange={(open) => setActiveModal(open ? 'board' : null)}
                  triggerClassName={getBtnClass(activeModal === 'board')}
                  label={
                    <>
                      <span className="font-semibold text-sm sm:text-base">
                        {selectedBoard
                          ? `${selectedBoard.class} · ${selectedBoard.board}`
                          : 'All Boards'}
                      </span>
                      <ChevronDown isOpen={activeModal === 'board'} />
                    </>
                  }
                >
                  <div className="min-w-[200px] w-max rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedBoard('');
                        setActiveModal(null);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm lg:text-base font-medium transition-colors flex items-center justify-between ${
                        !selectedSlug
                          ? 'bg-lightgray/5 text-lightgray font-medium'
                          : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                      }`}
                    >
                      All Boards
                      {!selectedSlug && <CheckIcon />}
                    </button>
                    <div className="border-t border-lightgray/10" />
                    {boardOptions.map((item) => (
                      <button
                        key={item.slug}
                        onClick={() => {
                          setSelectedBoard(item.slug);
                          setActiveModal(null);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm lg:text-base font-medium transition-colors flex items-center justify-between ${
                          selectedSlug === item.slug
                            ? 'bg-lightgray/5 text-lightgray font-medium'
                            : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                        }`}
                      >
                        {item.class} · {item.board} Board
                        {selectedSlug === item.slug && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>
              )}
              <FilterDropdown
                isOpen={activeModal === 'sort'}
                onOpenChange={(open) => setActiveModal(open ? 'sort' : null)}
                triggerClassName={getBtnClass(activeModal === 'sort')}
                label={
                  <>
                    <span className="hidden sm:inline">Sort By:&nbsp;</span>
                    <span className="font-semibold text-sm sm:text-base">
                      {selectedSort || 'Relevant'}
                    </span>
                    <ChevronDown isOpen={activeModal === 'sort'} />
                  </>
                }
              >
                <div className="min-w-[180px] w-fit sm:w-max rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                  {[
                    'Relevant',
                    'Most Popular',
                    'Price (High-Low)',
                    'Price (Low-High)',
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedSort(opt);
                        setActiveModal(null);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm lg:text-base font-medium transition-colors ${
                        selectedSort === opt
                          ? 'bg-lightgray/5 text-lightgray font-medium'
                          : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </FilterDropdown>

              <FilterDropdown
                isOpen={activeModal === 'subjects'}
                onOpenChange={(open) =>
                  setActiveModal(open ? 'subjects' : null)
                }
                triggerClassName={getBtnClass(activeModal === 'subjects')}
                align="right"
                label={
                  <>
                    {selectedSubjects ? (
                      <span className="font-semibold text-sm sm:text-base">
                        {selectedSubjects}
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base">Subjects</span>
                    )}
                    <ChevronDown isOpen={activeModal === 'subjects'} />
                  </>
                }
              >
                <div className="min-w-[180px] w-max rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedSubjects('');
                      setActiveModal(null);
                    }}
                    className={`w-full text-left px-5 py-2.5 text-sm lg:text-base font-medium transition-colors flex items-center justify-between ${
                      !selectedSubjects
                        ? 'bg-lightgray/5 text-lightgray font-medium'
                        : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                    }`}
                  >
                    All Subjects
                    {!selectedSubjects && <CheckIcon />}
                  </button>
                  <div className="border-t border-lightgray/10" />
                  <div className="max-h-[300px] overflow-y-auto">
                    {subjectOptions.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => {
                          setSelectedSubjects(subject);
                          setActiveModal(null);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm lg:text-base font-medium transition-colors flex items-center justify-between ${
                          selectedSubjects === subject
                            ? 'bg-lightgray/5 text-lightgray font-medium'
                            : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                        }`}
                      >
                        {subject}
                        {selectedSubjects === subject && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                </div>
              </FilterDropdown>

              <FilterDropdown
                isOpen={activeModal === 'faculty'}
                onOpenChange={(open) => setActiveModal(open ? 'faculty' : null)}
                triggerClassName={getBtnClass(activeModal === 'faculty')}
                align="right"
                label={
                  <>
                    <span className="text-sm sm:text-base">Faculty</span>
                    <ChevronDown isOpen={activeModal === 'faculty'} />
                  </>
                }
              >
                <div className="min-w-[200px] w-max rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                  <button
                    onClick={() => setSelectedFaculties([])}
                    className={`w-full text-left px-4 py-3 text-sm lg:text-base font-medium transition-colors flex items-center gap-3 ${
                      selectedFaculties.length === 0
                        ? 'bg-lightgray/5 text-lightgray font-medium'
                        : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                    }`}
                  >
                    <div
                      className={`md:w-5 md:h-5 w-4 h-4 rounded-sm border flex items-center justify-center ${
                        selectedFaculties.length === 0
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-lightgray/30 bg-white'
                      }`}
                    >
                      {selectedFaculties.length === 0 && <CheckIcon />}
                    </div>
                    <span>All</span>
                  </button>
                  <div className="border-t border-lightgray/10" />
                  <div className="max-h-[300px] overflow-y-auto">
                    {facultyOptions.map((faculty, idx) => (
                      <button
                        key={faculty}
                        onClick={() =>
                          setSelectedFaculties((prev) =>
                            prev.includes(faculty)
                              ? prev.filter((f) => f !== faculty)
                              : [...prev, faculty],
                          )
                        }
                        className={`w-full text-left px-4 py-2 text-xs sm:text-sm lg:text-base font-medium transition-colors flex items-center gap-3 ${
                          selectedFaculties.includes(faculty)
                            ? 'bg-lightgray/5 text-lightgray font-medium'
                            : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                        }`}
                      >
                        <div
                          className={`md:w-5 md:h-5 w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                            selectedFaculties.includes(faculty)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-lightgray/30 bg-white'
                          }`}
                        >
                          {selectedFaculties.includes(faculty) && <CheckIcon />}
                        </div>
                        <div
                          className="md:w-7 md:h-7 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{
                            backgroundColor:
                              AVATAR_BG_PALETTE[idx % AVATAR_BG_PALETTE.length],
                          }}
                        >
                          {faculty
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <span>{faculty}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </FilterDropdown>

              <FilterDropdown
                isOpen={activeModal === 'language'}
                onOpenChange={(open) =>
                  setActiveModal(open ? 'language' : null)
                }
                triggerClassName={getBtnClass(activeModal === 'language')}
                align="right"
                label={
                  <>
                    {selectedLanguage.length > 0 ? (
                      <span className="font-semibold flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <span className="hidden sm:inline">Language</span>
                        <span className="sm:hidden">Lang</span>
                        <span className="text-white text-xs bg-blue-500 px-2.5 py-1 rounded-full">
                          {selectedLanguage.length}
                        </span>
                      </span>
                    ) : (
                      <span className="hidden sm:inline text-sm sm:text-base">
                        Language
                      </span>
                    )}
                    {selectedLanguage.length === 0 && (
                      <span className="sm:hidden text-sm">Lang</span>
                    )}
                    <ChevronDown isOpen={activeModal === 'language'} />
                  </>
                }
              >
                <div className="min-w-[180px] w-max rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                  <button
                    onClick={() => setSelectedLanguage([])}
                    className={`w-full text-left px-4 py-2 text-sm lg:text-base font-medium transition-colors flex items-center gap-3 ${
                      selectedLanguage.length === 0
                        ? 'bg-lightgray/5 text-lightgray font-medium'
                        : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                    }`}
                  >
                    <div
                      className={`md:w-5 md:h-5 w-4 h-4 rounded-sm border flex items-center justify-center ${
                        selectedLanguage.length === 0
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-lightgray/30 bg-white'
                      }`}
                    >
                      {selectedLanguage.length === 0 && <CheckIcon />}
                    </div>
                    <span>All</span>
                  </button>
                  <div className="border-t border-lightgray/10" />
                  <div className="max-h-[300px] overflow-y-auto">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang}
                        onClick={() =>
                          setSelectedLanguage((prev) =>
                            prev.includes(lang)
                              ? prev.filter((l) => l !== lang)
                              : [...prev, lang],
                          )
                        }
                        className={`w-full text-left px-4 py-2 text-xs sm:text-sm lg:text-base font-medium transition-colors flex items-center gap-3 ${
                          selectedLanguage.includes(lang)
                            ? 'bg-lightgray/5 text-lightgray font-medium'
                            : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                        }`}
                      >
                        <div
                          className={`md:w-5 md:h-5 w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                            selectedLanguage.includes(lang)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-lightgray/30 bg-white'
                          }`}
                        >
                          {selectedLanguage.includes(lang) && <CheckIcon />}
                        </div>
                        <span>{lang}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </FilterDropdown>

              <FilterDropdown
                isOpen={activeModal === 'pricing'}
                onOpenChange={(open) => setActiveModal(open ? 'pricing' : null)}
                triggerClassName={getBtnClass(activeModal === 'pricing')}
                align="right"
                label={
                  <>
                    <span className="text-sm sm:text-base">
                      {selectedPricing ? `${selectedPricing}` : 'Pricing'}
                    </span>
                    <ChevronDown isOpen={activeModal === 'pricing'} />
                  </>
                }
              >
                <div className="min-w-[120px] w-fit sm:w-max rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                  {['All', 'Free', 'Paid'].map((price) => (
                    <button
                      key={price}
                      onClick={() => {
                        setSelectedPricing(price);
                        setActiveModal(null);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm lg:text-base font-medium transition-colors ${
                        selectedPricing === price
                          ? 'bg-lightgray/5 text-lightgray font-medium'
                          : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </FilterDropdown>

              <button
                onClick={handleResetFilters}
                className="hidden sm:block text-base font-medium text-lightgray/60 hover:text-lightgray px-2 ml-2 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {mappedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl font-semibold text-lightgray/70">
              No courses found
            </p>
            <p className="mt-2 text-base text-lightgray/50">
              Try changing the filters or selecting a different board.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-6 py-2.5 rounded-full bg-lightgray text-white font-medium text-sm hover:bg-lightgray/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center md:grid gap-4 sm:gap-6  md:px-4 md:grid-cols-2 lg:grid-cols-3">
            {mappedCourses.map((course) => {
              const isPrimary = course.id === '1';
              const detailTo = `/our-courses/${course.slug}`;
              return (
                <Link
                  to={detailTo}
                  className="block h-full rounded-[20px] text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2962ff] focus-visible:ring-offset-2"
                >
                  <article className="flex h-full flex-col bg-white border border-[rgba(8,22,39,0.1)] rounded-[12px] shadow-xs md:shadow-md w-[334.5px] h-[354px] md:w-[390px] md:h-[456px]">
                    {/* Top Header */}
                    <div className="flex flex-col justify-between h-full">
                      <div className="p-[15px] pb-0 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-lightgray/80">
                          {course.language && (
                            <span className="rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1 text-sm leading-none font-medium text-[#081627CC]/90">
                              {course.language}
                            </span>
                          )}
                          {course.lectureMode && (
                            <span className="flex items-center gap-1 rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1 text-sm leading-none font-medium text-[#081627CC]/90">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden
                              >
                                <path
                                  d="M15.7356 4.5625C15.6559 4.51976 15.5661 4.49946 15.4757 4.50375C15.3853 4.50804 15.2978 4.53677 15.2225 4.58687L13 6.06563V4.5C13 4.23478 12.8946 3.98043 12.7071 3.79289C12.5196 3.60536 12.2652 3.5 12 3.5H2C1.73478 3.5 1.48043 3.60536 1.29289 3.79289C1.10536 3.98043 1 4.23478 1 4.5V11.5C1 11.7652 1.10536 12.0196 1.29289 12.2071C1.48043 12.3946 1.73478 12.5 2 12.5H12C12.2652 12.5 12.5196 12.3946 12.7071 12.2071C12.8946 12.0196 13 11.7652 13 11.5V9.9375L15.2225 11.4194C15.305 11.473 15.4016 11.501 15.5 11.5C15.6326 11.5 15.7598 11.4473 15.8536 11.3536C15.9473 11.2598 16 11.1326 16 11V5C15.9994 4.91004 15.9745 4.82191 15.9279 4.74491C15.8814 4.66791 15.815 4.60489 15.7356 4.5625ZM12 11.5H2V4.5H12V11.5ZM15 10.0656L13 8.7325V7.2675L15 5.9375V10.0656Z"
                                  fill="#081627"
                                />
                              </svg>
                              {course.lectureMode}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 mb-2">
                          <h3 className="font-medium text-base  md:text-xl text-lightgray leading-[150%]">
                            {course.title.length > 58
                              ? `${course.title.substring(0, 58)}...`
                              : course.title}
                          </h3>
                        </div>
                      </div>

                      {/* Image Container with Original Primary Logic */}
                      <div className="px-[15px] pb-3">
                        <div className="relative h-[240px] rounded-2xl bg-[#faeae5] overflow-hidden mb-0">
                          {isPrimary ? (
                            <img
                              src={course.image}
                              alt={course.title}
                              className="absolute left-1/2 top-[25px] -translate-x-1/2 h-[375px] w-[250px] max-w-none object-cover object-top"
                            />
                          ) : (
                            <img
                              src={course.image}
                              alt={course.title}
                              className="absolute inset-0 w-full h-full object-cover object-top"
                            />
                          )}
                          {course.badge && (
                            <div className="absolute left-2 top-2 flex items-center rounded-full border border-[rgba(8,22,39,0.1)] bg-white/60 backdrop-blur-sm px-2 py-1 mb-2">
                              <span className="text-sm font-medium text-lightgray/50 leading-[1.2]">
                                {course.badge}
                              </span>
                            </div>
                          )}
                          {/* {course.meta && course.meta[2] && ( */}
                          {/* <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-gray-500 px-3 py-1">
                          <span className="text-sm md:text-base font-medium text-white leading-[1.2]">
                            {course.meta[2]}
                          </span>
                        </div> */}
                          {/* )} */}
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Info Table Style */}
                    <div className="border-t border-[rgba(8,22,39,0.1)] flex flex-row items-center gap-0">
                      <div className="flex-1 space-y-2 text-sm leading-[1.2] text-lightgray min-w-0 px-3 sm:px-4 py-1 sm:py-3">
                        <div className="flex gap-0.5 justify-between">
                          <span className="font-normal text-xs md:text-sm opacity-50 shrink-0">
                            Starts on
                          </span>
                          <span className="font-medium  text-xs md:text-sm">
                            {course.starts}
                          </span>
                        </div>
                        <div className="flex gap-0.5 justify-between">
                          <span className="font-normal  text-xs md:text-sm opacity-50 shrink-0">
                            Ends on
                          </span>
                          <span className="font-medium text-xs md:text-sm">
                            {course.ends}
                          </span>
                        </div>
                      </div>
                      <div className="w-px self-stretch bg-[rgba(8,22,39,0.1)] mx-1" />{' '}
                      <div className="flex flex-col md:flex-row items-center gap-1 justify-end min-w-[120px] p-1 sm:p-2 pl-0 pb-2 sm:pb-4">
                        <span className="font-bold text-base md:text-xl text-lightgray leading-[1.2]">
                          {course.price}
                        </span>
                        {course.wasPrice && (
                          <span className="font-medium text-sm line-through text-lightgray/30 decoration-solid">
                            {course.wasPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
