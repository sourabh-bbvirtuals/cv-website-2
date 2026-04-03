import { Link, useNavigate, useSearchParams } from '@remix-run/react';
import { Button } from '../Button';
import { Checkbox } from '../ui/checkbox';

const FILTERS = {
  Attempt: ['Jan 25', 'May 25', 'Sep 25', 'Nov 25'],
  'Course Type': ['Single', 'Combo'],
  'By Faculty': [
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
  'Batch Type': ['Regular', 'Fastrack', 'Exam Oriented'],
  Language: ['English', 'Hindi', 'Hinglish'],
};

export default function FilterSidebar() {
  const [searchParams] = useSearchParams(); // Destructure only the URLSearchParams object
  const navigate = useNavigate();

  const handleFilterChange = (category: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    // Allow option to be selected or unselected
    if (params.get(category) === value) {
      params.delete(category);
    } else {
      params.set(category, value);
    }

    // Navigate to the updated URL
    navigate(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-4 bg-white border-r border-gray-200">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <h2 className="text-3xl font-semibold">Filters</h2>
          <Link to={'/courses'}>
            <div className="h-auto mt-2 p-0 text-sm text-gray-500 hover:text-gray-700 cursor-pointer font-medium">
              Reset all
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          {Object.entries(FILTERS).map(([category, options]) => (
            <div key={category}>
              <h3 className="font-medium mb-4">{category}</h3>
              <div
                className={`space-y-3 ${
                  options.length > 10 ? 'overflow-y-auto max-h-48' : ''
                }`}
              >
                {options.map((option) => {
                  const isChecked = searchParams.get(category) === option;
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        className="w-5 h-5 rounded-[4px] text-gray-400"
                        id={option}
                        checked={isChecked}
                        onCheckedChange={() =>
                          handleFilterChange(category, option)
                        }
                      />
                      <label className="font-medium text-sm" htmlFor={option}>
                        {option}
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-400 mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
