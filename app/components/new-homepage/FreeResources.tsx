import React from 'react';
import { ArrowRight } from 'lucide-react';
import {
  FreeVideosIcon,
  MockTestsIcon,
  PastPapersIcon,
  QuizzesIcon,
  StudyNotesIcon,
} from './Icons';
import { Link } from '@remix-run/react';

const RESOURCE_LINK_MAP: Record<string, string> = {
  'Study Notes': '/free-resources/study-notes',
  'Mock Tests': '/free-resources/mock-tests',
  'Past Papers': '/free-resources/past-papers',
  Quizzes: '/free-resources/quizzes',
  'Free Videos': '/free-resources/free-videos',
};

const FreeResources = () => {
  const resources = [
    {
      title: 'Study Notes',
      desc: '240+ PDFs',
      icon: <StudyNotesIcon classname="max-w-12 md:max-w-18" />,
      bgColor: 'bg-[#EEF2FF]',
    },
    {
      title: 'Mock Tests',
      desc: 'CBSE, CUET, MH',
      icon: <MockTestsIcon />,
      bgColor: 'bg-[#FFEEF8]',
    },
    {
      title: 'Past Papers',
      desc: '10 Years',
      icon: <PastPapersIcon />,
      bgColor: 'bg-[#EDF9FF]',
    },
    {
      title: 'Quizzes',
      desc: '180+ PDFs',
      icon: <QuizzesIcon />,
      bgColor: 'bg-[#FFF1EE]',
    },
    {
      title: 'Free Videos',
      desc: '500+ Lectures',
      icon: <FreeVideosIcon />,
      bgColor: 'bg-[#EEF0FF]',
    },
  ];

  const getResourceLink = (title: string) => {
    return RESOURCE_LINK_MAP[title] ?? '/free-resources/mock-tests';
  };

  return (
    <section className="custom-container">
      {/* Mobile view */}
      <div className="lg:hidden flex flex-col items-center text-center mb-8">
        <span className="text-lightgray font-medium text-base leading-[120%]">
          Free Resources
        </span>
        <h2 className="section-heading mt-2  text-lightgray">
          Start Learning Today
        </h2>
        <p className="text-lightgray text-sm mt-3 leading-[140%] max-w-xs">
          Choose Class 11, 12, CA Foundation, or CUET. Select your board and
          subjects.
        </p>
      </div>

      {/* Mobile grid */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {resources.map((item, idx) => (
            <Link
              key={idx}
              to={getResourceLink(item.title)}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div
                className={`${item.bgColor} w-22 h-22 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
              >
                {item.icon}
              </div>
              <h3 className="text-sm font-medium mt-4 text-lightgray leading-[120%]">
                {item.title}
              </h3>
              <p className="text-gray-900 text-xs font-medium mt-1">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Mobile link */}
        <div className="flex justify-center">
          <Link
            to={'/free-resources/mock-tests'}
            className="flex items-center gap-4 rounded-[38px] sm:px-3 sm:py-2 text-[#3a6bfc] text-base sm:text-[20px] font-medium leading-[1.2] hover:opacity-90 transition-opacity"
          >
            Explore All Resources
            <span className="flex size-6 items-center justify-center rounded-full bg-[#3a6bfc] text-white">
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        </div>
      </div>

      {/* desktop */}
      <div className="hidden lg:block xl:grid max-lg:flex-col max-xl:flex xl:grid-cols-2 gap-6 sm:gap-16 xl:gap-20 xl:items-center">
        {/* first col */}
        <div className="hidden lg:block max-w-full lg:max-w-md xl:max-w-160">
          <span className="text-lightgray font-medium text-base sm:text-lg lg:text-xl leading-[120%]">
            Free Resources
          </span>
          <h2 className="section-heading mt-2 sm:mt-3 xl:mt-5 font-semibold">
            Start Learning Today
          </h2>
          <p className="text-lightgray text-base sm:text-lg xl:text-xl mt-3 sm:mt-4 leading-[140%] xl:leading-[150%]">
            Choose Class 11, 12, CA Foundation, or CUET. Select your board and
            subjects.
          </p>
          <div className="flex gap-3 sm:gap- shrink-0 mt-16">
            <Link
              to={'/free-resources/mock-tests'}
              className="flex items-center gap-4 rounded-[38px] sm:px-3 sm:py-2 text-[#3a6bfc] text-base sm:text-[20px] font-medium leading-[1.2] hover:opacity-90 transition-opacity"
            >
              Explore All Resources
              <span className="flex size-6 items-center justify-center rounded-full bg-[#3a6bfc] text-white">
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
        {/* second col */}
        <div className="hidden lg:grid  grid-cols-2 gap-x-6 sm:gap-x-12 lg:gap-x-24 gap-y-6 sm:gap-y-8 lg:gap-y-10 max-xl:w-full">
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-5">
            {resources
              .filter((_, index) => index % 2 === 0)
              .map((item, idx) => (
                <Link
                  key={idx}
                  to={getResourceLink(item.title)}
                  className="flex items-center gap-2 sm:gap-5 group cursor-pointer"
                >
                  <div
                    className={`${item.bgColor} w-11 h-11 sm:w-20 sm:h-20 md:w-24 md:h-24 xl:w-34 xl:h-34 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-base sm:text-xl xl:text-2xl font-medium text-lightgray leading-[120%] whitespace-nowrap">
                      {item.title}
                    </h3>
                    <p className="text-gray-900 text-xs sm:text-lg font-medium mt-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              ))}
          </div>

          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 mt-12 sm:mt-20 md:mt-28 lg:mt-16">
            {resources
              .filter((_, index) => index % 2 === 1)
              .map((item, idx) => (
                <Link
                  key={idx}
                  to={getResourceLink(item.title)}
                  className="flex items-center gap-2 sm:gap-5 group cursor-pointer"
                >
                  <div
                    className={`${item.bgColor} w-11 h-11 sm:w-20 sm:h-20 md:w-24 md:h-24 xl:w-34 xl:h-34 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-base sm:text-xl xl:text-2xl font-medium text-lightgray leading-[120%] whitespace-nowrap">
                      {item.title}
                    </h3>
                    <p className="text-gray-900 text-xs sm:text-lg font-medium mt-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeResources;
