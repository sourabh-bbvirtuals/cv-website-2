import { HomeIcon } from '@heroicons/react/24/solid';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export function Breadcrumbs({
  items,
}: {
  items: { name: string; slug: string; id: string }[];
}) {
  const { t } = useTranslation();

  // Filter out "__root_collection__"
  const breadcrumbs = items.filter(
    (item) => item.name !== '__root_collection__',
  );

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-1 md:space-x-4">
        {/* Home Link */}
        <li>
          <div>
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{t('home')}</span>
            </Link>
          </div>
        </li>

        {/* Breadcrumb Items */}
        {breadcrumbs.map((item, index) => (
          <li key={item.id}>
            <div className="flex items-center">
              <span className="text-gray-400">/</span>
              <button
                // to={`/${breadcrumbs
                //   .slice(0, index + 1)
                //   .map((breadcrumb) => breadcrumb.slug)
                //   .join('/')}`}
                className="ml-2 md:ml-4 text-xs md:text-sm font-medium text-gray-500 cursor-default"
              >
                {item.name}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
