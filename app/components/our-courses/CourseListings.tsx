import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from '@remix-run/react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CourseCard } from '../new-homepage/CourseCard';

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
  type: 'Live' | 'Recorded';
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

  // 2. Extract price
  const variant = (product.variants || [])[0];
  const priceVal = variant?.priceWithTax ? variant.priceWithTax / 100 : 0;
  // Calculate a fake "original" price (1.5x)
  const wasPriceVal = priceVal * 1.5;

  // 3. Facets mapping
  const facetNames = (product.facetValues || [])
    .map((fv: any) => fv?.name)
    .filter(Boolean);
  const language =
    facetNames.find((f: string) =>
      ['English', 'Hindi', 'Hinglish'].includes(f),
    ) || 'Hindi';
  const type = facetNames.includes('Recorded') ? 'Recorded' : 'Live';

  // 4. Meta (Faculty + Subject)
  const meta: string[] = [];
  // Add Faculty if available in facets or customFields (placeholder for now)
  const faculty =
    facetNames.find((f: string) => f.includes('CA ') || f.includes('Pratik')) ||
    'Expert Faculty';
  const subject =
    facetNames.find((f: string) =>
      ['Accounts', 'Economics', 'Business Studies', 'Maths'].includes(f),
    ) || 'Commerce';
  meta.push(subject, language, faculty);

  return {
    id: String(product.id || Math.random()),
    title: product.name || 'Untitled Course',
    slug: product.slug || '',
    meta,
    enrolled: '1240+ Students Enrolled', // Hardcoded placeholder
    image:
      product.featuredAsset?.preview ||
      variant?.featuredAsset?.preview ||
      IMG_PLACEHOLDER_FACULTY,
    imageBg: '#f0f4ff', // Default soft blue
    starts: table['Start Date'] || 'TBA',
    ends: table['End Date'] || 'TBA',
    price: `₹${priceVal.toLocaleString('en-IN')}`,
    wasPrice: `₹${Math.round(wasPriceVal).toLocaleString('en-IN')}`,
    language,
    type,
  };
}

const facultiesList = [
  'All',
  'CA Ankita Sanghvi',
  'CA Ashish Medicala',
  'CA Bhushal Gosar',
  'CA Mayur Sanghvi',
  'CA Payal Sanghvi',
  'Pratik Mahajan',
  'CA Roshni Manral',
  'CA Shubham Sanghvi',
  'Sanjay Apam',
];
const facultyOptions = facultiesList.filter((f) => f !== 'All');

const FACULTY_AVATAR_BY_NAME: Record<string, string> = {
  'CA Ankita Sanghvi':
    'https://www.figma.com/api/mcp/asset/8d2b07c5-7624-4e4b-aba3-e784bed8aa52',
  'CA Ashish Medicala':
    'https://www.figma.com/api/mcp/asset/68df7d69-37b9-488a-816a-1b302fed1ac6',
  'CA Bhushal Gosar':
    'https://www.figma.com/api/mcp/asset/629f57fd-1e6b-4bde-b9fe-647891af8505',
  'CA Mayur Sanghvi':
    'https://www.figma.com/api/mcp/asset/aa6f2938-93e2-4316-af10-03f60e176d12',
  'CA Payal Sanghvi':
    'https://www.figma.com/api/mcp/asset/2e264fd8-1587-4900-8e2f-bbe553403dde',
  'Pratik Mahajan':
    'https://www.figma.com/api/mcp/asset/c51ee749-b11f-47ae-84c9-3e122e6b9053',
  'CA Roshni Manral':
    'https://www.figma.com/api/mcp/asset/e59a499b-a99e-4dc5-9695-4fe0a3c1aa4e',
  'CA Shubham Sanghvi':
    'https://www.figma.com/api/mcp/asset/89bfdff4-b89e-482f-b72c-1c2eea87b2c0',
  'Sanjay Apam':
    'https://www.figma.com/api/mcp/asset/32f66e99-34b2-4f49-8f2d-c5a73362b3ec',
};

const FACULTY_AVATAR_BG_BY_NAME: Record<string, string> = {
  'CA Ankita Sanghvi': '#6e93ff',
  'CA Ashish Medicala': '#e8967f',
  'CA Bhushal Gosar': '#a6a0f5',
  'CA Mayur Sanghvi': '#8aadd4',
  'CA Payal Sanghvi': '#a4ffca',
  'Pratik Mahajan': '#f5a0ad',
  'CA Roshni Manral': '#8aadd4',
  'CA Shubham Sanghvi': '#a6a0f5',
  'Sanjay Apam': '#a4ffca',
};

const subjectsList = [
  'All Subjects',
  'Accounts',
  'Business Studies',
  'Economics',
  'English',
  'Maths',
];
const subjectOptions = subjectsList.filter((s) => s !== 'All Subjects');

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

// --- Main Exported Component ---
export default function CourseListings({
  products = [],
}: {
  products?: any[];
}) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // States for all filters
  const [selectedSort, setSelectedSort] = useState<string>('Relevant');
  const [selectedPricing, setSelectedPricing] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string>('');
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);

  const filterRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setActiveModal(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleModal = (modalName: string) => {
    setActiveModal((prev) => (prev === modalName ? null : modalName));
  };

  const handleResetFilters = () => {
    setSelectedSort('Relevant');
    setSelectedPricing('All');
    setSelectedLanguage([]);
    setSelectedSubjects('');
    setSelectedFaculties([]);
    setActiveModal(null);
  };

  const mappedCourses = useMemo(
    () => products.map(mapVendureToFeaturedCourse),
    [products],
  );

  const getBtnClass = (isActive: boolean) =>
    `flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-gray-700 border text-base font-medium transition-colors justify-between sm:justify-start w-full sm:w-auto whitespace-nowrap ${
      isActive
        ? 'bg-lightgray text-white border-lightgray'
        : 'bg-white text-lightgray border-lightgray/10 hover:border-lightgray/30'
    }`;

  return (
    <section className="w-full bg-white py-10 lg:py-12 4xl:py-16!">
      <div className="custom-container">
        {activeModal && (
          <button
            type="button"
            aria-label="Close filter modal"
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          />
        )}

        {/* Filter Section */}
        <div
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-20 mb-8"
          ref={filterRef}
        >
          <span className="font-semibold text-lightgray text-2xl">
            {mappedCourses.length} Courses
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {/* SortBy Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => toggleModal('sort')}
                className={getBtnClass(activeModal === 'sort')}
              >
                <span className="font-semibold">{selectedSort}</span>
                <ChevronDown isOpen={activeModal === 'sort'} />
              </button>
              {activeModal === 'sort' && (
                <div
                  className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,320px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-lightgray/5 bg-white py-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:absolute sm:top-[calc(100%+8px)] sm:left-0 sm:w-[200px] sm:translate-x-0 sm:translate-y-0"
                  onClick={(e) => e.stopPropagation()}
                >
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
                      className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                        selectedSort === opt
                          ? 'bg-lightgray/5 text-lightgray font-medium'
                          : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subjects Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => toggleModal('subjects')}
                className={getBtnClass(activeModal === 'subjects')}
              >
                {selectedSubjects ? (
                  <span className="font-semibold">{selectedSubjects}</span>
                ) : (
                  'Subjects'
                )}{' '}
                <ChevronDown isOpen={activeModal === 'subjects'} />
              </button>
              {activeModal === 'subjects' && (
                <div
                  className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,320px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-lightgray/5 bg-white py-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:absolute sm:top-[calc(100%+8px)] sm:left-0 sm:w-[200px] sm:translate-x-0 sm:translate-y-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {subjectOptions.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => {
                        setSelectedSubjects(subject);
                        setActiveModal(null);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm transition-colors flex items-center justify-between ${
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
              )}
            </div>

            {/* Faculty Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => toggleModal('faculty')}
                className={getBtnClass(activeModal === 'faculty')}
              >
                Faculty <ChevronDown isOpen={activeModal === 'faculty'} />
              </button>
              {activeModal === 'faculty' && (
                <div
                  className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,320px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-lightgray/5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:absolute sm:top-[calc(100%+8px)] sm:left-0 sm:w-[300px] sm:translate-x-0 sm:translate-y-0 max-h-[400px] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* "All" Option */}
                  <button
                    onClick={() => {
                      setSelectedFaculties([]);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${
                      selectedFaculties.length === 0
                        ? 'bg-lightgray/5 text-lightgray font-medium'
                        : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-sm border border-gray-100 flex items-center justify-center ${
                        selectedFaculties.length === 0
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-lightgray/30 bg-white'
                      }`}
                    >
                      {selectedFaculties.length === 0 && <CheckIcon />}
                    </div>
                    <span>All</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-lightgray/10" />

                  {/* Faculty Options */}
                  {facultyOptions.map((faculty) => (
                    <button
                      key={faculty}
                      onClick={() => {
                        setSelectedFaculties((prev) =>
                          prev.includes(faculty)
                            ? prev.filter((f) => f !== faculty)
                            : [...prev, faculty],
                        );
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 ${
                        selectedFaculties.includes(faculty)
                          ? 'bg-lightgray/5 text-lightgray font-medium'
                          : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-sm border border-gray-100 flex items-center justify-center flex-shrink-0 ${
                          selectedFaculties.includes(faculty)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-lightgray/30 bg-white'
                        }`}
                      >
                        {selectedFaculties.includes(faculty) && <CheckIcon />}
                      </div>
                      <img
                        src={FACULTY_AVATAR_BY_NAME[faculty]}
                        alt={faculty}
                        className="w-7 h-7 rounded-full border bg-blue-500 border-transparent object-cover flex-shrink-0"
                      />
                      <span>{faculty}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => toggleModal('language')}
                className={getBtnClass(activeModal === 'language')}
              >
                {selectedLanguage.length > 0 ? (
                  <span className="font-semibold flex items-center gap-2">
                    Language{' '}
                    <span className="text-white text-xs bg-blue-500 px-2.5 py-1 rounded-full">
                      {selectedLanguage.length}
                    </span>
                  </span>
                ) : (
                  'Language'
                )}{' '}
                <ChevronDown isOpen={activeModal === 'language'} />
              </button>
              {activeModal === 'language' && (
                <div
                  className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,320px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-lightgray/5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:absolute sm:top-[calc(100%+8px)] sm:left-0 sm:w-[300px] sm:translate-x-0 sm:translate-y-0 max-h-[400px] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* "All" Option */}
                  <button
                    onClick={() => {
                      setSelectedLanguage([]);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 ${
                      selectedLanguage.length === 0
                        ? 'bg-lightgray/5 text-lightgray font-medium'
                        : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-sm border border-gray-100 flex items-center justify-center ${
                        selectedLanguage.length === 0
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-lightgray/30 bg-white'
                      }`}
                    >
                      {selectedLanguage.length === 0 && <CheckIcon />}
                    </div>
                    <span>All</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-lightgray/10" />

                  {/* Language Options */}
                  {['English', 'Hindi', 'Hinglish'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage((prev) =>
                          prev.includes(lang)
                            ? prev.filter((l) => l !== lang)
                            : [...prev, lang],
                        );
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 ${
                        selectedLanguage.includes(lang)
                          ? 'bg-lightgray/5 text-lightgray font-medium'
                          : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-sm border border-gray-100 flex items-center justify-center flex-shrink-0 ${
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
              )}
            </div>

            {/* Pricing Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => toggleModal('pricing')}
                className={getBtnClass(activeModal === 'pricing')}
              >
                <span className="font-semibold">{selectedPricing}</span>{' '}
                <ChevronDown isOpen={activeModal === 'pricing'} />
              </button>
              {activeModal === 'pricing' && (
                <div
                  className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,320px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-lightgray/5 bg-white py-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:absolute sm:top-[calc(100%+8px)] sm:left-0 sm:w-[200px] sm:translate-x-0 sm:translate-y-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {['All', 'Free', 'Paid'].map((price) => (
                    <button
                      key={price}
                      onClick={() => {
                        setSelectedPricing(price);
                        setActiveModal(null);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                        selectedPricing === price
                          ? 'bg-lightgray/5 text-lightgray font-medium'
                          : 'text-lightgray/80 hover:bg-lightgray/5 hover:text-lightgray'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-base font-medium text-lightgray/60 hover:text-lightgray px-2 ml-2 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mappedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
