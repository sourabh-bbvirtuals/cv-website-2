import { motion, AnimatePresence } from 'framer-motion';
import {
  ListFilter,
  ArrowUpWideNarrow,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface FilterState {
  Attempt: string;
  'Course Type': string;
  'By Faculty': string;
  'Batch Type': string;
  Language: string;
  [key: string]: string;
}

interface FiltersSortBarProps {
  queryParams: Record<string, string[] | string>;
  sort: string;
  limit: number;
  updateQueryParam: (key: string, value: string) => string;
}

const FiltersSortBar = ({
  queryParams,
  sort,
  limit,
  updateQueryParam,
}: FiltersSortBarProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const toggleFilterbar = () => {
    setIsOpen(!isOpen);
  };

  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    Attempt: '',
    'Course Type': '',
    'By Faculty': '',
    'Batch Type': '',
    Language: '',
  });

  const handleFilterChange = (
    category: keyof FilterState,
    value: string,
    isChecked: boolean,
  ) => {
    setSelectedFilters((prevState) => ({
      ...prevState,
      [category]: isChecked ? value : '',
    }));
  };

  const applyFilters = () => {
    const queryParams = new URLSearchParams();
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    navigate(`?${queryParams.toString()}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sections = [
    {
      title: 'Attempt',
      options: ['Jan 25', 'May 25', 'Sep 25', 'Nov 25'],
    },
    {
      title: 'Course Type',
      options: ['Single', 'Combo'],
    },
    {
      title: 'By Faculty',
      options: [
        'Shubham Singhal',
        'Avinash Sancheti',
        'Vishal Bhattad',
        'Sankalp Kanstiya',
        'Neeraj Arora',
        'Darshan Khare',
        'Vijay Sarda',
        'Arpita Tulsyan',
        'Akshansh Garg',
        'Rajkumar',
        'Nitin Guru',
        'Amit Tated',
        'Aarti Lahoti',
        'Ravi Taori',
        'Pankaj Garg',
        'Pragnesh Kanabar',
        'Yashwant Mangal',
        'Praveen Jindal',
        'Abhishek Zaware',
        'Kapil Goyal',
        'Aaditya Jain',
        'Sarthak Jain',
        'Jai Chawla',
        'Akash Agarwal',
        'CA Praveen Khatod',
        'CA Adish Jain',
        'Prashant Sarda',
        'Shubham Keswani',
        'Akash Kandoi',
        'Riddhi Bagmar',
        'Harsh Gupta',
        'Darshan Jain',
        'Swapnil Patni',
        'Harshad Jaju',
        'Jatin Dembla',
        'Amit Bachhawat',
        'Shubham Gupta',
        'Navneet Mundhra',
        'Pooja Kamdar',
        'Anshul Agarwal',
        'Nishant Kumar',
        'Adarsh Joshi',
      ],
    },
    {
      title: 'Batch Type',
      options: ['Regular', 'Fastrack', 'Exam Oriented'],
    },
    {
      title: 'Language',
      options: ['English', 'Hindi', 'Hinglish'],
    },
  ];

  return (
    <>
      <div className="border-t border-b border-[#E8ECF4] flex flex-wrap items-center justify-between px-4 py-2 bg-white">
        {/* Filters Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={toggleFilterbar}
            className="flex items-center justify-center py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open filters"
          >
            <span className="text-gray-600 text-base font-medium flex items-center gap-2 hover:text-indigo-600">
              <ListFilter size={18} />
              Filters
            </span>
          </button>
        </div>

        {/* Sort and Show Section */}
        <div className="flex flex-col items-start justify-center gap-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#87919E] flex items-center gap-1">
              Sort :
            </span>
            <Select
              value={sort}
              onValueChange={(value) => {
                window.location.href = updateQueryParam('sort', value);
              }}
            >
              <SelectTrigger className="w-[120px] sm:w-[140px] text-sm h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low-to-high">Low to High</SelectItem>
                <SelectItem value="high-to-low">High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#87919E]">Show :</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                window.location.href = updateQueryParam('limit', value);
              }}
            >
              <SelectTrigger className="w-[60px] sm:w-[80px] text-sm h-9">
                <SelectValue placeholder="Show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sidebar with AnimatePresence for smooth exit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-full md:w-[60%] bg-white shadow-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-medium">Filters</h2>
              <button
                onClick={toggleFilterbar}
                className="text-gray-500 hover:text-gray-800 transition-transform transform hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="px-8 p-4 flex-grow overflow-y-auto">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {sections.map((section, index) => (
                  <AccordionItem key={index} value={`section-${index}`}>
                    <AccordionTrigger
                      onClick={() => toggleAccordion(index)}
                      className={`flex text-lg justify-between items-center w-full transition-colors duration-200 ${
                        openIndex === index ? 'text-indigo-500' : ''
                      }`}
                    >
                      {section.title}
                      <div
                        className={`transform transition-transform duration-300 ${
                          openIndex === index ? 'rotate-180' : 'rotate-0'
                        }`}
                      ></div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 mt-2">
                        {section.options.length > 6 ? (
                          <div className="overflow-y-auto max-h-48">
                            {section.options.map((option) => (
                              <div
                                key={option}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  className="w-5 h-5 rounded-[4px] text-gray-400"
                                  id={option}
                                  checked={
                                    selectedFilters[section.title] === option
                                  }
                                  onCheckedChange={(isChecked) =>
                                    handleFilterChange(
                                      section.title,
                                      option,
                                      isChecked,
                                    )
                                  }
                                />
                                <label
                                  className="font-normal text-lg"
                                  htmlFor={option}
                                >
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          section.options.map((option) => (
                            <div
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                className="w-5 h-5 rounded-[4px] text-gray-400"
                                id={option}
                                checked={
                                  selectedFilters[section.title] === option
                                }
                                onCheckedChange={(isChecked) =>
                                  handleFilterChange(
                                    section.title,
                                    option,
                                    isChecked,
                                  )
                                }
                              />
                              <label
                                className="font-normal text-lg"
                                htmlFor={option}
                              >
                                {option}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-b border-[#E8ECF4] flex">
              <div
                onClick={toggleFilterbar}
                className="flex-1 flex items-center justify-center py-4 cursor-pointer hover:bg-gray-50"
              >
                <span className="text-gray-500 text-lg font-medium flex items-center gap-2">
                  Cancel
                </span>
              </div>
              <div className="w-px bg-[#E8ECF4]"></div>
              <div
                onClick={applyFilters}
                className="flex-1 flex items-center justify-center py-4 cursor-pointer hover:bg-gray-50"
              >
                <span className="text-indigo-500 text-lg font-medium flex items-center gap-2 hover:text-indigo-600">
                  Apply
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FiltersSortBar;
