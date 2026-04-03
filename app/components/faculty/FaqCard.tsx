import { useState } from 'react';
import { formatInr } from './util';
import { PrimaryButton } from './shared/PrimaryButton';

export const FaqCard = ({
  idx,
  question,
  answer,
  productSlug,
  recommendations,
}: {
  idx: number;
  question: string;
  answer: string;
  productSlug: string;
  recommendations: any[];
}) => {
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});

  return (
    <div className="bg-white border border-[#E6E9EF] rounded-2xl p-3 shadow-sm">
      <button
        type="button"
        onClick={() =>
          setOpenFaq((prev: any) => ({
            ...prev,
            [idx]: !prev?.[idx],
          }))
        }
        className="w-full flex items-center gap-3 text-left"
      >
        <svg
          width="6"
          height="12"
          viewBox="0 0 6 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`text-[#0F1724] transition-transform duration-200 flex-shrink-0 ${
            openFaq?.[idx] ? 'rotate-90' : ''
          }`}
        >
          <path
            d="M0.75 10.5L5.25 6L0.75 1.5"
            stroke="#0F1724"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Question Text */}
        <span className="font-semibold text-[#0F1724] text-sm leading-relaxed flex-1">
          {question}
        </span>
      </button>

      {openFaq?.[idx] && (
        <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {answer && (
            <div className="">
              <p className="text-[#4A4A4A] text-sm leading-relaxed mb-3">
                {answer}
              </p>
            </div>
          )}

          {Array.isArray(recommendations) && recommendations.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {recommendations.map((rec: any, rIdx: number) => (
                <div
                  key={`rec-${rIdx}`}
                  className="bg-[#FBFAF9] border border-[#E6E9EF] rounded-2xl p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-[#0F1724] text-sm">
                        {rec.title}
                      </h4>
                    </div>

                    {rec.description && (
                      <p className="text-xs text-[#787878] leading-relaxed">
                        {rec.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0F1724] text-lg">
                          {formatInr(rec.priceInr)}
                        </span>
                      </div>
                      <div className="">
                        {rec.productSlug ? (
                          <PrimaryButton
                            text="Add to Cart"
                            onClick={() =>
                              window.open(
                                `/products/${rec.productSlug}`,
                                '_blank',
                              )
                            }
                          />
                        ) : (
                          <PrimaryButton
                            text="Add to Cart"
                            onClick={() => {}}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
