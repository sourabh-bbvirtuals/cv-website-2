import React from 'react';
import {
  BookOpen,
  FileText,
  ClipboardList,
  PenTool,
  Hash,
  PlayCircle,
} from 'lucide-react';
import {
  FormulaCardsIcon,
  FreeVideosIcon,
  MockTestsIcon,
  PastPapersIcon,
  QuizzesIcon,
  StudyNotesIcon,
} from './Icons';

const FreeResources = () => {
  const resources = [
    {
      title: 'Study Notes',
      desc: '240+ PDFs',
      icon: <StudyNotesIcon />,
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
      title: 'Formula Cards',
      desc: '400+ Formulas',
      icon: <FormulaCardsIcon />,
      bgColor: 'bg-[#FAEEFF]',
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

  return (
    <section className="custom-container home-section-y py-10 sm:py-12 md:py-16 lg:py-20">
      <div className="xl:grid max-lg:flex-col max-xl:flex xl:grid-cols-2 gap-6 sm:gap-16 xl:gap-20 xl:items-center">
        <div className="max-w-full lg:max-w-md xl:max-w-160">
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
          <button className="primary-btn mt-4 sm:mt-8 xl:mt-12 px-5 sm:px-6 py-3 sm:py-4 text-base sm:text-lg leading-[120%]">
            Explore All Resources
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-6 lg:gap-x-8 gap-y-6 sm:gap-y-8 lg:gap-y-10 max-xl:w-full">
          {resources.map((item, index) => (
            <div
              key={index}
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
                <p className="text-lightgray/50 text-xs sm:text-base font-medium mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreeResources;
