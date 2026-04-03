import { Link } from '@remix-run/react';
import { FacultyCard } from './faculty-card';

export default function FacultiesPage() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">India's Leading Faculties</h1>
          <p className="text-gray-600">
            Learn with India's Top-notch Faculties
          </p>
        </div>

        {/* add or remove this scrollbar-hide to the classname to hide or show the scrollbar */}

        <div className="lg:grid hidden lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
          {facultyMembers.slice(7).map((member, index) => (
            <div key={index} className="flex-shrink-0 w-[200px] lg:w-[300px]">
              <FacultyCard member={member} />
            </div>
          ))}
        </div>

        <div className="lg:hidden flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {facultyMembers.slice(7).map((member, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[180px] sm:w-[200px] snap-center"
            >
              <FacultyCard member={member} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to={'/faculties'}>
            <button className="font-medium w-28 p-2 rounded-xl bg-indigo-600 text-white">
              View all
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
