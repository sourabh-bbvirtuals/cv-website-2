import { Link } from '@remix-run/react';
import { useState } from 'react';

const categories = [
  {
    title: 'CA Final',
    data: [
      { title: 'FR', href: '/courses?subject=final,financial,reporting' },
      { title: 'AFM/SM', href: '/courses?subject=final,financial,management' },
      { title: 'Audit', href: '/courses?subject=final,audit' },
      { title: 'Direct Tax', href: '/courses?subject=final,direct,tax' },
      { title: 'Indirect Tax', href: '/courses?subject=final,indirect,tax' },
    ],
  },
  {
    title: 'CA Inter',
    data: [
      {
        title: 'Advanced Accounting',
        href: '/courses?subject=inter,advanced,account',
      },
      { title: 'Corporate Law', href: '/courses?subject=inter,law' },
      { title: 'Taxation', href: '/courses?subject=inter,tax' },
      { title: 'Costing', href: '/courses?subject=inter,cost' },
      { title: 'Audit & Ethics', href: '/courses?subject=inter,audit' },
      { title: 'FM SM', href: '/courses?subject=inter,fm' },
    ],
  },
  {
    title: 'CA Foundation',
    data: [
      { title: 'Accounts', href: '/courses?subject=foundation,account' },
      { title: 'Law', href: '/courses?subject=foundation,law' },
      { title: 'Mathematics', href: '/courses?subject=foundation,math' },
      { title: 'Economics', href: '/courses?subject=foundation,eco' },
    ],
  },
];

export default function CustomCard() {
  const [selected, setSelected] = useState('CA Final');

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white shadow-lg rounded-2xl border">
      <h3 className="text-lg font-semibold text-center mb-3">
        What are you looking for?
      </h3>

      {/* Scrollable Tabs */}
      {/* add or remove this scrollbar-hide to the classname to hide or show the scrollbar */}
      <div className="overflow-x-auto whitespace-nowrap scrollbar-hide mb-4">
        <div className="flex gap-3 px-2">
          {categories.map((cat) => (
            <button
              key={cat.title}
              onClick={() => setSelected(cat.title)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                selected === cat.title
                  ? 'bg-indigo-50 text-indigo-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Data List */}
      <div className="p-2 border gap-4 rounded-xl">
        {categories
          .find((cat) => cat.title === selected)
          ?.data.map((item) => (
            <Link to={item.href} className="">
              <p
                key={item.title}
                className="text-gray-700 my-2 font-medium hover:text-indigo-500"
              >
                {item.title}
              </p>
            </Link>
          ))}
      </div>
    </div>
  );
}
