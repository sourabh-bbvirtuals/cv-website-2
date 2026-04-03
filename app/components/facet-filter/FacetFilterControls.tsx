import { Fragment } from 'react';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useSearchParams } from '@remix-run/react';
import { FacetFilterTracker } from '~/components/facet-filter/facet-filter-tracker';
import { useTranslation } from 'react-i18next';

export default function FacetFilterControls({
  facetFilterTracker,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  onToggleFacetValue,
}: {
  facetFilterTracker: FacetFilterTracker;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (value: boolean) => void;
  onToggleFacetValue?: (
    facetId: string,
    valueId: string,
    selected: boolean,
  ) => void;
}) {
  const [searchParams] = useSearchParams();
  const q = searchParams.getAll('q');
  const { t } = useTranslation();
  const facets = facetFilterTracker.facetsWithValues || [];
  const hasFacets = facets.length > 0;

  return (
    <>
      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[60] lg:hidden"
          onClose={setMobileFiltersOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-[60]">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative max-w-xs w-full h-full bg-white shadow-xl py-4 pb-12 flex flex-col overflow-y-auto">
                <div className="px-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {t('common.filters')}
                  </h2>
                  <button
                    type="button"
                    className="-mr-2 w-10 h-10 bg-white p-2 rounded-md flex items-center justify-center text-gray-400"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">{t('common.closeMenu')}</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4 border-t border-gray-200">
                  <input type="hidden" name="q" value={q} />
                  {hasFacets ? (
                    facets.map((facet) => (
                      <Disclosure
                        as="div"
                        key={facet.id}
                        defaultOpen={true}
                        className="border-t border-gray-200 px-4 py-6"
                      >
                        {({ open }) => (
                          <>
                            <h3 className="-mx-2 -my-3 flow-root">
                              <Disclosure.Button className="px-2 py-3 bg-white w-full flex items-center justify-between text-gray-400 hover:text-gray-500">
                                <span className="font-medium text-gray-900 uppercase">
                                  {facet.name}
                                </span>
                                <span className="ml-6 flex items-center">
                                  {open ? (
                                    <ChevronDownIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <ChevronUpIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className="pt-6">
                              <div className="space-y-6">
                                {facet.values.map((value, optionIdx) => (
                                  <div
                                    key={value.id}
                                    className="flex items-center"
                                  >
                                    <input
                                      id={`filter-mobile-${facet.id}-${optionIdx}`}
                                      defaultValue={value.id}
                                      type="checkbox"
                                      checked={value.selected}
                                      onChange={(ev) => {
                                        const nextSelected = ev.target.checked;
                                        // Mirror to desktop checkbox so server-side forms still work
                                        const desktopInput =
                                          document.getElementById(
                                            `filter-${facet.id}-${optionIdx}`,
                                          ) as HTMLInputElement | null;
                                        if (desktopInput) {
                                          desktopInput.checked = nextSelected;
                                        }
                                        onToggleFacetValue?.(
                                          facet.id,
                                          value.id,
                                          nextSelected,
                                        );
                                      }}
                                      className="h-4 w-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    <label
                                      htmlFor={`filter-mobile-${facet.id}-${optionIdx}`}
                                      className="ml-3 min-w-0 flex-1 text-gray-500"
                                    >
                                      {value.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    ))
                  ) : (
                    <div className="px-1 py-4 text-sm text-gray-500">
                      {t('common.noFilters') || 'No filters available'}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="hidden lg:block">
        <h5 className="py-2 text-[#1c212f] font-medium">Filters</h5>
        <div className="border border-slate-200 rounded-xl">
          <div className="px-5 py-3">
            <input type="hidden" name="q" value={q} />
            {hasFacets ? (
              facets.map((facet) => (
                <Disclosure
                  as="div"
                  key={facet.id}
                  defaultOpen={true}
                  className=" py-4"
                >
                  {({ open }) => (
                    <>
                      <h3 className="-my-3 flow-root">
                        <div className="py-3 bg-white w-full flex items-center justify-between text-sm text-gray-400 hover:text-gray-500">
                          <span className="font-medium text-[#1c212f] uppercase">
                            {facet.name}
                          </span>
                        </div>
                        {/* <Disclosure.Button className="py-3 bg-white w-full flex items-center justify-between text-sm text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900 uppercase">
                          {facet.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          {open ? (
                            <ChevronDownIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronUpIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </Disclosure.Button> */}
                      </h3>
                      <Disclosure.Panel className="pt-4">
                        <div className="space-y-2">
                          {facet.values.map((value, optionIdx) => (
                            <div key={value.id} className="flex items-center">
                              <input
                                id={`filter-${facet.id}-${optionIdx}`}
                                name={`fvid`}
                                defaultValue={value.id}
                                type="checkbox"
                                checked={value.selected}
                                onChange={(ev) => {
                                  onToggleFacetValue?.(
                                    facet.id,
                                    value.id,
                                    ev.target.checked,
                                  );
                                }}
                                className="h-4 w-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                              />
                              <label
                                htmlFor={`filter-${facet.id}-${optionIdx}`}
                                className="ml-3 text-sm text-[#414151]"
                              >
                                {value.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))
            ) : (
              <div className="py-5 text-sm text-gray-500">
                {t('common.noFilters') || 'No filters available'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
