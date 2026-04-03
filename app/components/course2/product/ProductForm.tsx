import React from 'react';
import { VendureCourse2Product } from '~/providers/course2';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';

interface ProductFormProps {
  product: VendureCourse2Product;
  formData: Record<string, string>;
  totalPrice: number;
  onFormChange: (field: string, value: string) => void;
  onAddToCart: (overrideVariantId?: string) => void;
  isAddingToCart?: boolean;
  validationErrors?: Record<string, string>;
  className?: string;
}

export function ProductForm({
  product,
  formData,
  totalPrice,
  onFormChange,
  onAddToCart,
  isAddingToCart = false,
  validationErrors = {},
  className = '',
}: ProductFormProps) {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalPrice);

  // Calculate original price (simple +20% if not available, or use original from product)
  // For demonstration based on screenshot styling
  const originalPrice = totalPrice * 1.25;
  const formattedOriginalPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(originalPrice);

  const hasDescription = !!(product.description && product.description.trim());
  const descriptionLooksLikeHtml = React.useMemo(() => {
    const desc = product.description || '';
    return /<\/?[a-z][\s\S]*>/i.test(desc);
  }, [product.description]);
  const descriptionShouldRenderAsHtml = React.useMemo(() => {
    const desc = product.description || '';
    // Keep HTML rendering for content that relies on rich structure
    return /<(table|thead|tbody|tr|td|th|ul|ol|li)\b/i.test(desc);
  }, [product.description]);
  const plainDescription = React.useMemo(() => {
    const desc = product.description || '';
    if (!desc) return '';
    if (!descriptionLooksLikeHtml) return desc;

    // Convert common HTML breaks/blocks into new lines, then strip remaining tags.
    let text = desc
      .replace(/\r\n/g, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|tr|li|h1|h2|h3|h4|h5|h6)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/td>/gi, '  ')
      .replace(/<\/th>/gi, '  ')
      .replace(/<[^>]+>/g, '');

    // Decode a few common entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');

    // Normalize whitespace/newlines
    text = text
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  }, [product.description, descriptionLooksLikeHtml]);

  const templatedDescription = React.useMemo(() => {
    const getFacet = (key: string) =>
      ((product.facetProperties as any)?.[key]?.value as string | undefined) ||
      '';

    const toSentence = (v: any) =>
      String(v ?? '')
        .replace(/\s+/g, ' ')
        .trim();

    const pickFirst = (...vals: Array<string | undefined | null>) =>
      vals.map((v) => toSentence(v)).find((v) => Boolean(v)) || '';

    const normalizeLines = (s: string) =>
      (s || '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    const descLines = normalizeLines(plainDescription);

    const decodeEntities = (s: string) =>
      s
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');

    const stripTags = (html: string) =>
      decodeEntities(
        html
          .replace(/\r\n/g, '\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/(p|div|tr|li|h1|h2|h3|h4|h5|h6)>/gi, '\n')
          .replace(/<li[^>]*>/gi, '• ')
          .replace(/<[^>]+>/g, ''),
      )
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const parseHtmlTableKeyValues = (html: string) => {
      const out: Record<string, string> = {};
      if (!html) return out;

      const trMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
      for (const tr of trMatches) {
        const cellMatches = tr.match(/<(td|th)[\s\S]*?<\/\1>/gi) || [];
        if (cellMatches.length < 2) continue;

        const key = toSentence(stripTags(cellMatches[0] || '')).toLowerCase();
        const valueRaw = stripTags(cellMatches[1] || '');
        const value = valueRaw.replace(/\s+\n/g, '\n').trim();
        if (!key || !value) continue;

        // keep first occurrence only
        if (!out[key]) out[key] = value;
      }
      return out;
    };

    const htmlKv = descriptionLooksLikeHtml
      ? parseHtmlTableKeyValues(product.description || '')
      : {};

    const extractLineValue = (label: RegExp) => {
      const line = descLines.find((l) => label.test(l));
      if (!line) return '';
      // "Key: value" or "Key - value"
      const m = line.match(/^[^:–—-]+[:–—-]\s*(.+)$/);
      return m?.[1]?.trim() || '';
    };

    const attemptFromList = (() => {
      const list = (product.attemptList || []).map((a) => toSentence(a?.name));
      const uniq = Array.from(new Set(list.filter(Boolean)));
      if (uniq.length === 0) return '';
      if (uniq.length === 1) return uniq[0]!;
      if (uniq.length === 2) return `${uniq[0]} & ${uniq[1]}`;
      return `${uniq.slice(0, -1).join(', ')} & ${uniq[uniq.length - 1]}`;
    })();

    const attempts =
      pickFirst(
        attemptFromList,
        getFacet('attempt'),
        getFacet('attempt-cma'),
        getFacet('examAttempt'),
        extractLineValue(/^relevant for\b/i),
        extractLineValue(/^applicable for\b/i),
        htmlKv['relevant for'],
        htmlKv['applicable for'],
        getFacet('validity'),
      ) || 'Sept’26, Jan’27 & May’26 Students';

    const views =
      pickFirst(
        getFacet('views'),
        extractLineValue(/^views?\b/i),
        htmlKv['views'],
      ) || '1.5 times (Lecture of 60 mins can be viewed for 90 mins)';

    const duration =
      pickFirst(
        getFacet('duration'),
        extractLineValue(/^duration\b/i),
        htmlKv['duration'],
        htmlKv['total duration'],
      ) || '180 hours';
    const language =
      pickFirst(
        getFacet('language'),
        extractLineValue(/^language\b/i),
        htmlKv['language'],
      ) || 'English';
    const mode =
      pickFirst(
        getFacet('mode'),
        extractLineValue(/^mode\b/i),
        htmlKv['mode'],
      ) || 'Live + Live Streaming of Latest Batch';

    const startDate =
      pickFirst(
        getFacet('startDate'),
        getFacet('liveBatchStart'),
        extractLineValue(/^live batch\b/i),
        extractLineValue(/^start date\b/i),
        htmlKv['live batch'],
        htmlKv['start date'],
      ) || 'Starting from 16th March';
    const endDate =
      pickFirst(
        getFacet('endDate'),
        getFacet('liveBatchEnd'),
        extractLineValue(/^end date\b/i),
        htmlKv['end date'],
      ) || '15th June';
    const time =
      pickFirst(
        getFacet('timing'),
        getFacet('time'),
        extractLineValue(/^time\b/i),
        extractLineValue(/^timing\b/i),
        htmlKv['time'],
        htmlKv['timing'],
      ) || '8:00 AM to 10:30 AM';

    const extractSectionBullets = (titleLike: RegExp) => {
      if (!descLines.length) return [];
      let start = descLines.findIndex((l) => titleLike.test(l));
      if (start === -1) return [];
      start += 1;
      const items: string[] = [];
      for (let i = start; i < descLines.length; i++) {
        const l = descLines[i]!;
        if (/^[A-Za-z].*:\s*$/.test(l)) break; // next heading
        if (/^[-•‣–—]\s+/.test(l))
          items.push(l.replace(/^[-•‣–—]\s+/, '').trim());
      }
      return items.filter(Boolean);
    };

    const parseImgSeparatedList = (raw: string) => {
      if (!raw) return [];
      // If features cell contains checkmark images, convert each image boundary into a new bullet.
      const withMarkers = raw.replace(/<img[\s\S]*?>/gi, '\n- ');
      const cleaned = stripTags(withMarkers);
      const lines = cleaned
        .split('\n')
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      const items = lines
        .flatMap((l) =>
          l
            .split(/- /)
            .map((x) => x.trim())
            .filter(Boolean),
        )
        .filter((x) => x.length > 2);
      return Array.from(new Set(items)).slice(0, 30);
    };

    const testIncluded =
      extractSectionBullets(/test included/i).length > 0
        ? extractSectionBullets(/test included/i)
        : [
            '10 chapter wise tests',
            '2 semester test',
            '1 Full Mock Test (fully checked and guided by AIRS)',
          ];

    const books =
      extractSectionBullets(/ultimate solution books/i).length > 0
        ? extractSectionBullets(/ultimate solution books/i)
        : [
            'Coloured Concept Book (100 Marks x 200 Pages)',
            'Coloured Question Bank (MCQs Included)',
          ];

    const featuresFromHtml =
      descriptionLooksLikeHtml && htmlKv['features']
        ? parseImgSeparatedList(htmlKv['features'])
        : [];

    const noteLines = (() => {
      const idx = descLines.findIndex((l) => /please note/i.test(l));
      if (idx === -1) return [];
      const res: string[] = [];
      for (let i = idx + 1; i < descLines.length; i++) {
        const l = descLines[i]!;
        if (/^[A-Za-z].*:\s*$/.test(l)) break;
        if (/^\d+\./.test(l)) res.push(l.replace(/^\d+\.\s*/, '').trim());
      }
      return res.filter(Boolean);
    })();

    const pleaseNote =
      noteLines.length > 0
        ? noteLines
        : [
            'Books are currently out of stock. Dispatch is expected to resume soon; you can place your orders to receive books on priority.',
            'Once order is placed, we can support you with any content/resources, but we cannot issue refund for this product.',
          ];

    const KV = ({ k, v }: { k: string; v: string }) => (
      <p className="text-[13px] text-slate-800">
        <span className="font-extrabold text-slate-900">{k}: </span>
        <span className="text-slate-700">{v}</span>
      </p>
    );

    const BulletList = ({ items }: { items: string[] }) => (
      <ul className="mt-2 space-y-1 text-[13px] text-slate-700">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span className="leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    );

    return (
      <div className="space-y-5">
        <KV k="Relevant for" v={attempts} />
        <KV k="Features" v="Check Table Below" />

        <div>
          <p className="text-[13px] text-slate-800">
            <span className="font-extrabold text-slate-900">
              Test Included{' '}
            </span>
            <span className="text-slate-600">
              (Fully checked and guided by AIRS):
            </span>
          </p>
          <BulletList items={testIncluded} />
        </div>

        <div>
          <p className="text-[13px] font-extrabold text-slate-900">
            The Ultimate Solution Books:
          </p>
          <BulletList items={books} />
        </div>

        <div className="space-y-1">
          <KV k="Live Batch" v={startDate} />
          <KV k="End Date" v={endDate} />
          <KV k="Time" v={time} />
          <KV k="Mode" v={mode} />
          <KV k="Language" v={language} />
          <KV k="Total Duration" v={duration} />
          <KV k="Views" v={views} />
        </div>

        {featuresFromHtml.length > 0 && (
          <div>
            <p className="text-[13px] font-extrabold text-slate-900">
              Features Included:
            </p>
            <BulletList items={featuresFromHtml} />
          </div>
        )}

        <div>
          <p className="text-[13px] font-extrabold text-slate-900">
            Please Note:
          </p>
          <ol className="mt-2 list-decimal pl-5 space-y-1 text-[13px] text-slate-700">
            {pleaseNote.map((n, i) => (
              <li key={i} className="leading-relaxed">
                {n}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }, [plainDescription, product.facetProperties]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Product Info Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-100">
            In Stock
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          {product.title}
        </h1>

        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
          SKU: {product.sellerSku || 'N/A'}
        </p>

        <div className="flex items-baseline gap-4 mt-2">
          <span className="text-4xl font-extrabold text-indigo-600">
            {formattedPrice}
          </span>
          <span className="text-lg text-slate-300 line-through font-medium">
            {formattedOriginalPrice}
          </span>
        </div>

        {/* Vendure Description (HTML) */}
        {hasDescription ? (
          <div className="pt-2">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Description
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
              {templatedDescription}
            </div>
          </div>
        ) : (
          <ul className="space-y-2 pt-2">
            {['Quality check', '7 Days Replacement', 'GST Invoice'].map(
              (feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-slate-600 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 fill-indigo-50" />
                  {feature}
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {/* Form Section */}
      <form className="space-y-6 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-1 gap-6">
          {/* Mobile input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Your Mobile number
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobile || ''}
              onChange={(e) => {
                const value = e.target.value;
                const digitsOnly = value.replace(/\D/g, '');
                if (digitsOnly.length <= 10) {
                  onFormChange('mobile', digitsOnly);
                }
              }}
              maxLength={10}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium focus:ring-0 focus:border-indigo-500 transition-all duration-200 outline-none ${
                validationErrors.mobile
                  ? 'border-red-200 bg-red-50/30'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
              }`}
            />
            {validationErrors.mobile && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                {validationErrors.mobile}
              </p>
            )}
          </div>

          {/* Attempt selection */}
          {product.attemptList && product.attemptList.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Attempt
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative group">
                <select
                  value={formData.attempt || ''}
                  onChange={(e) => onFormChange('attempt', e.target.value)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:ring-0 focus:border-indigo-500 outline-none cursor-pointer ${
                    validationErrors.attempt
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 group-hover:border-slate-200'
                  }`}
                >
                  <option value="">Choose an option</option>
                  {product.attemptList.map((attempt, index) => (
                    <option key={index} value={attempt.name}>
                      {attempt.name}
                    </option>
                  ))}
                </select>
              </div>
              {validationErrors.attempt && (
                <p className="mt-2 text-xs text-red-500 font-medium">
                  {validationErrors.attempt}
                </p>
              )}
            </div>
          )}

          {/* Option Properties (Mode, Books, etc.) */}
          {product.facetProperties?.type?.value?.toLowerCase() !== 'combo' &&
            product.optionProperties.map((optionProperty) => {
              const isMode = (optionProperty as any).isMode;
              const isBooks = (optionProperty as any).isBooks;

              const fieldKey = `option_${optionProperty.id}`;
              const hasError = !!validationErrors[fieldKey];
              const isDisabled =
                !formData.mobile ||
                formData.mobile.length < 10 ||
                !formData.attempt;

              return (
                <div key={optionProperty.id}>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {optionProperty.name}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative group">
                    <select
                      value={formData[fieldKey] || ''}
                      onChange={(e) => onFormChange(fieldKey, e.target.value)}
                      disabled={isDisabled}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:ring-0 focus:border-indigo-500 outline-none cursor-pointer ${
                        isDisabled
                          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
                          : hasError
                          ? 'border-red-200 bg-red-50/30'
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 group-hover:border-slate-200'
                      }`}
                    >
                      <option value="">Choose an option</option>
                      {optionProperty.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {hasError && (
                    <p className="mt-2 text-xs text-red-500 font-medium">
                      {validationErrors[fieldKey]}
                    </p>
                  )}
                </div>
              );
            })}

          {/* Hardcoded Books Dropdown - Only if not already present in optionProperties */}
          {!product.optionProperties.some((op) => (op as any).isBooks) && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Books
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative group">
                <select
                  value={formData.book || ''}
                  onChange={(e) => onFormChange('book', e.target.value)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:ring-0 focus:border-indigo-500 outline-none cursor-pointer ${
                    validationErrors.book
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <option value="">Choose an option</option>
                  <option value="Hard Copy">Hard Copy</option>
                  <option value="Soft Copy">Soft Copy</option>
                </select>
              </div>
              {validationErrors.book && (
                <p className="mt-2 text-xs text-red-500 font-medium">
                  {validationErrors.book}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => onAddToCart()}
            disabled={isAddingToCart}
            className={`flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl text-white font-bold transition-all duration-300 shadow-sm shadow-[#4aaeed] hover:shadow-md hover:shadow-[#3a9de0] hover:-translate-y-0.5 active:scale-95 ${
              isAddingToCart
                ? 'bg-[#4aaeed] cursor-not-allowed'
                : 'bg-[#4aaeed] hover:bg-[#3a9de0]'
            }`}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>Add To Cart</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
