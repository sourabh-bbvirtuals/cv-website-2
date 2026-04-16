import React, { useState } from 'react';
import { VendureCourse2Product } from '~/providers/course2';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import type { CollectionContentItem } from '~/providers/blog/blog-content';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

interface ProductTabsProps {
  product: VendureCourse2Product;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notes?: CollectionContentItem[];
  reviews?: CollectionContentItem[];
}

export function ProductTabs({
  product,
  activeTab,
  onTabChange,
  notes = [],
  reviews = [],
}: ProductTabsProps) {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const formattedDescriptionHtml = React.useMemo(() => {
    const html = product.description || '';
    if (!html) return '';
    // Client-side only: format "Features" row into a proper bullet list
    if (typeof window === 'undefined') return html;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = Array.from(doc.querySelectorAll('table'));
      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll('tr'));
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length < 2) continue;
          const label = (cells[0].textContent || '').trim().toLowerCase();
          if (label !== 'features') continue;

          const valueCell = cells[1];
          // If it already contains a list, keep as-is
          if (valueCell.querySelector('ul,ol')) continue;

          const imgs = Array.from(valueCell.querySelectorAll('img'));
          // If images are present, we can segment by them. Otherwise (common due to sanitization),
          // fall back to splitting by checkmark-style separators.

          // Build items: for each image, collect text until next image
          const nodes = Array.from(valueCell.childNodes);
          const items: Array<string> = [];
          let currentText = '';

          const pushCurrent = () => {
            const t = currentText.replace(/\s+/g, ' ').trim();
            if (t) items.push(t);
            currentText = '';
          };

          for (const node of nodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.tagName.toLowerCase() === 'img') {
                pushCurrent();
                continue;
              }
              if (el.tagName.toLowerCase() === 'br') {
                currentText += ' ';
                continue;
              }
              const text = el.textContent || '';
              currentText += ` ${text} `;
            } else if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent || '';
              currentText += ` ${text} `;
            }
          }
          pushCurrent();

          const finalizeWithItems = (nextItems: string[]) => {
            if (nextItems.length < 2) return false;
            const ul = doc.createElement('ul');
            ul.setAttribute('data-formatted', 'features');
            for (const text of nextItems) {
              const li = doc.createElement('li');
              li.appendChild(doc.createTextNode(text));
              ul.appendChild(li);
            }
            valueCell.innerHTML = '';
            valueCell.appendChild(ul);
            return true;
          };

          // Prefer items parsed from images if available
          if (imgs.length >= 2 && finalizeWithItems(items)) {
            continue;
          }

          // Fallback: split by checkmark-like separators in the text
          const rawText = (valueCell.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();
          const splitByChecks = rawText
            .split(/(?:✅|✔️|✔|☑️|☑|✓|■|▪|▫|·|\u2022)+/g)
            .map((s) => s.trim())
            .filter(Boolean);

          // If we found many items, render as bullets
          if (splitByChecks.length >= 3) {
            finalizeWithItems(splitByChecks);
          }
        }
      }
      return doc.body.innerHTML || html;
    } catch {
      return html;
    }
  }, [product.description]);

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'aboutFaculty', label: 'About faculty' },
    { id: 'additional', label: 'Additional information' },
    { id: 'review', label: 'Review' },
    { id: 'sampleNotes', label: 'Sample Notes' },
  ];

  // Table data mapping from product properties
  const descriptionTableData = [
    { label: 'Faculty', value: product.faculties?.[0]?.name },
    { label: 'Mode of Classes', value: product.facetProperties?.mode?.value },
    {
      label: 'Study Material',
      value: product.facetProperties?.studyMaterial?.value,
    },
    { label: 'Valid for', value: product.facetProperties?.validity?.value },
    { label: 'Views', value: product.facetProperties?.views?.value },
    {
      label: 'Attempt',
      value:
        product.facetProperties?.attempt?.value ||
        product.facetProperties?.examAttempt?.value,
    },
    { label: 'Duration', value: product.facetProperties?.duration?.value },
    {
      label: 'No. of Lectures',
      value: product.facetProperties?.lectures?.value,
    },
    { label: 'Language', value: product.facetProperties?.language?.value },
    {
      label: 'Doubt Solving',
      value: product.facetProperties?.doubtSolving?.value || 'Available',
    },
    { label: 'Demo', value: 'Available in Demo Tab' },
  ].filter((item) => item.value);

  const additionalTableData = [
    {
      label: 'Attempt',
      value:
        product.facetProperties?.attempt?.value ||
        product.facetProperties?.examAttempt?.value,
    },
    { label: 'Mode', value: product.facetProperties?.mode?.value },
    { label: 'Books', value: product.facetProperties?.studyMaterial?.value },
  ].filter((item) => item.value);

  const sampleNotes = React.useMemo(() => {
    const candidates = [
      (product.facetProperties as any)?.sampleNotes?.value,
      (product.facetProperties as any)?.sample_notes?.value,
      (product.facetProperties as any)?.notes?.value,
      (product.facetProperties as any)?.studyMaterials?.value,
    ]
      .filter(Boolean)
      .map(String);

    const raw = candidates[0] || '';
    if (!raw) return [];
    return raw
      .split(/\r?\n|,|•|;/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  }, [product.facetProperties]);

  const Table = ({
    rows,
  }: {
    rows: Array<{ label: string; value: string | number | null | undefined }>;
  }) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-1/3">
              Particulars
            </th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                {row.label}
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">
                {row.value as any}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={2} className="px-6 py-10 text-center text-slate-400">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex justify-center border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d4ed8]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {formattedDescriptionHtml ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div
                  className={[
                    'p-4 sm:p-6',
                    // Make Vendure HTML tables look like the reference (clean grid)
                    '[&_table]:w-full [&_table]:border-collapse',
                    '[&_table]:text-sm [&_table]:text-slate-700',
                    '[&_th]:bg-slate-50 [&_th]:text-left [&_th]:font-bold [&_th]:text-slate-600',
                    '[&_th]:px-3 sm:[&_th]:px-6 [&_th]:py-3 sm:[&_th]:py-4',
                    '[&_td]:px-3 sm:[&_td]:px-6 [&_td]:py-3 sm:[&_td]:py-4 [&_td]:align-top',
                    '[&_th]:border [&_th]:border-slate-200',
                    '[&_td]:border [&_td]:border-slate-200',
                    // Mobile: keep first column compact; Desktop: wider label column
                    '[&_tr>td:first-child]:w-[38%] sm:[&_tr>td:first-child]:w-56',
                    '[&_tr>td:first-child]:whitespace-normal sm:[&_tr>td:first-child]:whitespace-nowrap',
                    '[&_tr>td:first-child]:font-medium',
                    '[&_tr>td:first-child]:text-slate-600',
                    // Prevent "Features" row from becoming one long messy line
                    '[&_td]:min-w-0',
                    '[&_td]:whitespace-normal',
                    '[&_td]:break-words',
                    '[&_td]:leading-relaxed',
                    '[&_td]:[overflow-wrap:anywhere]',
                    // Icons/images inside cells (used by some Vendure descriptions)
                    '[&_td_img]:inline-block',
                    '[&_td_img]:h-4 [&_td_img]:w-4',
                    '[&_td_img]:align-middle',
                    '[&_td_img]:mr-1 [&_td_img]:ml-1',
                    // Lists inside description
                    '[&_ul]:list-disc [&_ul]:pl-4 sm:[&_ul]:pl-5 [&_ul]:space-y-1',
                    '[&_ol]:list-decimal [&_ol]:pl-4 sm:[&_ol]:pl-5 [&_ol]:space-y-1',
                    // Paragraph spacing
                    '[&_p]:my-2',
                  ].join(' ')}
                  dangerouslySetInnerHTML={{ __html: formattedDescriptionHtml }}
                />
              </div>
            ) : (
              <Table rows={descriptionTableData} />
            )}
          </div>
        )}

        {/* About faculty tab */}
        {activeTab === 'aboutFaculty' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              {product.faculties?.length ? (
                (() => {
                  const faculty = product.faculties[0];
                  const name = faculty?.name || 'Faculty';
                  const fallbackImage = '';
                  const image = faculty?.image || fallbackImage;
                  const description =
                    faculty?.description ||
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

                  // If description is HTML (from Vendure), render as HTML.
                  // Otherwise show it as plain text.
                  const isHtml =
                    typeof description === 'string' &&
                    description.includes('<');

                  return (
                    <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
                      <div className="flex-shrink-0">
                        <img
                          src={image}
                          alt={name}
                          className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full border border-slate-200 bg-slate-50"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                          {name}
                        </h3>
                        {isHtml ? (
                          <div
                            className="mt-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1"
                            dangerouslySetInnerHTML={{ __html: description }}
                          />
                        ) : (
                          <p className="mt-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-sm text-slate-500">
                  Faculty information not available.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional information tab */}
        {activeTab === 'additional' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Table rows={additionalTableData} />
          </div>
        )}

        {/* Review tab */}
        {activeTab === 'review' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {reviews.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 relative group">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={12}
                  slidesPerView={1}
                  loop={reviews.length > 1}
                  autoplay={
                    reviews.length > 1
                      ? { delay: 3500, disableOnInteraction: false }
                      : false
                  }
                  navigation={
                    reviews.length > 1
                      ? {
                          nextEl: '.review-swiper-next',
                          prevEl: '.review-swiper-prev',
                        }
                      : false
                  }
                  pagination={{
                    clickable: true,
                    el: '.review-swiper-pagination',
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 12 },
                    1024: { slidesPerView: 2, spaceBetween: 14 },
                  }}
                  className="product-reviews-swiper w-full"
                >
                  {reviews.map((review) => (
                    <SwiperSlide key={review.id} className="pb-10">
                      <article className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4 mb-3">
                          {review.image ? (
                            <img
                              src={review.image}
                              alt={review.title || 'Reviewer'}
                              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border border-slate-200 flex-shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold text-lg">
                              {review.author?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-1">
                              {review.title || 'Review'}
                            </h3>
                            {review.author && (
                              <p className="mt-0.5 text-xs font-medium text-slate-600 truncate">
                                By {review.author}
                              </p>
                            )}
                            <span className="text-[11px] sm:text-xs text-slate-500 whitespace-nowrap block mt-0.5">
                              {review.date}
                            </span>
                          </div>
                          {typeof review.rating === 'number' &&
                            !Number.isNaN(review.rating) && (
                              <div className="flex flex-col flex-shrink-0 items-end">
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                  ★ {review.rating}/5
                                </span>
                              </div>
                            )}
                        </div>

                        {(review.content || review.excerpt) && (
                          <div className="mt-2 flex-grow">
                            <p className="text-sm leading-relaxed text-slate-700 line-clamp-4">
                              {review.content || review.excerpt}
                            </p>
                          </div>
                        )}
                      </article>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation & Pagination */}
                {reviews.length > 1 && (
                  <>
                    <button className="review-swiper-prev absolute left-0 sm:-left-4 top-[45%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <ChevronLeft className="h-5 w-5 ml-[-2px]" />
                    </button>
                    <button className="review-swiper-next absolute right-0 sm:-right-4 top-[45%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <ChevronRight className="h-5 w-5 mr-[-2px]" />
                    </button>
                    <div className="review-swiper-pagination flex justify-center gap-2 absolute bottom-3 left-0 right-0 z-10 cursor-pointer [&_.swiper-pagination-bullet]:h-2 [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-slate-300 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet-active]:w-6 [&_.swiper-pagination-bullet-active]:bg-blue-600" />
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                No reviews yet.
              </div>
            )}
          </div>
        )}

        {/* Sample notes tab */}
        {activeTab === 'sampleNotes' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => {
                    const isExpanded = expandedNoteId === note.id;
                    const hasContent = !!(note.content || note.excerpt);
                    // If no text content, assume the fileUrl or image field holds the PDF/document link
                    const fileUrl =
                      note.fileUrl ||
                      (!hasContent && note.image ? note.image : null);
                    const isClickable = hasContent || fileUrl;

                    return (
                      <article
                        key={note.id}
                        className={`rounded-lg border transition-all ${
                          isClickable
                            ? 'cursor-pointer hover:border-slate-300'
                            : ''
                        } ${
                          isExpanded
                            ? 'border-blue-200 bg-blue-50/10 shadow-sm'
                            : 'border-slate-200 bg-white'
                        }`}
                        onClick={() => {
                          if (hasContent) {
                            setExpandedNoteId(isExpanded ? null : note.id);
                          } else if (fileUrl) {
                            window.open(fileUrl, '_blank');
                          }
                        }}
                      >
                        <div className="flex items-center justify-between p-4">
                          <h3 className="text-sm font-semibold text-slate-900 pr-4">
                            {note.title || 'Sample Note'}
                          </h3>
                          {isClickable && (
                            <div
                              className={`flex-shrink-0 flex items-center justify-center p-1 rounded-full transition-colors duration-200 ${
                                isExpanded
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {hasContent ? (
                                isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : (
                                <ExternalLink className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                        {hasContent && isExpanded && (
                          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="h-px w-full bg-slate-100 mb-4" />
                            <div
                              className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&_iframe]:w-full [&_iframe]:rounded-lg [&_iframe]:border-none [&_img]:max-w-full [&_img]:rounded-lg [&_a]:text-blue-600 [&_a]:underline"
                              dangerouslySetInnerHTML={{
                                __html: note.content || note.excerpt || '',
                              }}
                            />
                            {/* If there is both rich content AND a file attachment */}
                            {note.image && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <a
                                  href={note.image}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View attached document
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : sampleNotes.length > 0 ? (
                <ul className="space-y-3 text-sm text-slate-700">
                  {sampleNotes.map((n, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">
                  Sample notes will be available soon.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
