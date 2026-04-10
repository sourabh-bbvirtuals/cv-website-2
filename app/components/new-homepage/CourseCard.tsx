import { Link } from '@remix-run/react';
import React from 'react';
import { FeaturedCourse } from './FeaturedCourses';
import { title } from 'process';

export function CourseCard({ course }: { course: FeaturedCourse }) {
  const isPrimary = course.id === '1';
  const detailTo = `/our-courses/${course.slug}`;
  return (
    <Link
      to={detailTo}
      className="block h-full rounded-[20px] text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2962ff] focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col bg-white border border-[rgba(8,22,39,0.1)] rounded-[12px] shadow-xs  md:shadow-md w-[294.5px] h-[354px] md:w-[390px] md:h-[456px]">
        {/* Top Header */}
        <div className="flex flex-col justify-between h-full">
          <div className="p-[15px] pb-0 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-lightgray/80">
              <span className="rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1 text-sm leading-none font-medium text-[#081627CC]/90">
                {course.language || 'Hindi'}
              </span>
              {course.type === 'Recorded' ? (
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
                  Recorded
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1 rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1 text-sm leading-none font-medium text-[#081627CC]/90">
                  <span className="inline-block text-lightgray/80 size-[7px] rounded-full border bg-lightgray/20" />
                  {course.type || 'Live'}
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
                  {course.meta[2]}sssss
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
            <span className="font-medium text-sm line-through text-lightgray/30 decoration-solid">
              {course.wasPrice}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
