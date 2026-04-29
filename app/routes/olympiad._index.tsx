'use client';
import { useLoaderData, useFetcher, useRevalidator } from '@remix-run/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Instagram,
  Mail,
  Phone,
  Star,
  Youtube,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import RegisterPopup from '~/components/Olympiad/RegisterPopup';
import { useRootLoader } from '~/utils/use-root-loader';
import { json, type DataFunctionArgs } from '@remix-run/server-runtime';
import { getProductBySlug } from '~/providers/course2';
import { getCollectionBySlug } from '~/providers/collections/collections';
import sanitizeHtml from 'sanitize-html';
import { API_URL } from '~/constants';
import {
  instagramPages,
  SocialDropdown,
  youtubeChannels,
} from '~/components/new-homepage/TopHeader';
export async function loader({ request }: DataFunctionArgs) {
  const slug = 'commerce-olympiad-dc03f7'; // Hardcoded slug for the Commerce Olympiad course
  if (!slug) throw new Response('Not Found', { status: 404 });

  // Normalize slug: Vendure slugs almost always use hyphens,
  // but URLs might contain spaces/percent-encoded spaces.
  // const normalizedSlug = slug.trim().replace(/\s+/g, '-').toLowerCase();

  try {
    // Fetch product + collection + team data in parallel
    const teamFetch = fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{ collection(slug: "cv-team") { customFields { customData } } }`,
      }),
    })
      .then((r) => r.json())
      .catch(() => null);

    const [productResult, collectionResult, teamResult] =
      await Promise.allSettled([
        getProductBySlug(slug, { request }),
        getCollectionBySlug(slug, { request }),
        teamFetch,
      ]);

    // ─── Product ────────────────────────────────────────────────────────────
    const product =
      productResult.status === 'fulfilled' ? productResult.value : null;

    // ─── Specifications (Priority: Product customFields -> Collection customFields) ──
    let specifications: any = null;

    const findSpecs = (raw: string | undefined | null) => {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return { product: parsed };
        return parsed?.specifications ?? parsed ?? null;
      } catch {
        return null;
      }
    };

    // 1. Try Product's specifications
    // Direct GraphQL fetch for specifications as a workaround for SDK codegen issues
    try {
      const gqlResponse = (await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query getProductSpecs($slug: String!) {
              product(slug: $slug) {
                customFields {
                  customData
                }
              }
            }
          `,
          variables: { slug: slug },
        }),
      }).then((res) => res.json())) as {
        data?: { product?: { customFields?: { customData?: string } } };
      };

      const directSpecs = gqlResponse?.data?.product?.customFields?.customData;
      if (directSpecs) {
        specifications = findSpecs(directSpecs);
      }
    } catch (e) {
      console.error('Error in direct specifications fetch:', e);
    }

    if (!specifications) {
      specifications = findSpecs(product?.customFields?.customData);
    }

    // 2. Fallback to Collection's customData
    if (!specifications && collectionResult.status === 'fulfilled') {
      specifications = findSpecs(
        collectionResult.value?.collection?.customFields?.customData,
      );
    }

    // ─── Sanitize description ───────────────────────────────────────────────
    const safeDescription = product?.description
      ? sanitizeHtml(product.description, {
          allowedTags: [
            'p',
            'br',
            'b',
            'strong',
            'i',
            'em',
            'u',
            'ul',
            'ol',
            'li',
            'div',
            'span',
          ],
          allowedAttributes: { '*': ['style'] },
        })
      : '';

    const variants = product?.variantProperties ?? [];
    const allOptionGroups = product?.optionProperties ?? [];
    const firstVariantId = variants[0]?.id ?? null;

    // Collect only the option group IDs that variants actually reference
    const usedGroupIds = new Set<string>();
    for (const v of variants) {
      for (const o of v.options || []) {
        if (o.group?.id) usedGroupIds.add(o.group.id);
      }
    }

    // Filter to only groups used by variants, deduplicate by ID
    const optionGroups = allOptionGroups.filter((og) =>
      usedGroupIds.has(og.id),
    );
    const hasOptions = optionGroups.length > 0 && variants.length > 1;

    // Enrich faculty images from specifications when collection-based images are missing
    let faculties = product?.faculties ?? [];
    if (specifications?.product) {
      const facultySpec = specifications.product.find(
        (s: any) =>
          s.identifier === 'our_faculty' ||
          s.identifier === 'faculty_info' ||
          s.identifier === 'faculties',
      );
      const facultyInfos: Array<{
        name?: string;
        imageUrl?: string;
        description?: string;
      }> = facultySpec?.facultyInfos ?? [];
      if (facultyInfos.length > 0) {
        if (faculties.length === 0) {
          faculties = facultyInfos.map((f: any) => ({
            name: f.name || 'Faculty',
            image: f.imageUrl || '',
            description: f.description || '',
          }));
        } else {
          faculties = faculties.map((fd: any) => {
            const fdName = fd.name?.toLowerCase() || '';
            const match = facultyInfos.find((f: any) => {
              const fName = f.name?.toLowerCase() || '';
              return (
                fName &&
                (fName === fdName ||
                  fName.includes(fdName) ||
                  fdName.includes(fName))
              );
            });
            if (match) {
              return {
                ...fd,
                image: fd.image || match.imageUrl || '',
                description: fd.description || match.description || '',
              };
            }
            return fd;
          });
        }
      }
    }

    // Prefer the short_description spec over the Vendure description field
    const specList = specifications?.product || [];
    const shortDescSpec = specList.find(
      (s: any) => s.identifier === 'short_description',
    );
    const finalDescription = shortDescSpec?.text
      ? sanitizeHtml(shortDescSpec.text, {
          allowedTags: [
            'p',
            'br',
            'b',
            'strong',
            'i',
            'em',
            'u',
            'ul',
            'ol',
            'li',
            'div',
            'span',
          ],
          allowedAttributes: { '*': ['style'] },
        })
      : safeDescription;

    const productData = product
      ? {
          id: product.id,
          title: product.title,
          description: finalDescription,
          price: product.priceWithTax
            ? `₹${(product.priceWithTax / 100).toLocaleString('en-IN')}`
            : '',
          priceWithTax: product.priceWithTax,
          featuredAsset: product.featuredAsset ?? null,
          faculties,
          facetValues: product.facetValues ?? [],
          variantId: firstVariantId,
          ...(hasOptions && {
            optionGroups: optionGroups.map((og) => ({
              id: og.id,
              name: og.name,
              code: og.code,
              options: og.options.map((o: any) => ({ id: o.id, name: o.name })),
            })),
            variants: variants.map((v) => ({
              id: v.id,
              name: v.name,
              priceWithTax: v.priceWithTax,
              currencyCode: v.currencyCode,
              sku: v.sku,
              stockLevel: v.stockLevel,
              options: (v.options || []).map((o: any) => ({
                id: o.id,
                name: o.name,
                group: o.group
                  ? { id: o.group.id, name: o.group.name }
                  : undefined,
              })),
            })),
          }),
        }
      : null;

    return json({ slug: slug, product: productData, specifications });
  } catch (error) {
    console.error('Error loading course detail:', error);
    return json({ slug: slug, product: null, specifications: null });
  }
}

export default function Olympiad() {
  const { activeCustomer: customerData } = useRootLoader();
  const { slug, product, specifications } = useLoaderData<typeof loader>();

  // Log loader data once on mount to avoid infinite console logs
  useEffect(() => {
    console.log('🚀 Loader data:', { slug, product, specifications });
  }, []);

  // Extract specifications data
  const extractSpecData = (identifier: string) => {
    if (!specifications?.product || !Array.isArray(specifications.product))
      return null;
    const spec = specifications.product.find(
      (s: any) => s.identifier === identifier,
    );
    if (!spec) return null;

    // Handle different data structures
    if (spec.items) return spec.items;
    if (spec.data) return Array.isArray(spec.data) ? spec.data : [spec.data];
    if (spec.text) {
      try {
        const parsed = JSON.parse(spec.text);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return spec.text;
      }
    }
    return spec;
  };

  const keyDetails = extractSpecData('key-details') || [];
  const prizePool = extractSpecData('prize-pool') || [];
  const subjects = extractSpecData('subjects') || [];
  const rules = extractSpecData('rules') || [];
  const faqs = extractSpecData('faqs') || [];
  const images = extractSpecData('images') || [];

  // console.log('🚀 Extracted specifications:', {
  //   keyDetails,
  //   prizePool,
  //   subjects,
  //   rules,
  //   faqs,
  //   images,
  // });

  // Use real FAQ data from specifications
  const items = Array.isArray(faqs?.faqItems) ? faqs.faqItems : [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isContentInView, setIsContentInView] = useState(false);
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFooterRegisterClick = () => setIsRegisterPopupOpen(true);
    window.addEventListener(
      'bb-olympiad-register-open',
      handleFooterRegisterClick,
    );
    return () => {
      window.removeEventListener(
        'bb-olympiad-register-open',
        handleFooterRegisterClick,
      );
    };
  }, []);

  // Track login status
  const isLoggedIn = !!customerData?.activeCustomer;

  // Initialize revalidator for refreshing customer data
  const revalidator = useRevalidator();

  // Handle registration completion - refresh customer data
  const handleRegistrationComplete = useCallback(() => {
    revalidator.revalidate();
  }, [revalidator]);

  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = new Date('2026-05-03T00:00:00').getTime();
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsContentInView(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Toast Notification */}
      {cartMessage && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg animate-in fade-in duration-300 ${
            cartMessage.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {cartMessage.text}
        </div>
      )}

      {/* top bar */}
      <header className={`md:flex hidden py-3`}>
        <div className="flex justify-between items-center gap-2 w-full custom-container">
          {/* Left Side: Contact Info */}
          <div className="flex items-center space-x-3 sm:space-x-5 text-lightgray text-base leading-[100%]">
            <a
              href="tel:7718866966"
              className="flex items-center gap-1 sm:gap-2 hover:text-blue-600 transition-colors text-xs sm:text-base"
            >
              <Phone size={14} className="text-lightgray" />
              <span className="text-base">7718866966</span>
            </a>

            <a
              href="mailto:global@bbvirtuals.com"
              className="flex items-center gap-1 sm:gap-2 hover:text-blue-600 transition-colors text-xs sm:text-base"
            >
              <Mail size={14} className="text-lightgray" />
              <span className="text-base">global@bbvirtuals.com</span>
            </a>
          </div>

          {/* Right Side: Social Media */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <SocialDropdown
                icon={<Instagram size={18} />}
                label="Instagram"
                items={instagramPages}
                hoverColor="hover:text-pink-600"
              />
              <SocialDropdown
                icon={<Youtube size={20} />}
                label="YouTube"
                items={youtubeChannels}
                hoverColor="hover:text-red-600"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-[#EDF1FF] ">
        {/* nav bar */}
        <nav className="w-full py-5 relative z-20 hidden md:flex items-center justify-center">
          {/* Logo */}
          <div className="shrink-0">
            <a href="/" className="flex items-center justify-center">
              <img
                className="w-30 md:w-37.5 xl:w-40.75"
                src="/assets/logo.png"
                alt="Logo"
              />
            </a>
          </div>
        </nav>

        {/* desktop hero */}
        <section className="hidden sm:flex relative w-full">
          <img
            src="/assets/images/olympiad/bg2.png"
            alt="Olympiad Banner"
            className="w-full h-auto object-cover"
          />

          {/* overlay content */}
          <div className="absolute inset-0 flex flex-col justify-between items-center py-8">
            {/* top content */}
            <div className="flex flex-col gap-9 justify-center items-center w-full lg:pt-24">
              <div className="flex flex-col items-center justify-center gap-5">
                <div className="flex flex-col items-center justify-center gap-4">
                  {/* pill note */}
                  <div className="inline-flex items-center gap-2 md:px-4 px-3 py-1 md:py-2  leading-[120%] rounded-full bg-white/25 text-xs md:text-base font-medium text-white/70 border border-white/5">
                    <span>All India</span>

                    <span className="w-1 h-1 rounded-full bg-white/70"></span>

                    <span>CUET</span>
                  </div>

                  <h1
                    className="font-oswald text-5xl md:text-7xl xl:text-[115px] leading-[120%] tracking-[0%] uppercase font-bold text-center text-white"
                    style={{
                      WebkitTextStroke: '2px #012372',
                      color: 'white',
                      filter: 'drop-shadow(0px -12px 0px #012372)',
                    }}
                  >
                    Commerce Olympiad 2026
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {Array.isArray(keyDetails) && keyDetails.length > 0 ? (
                    keyDetails.slice(0, 4).map((detail: any, idx: number) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-4 md:px-5 py-3  leading-[120%] rounded-full bg-white/10 backdrop-blur-2xl text-xs md:text-base lg:text-lg font-semibold"
                      >
                        <span className="text-white/55 uppercase tracking-[1.4px]">
                          {detail.name}
                        </span>

                        <span className="w-[1px] h-[16px] font-bold bg-white/25"></span>

                        <span className="text-white">
                          {detail.extraFields?.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-white/70">Loading details...</span>
                  )}
                </div>
              </div>
              {/* button */}
              <button
                onClick={() => setIsRegisterPopupOpen(true)}
                className="flex text-base md:text-lg lg:text-xl max-w-max cursor-pointer font-bold items-center justify-center gap-2 text-[#0A232F] bg-white px-5 md:px-8 py-2 md:py-4 rounded-full shadow-xl shadow-white/40"
              >
                Register For Free <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* bottom content */}
            <div className="flex justify-center w-full pt-4">
              <div className="text-3xl lg:text-4xl font-bold leading-[120%] px-5 md:px-8 py-4 md:py-5 bg-[#FFC600] rounded-full font-oswald tracking-[2%] uppercase text-[#3B310B] shadow-[0px_6px_0px_0px_rgba(163,114,0,1)]">
                ₹3.2 Lakh Pool
              </div>
            </div>
          </div>
        </section>

        {/* mobile hero */}
        <section className="sm:hidden flex relative w-full">
          <img
            src="/assets/images/olympiad/mobile-bg2.png"
            alt="Olympiad Banner"
            className="w-full h-auto object-cover"
          />

          {/* overlay content */}
          <div className="absolute inset-0 flex flex-col justify-between items-center py-5">
            {/* top content */}
            <div className="flex flex-col gap-9 justify-center items-center w-full pt-10">
              <div className="flex flex-col items-center justify-center gap-5 w-full">
                <div className="flex flex-col items-center justify-center gap-4 relative w-full">
                  {/* left arrow */}
                  <div className="absolute left-4 top-0">
                    <ArrowLeft className="w-6 h-6 text-white/50" />
                  </div>
                  <div className="pt-10 flex flex-col items-center gap-4">
                    <div className="inline-flex  items-center gap-2 px-3 py-1 leading-[120%] rounded-full bg-white/25 text-xs sm:text-base font-medium text-white/90 border border-white/5">
                      <span>All India</span>
                      <span className="w-1 h-1 rounded-full bg-white/90"></span>
                      <span>CUET</span>
                    </div>

                    <h1
                      className="font-oswald text-[50px] leading-[120%] uppercase font-bold text-center text-white"
                      style={{
                        WebkitTextStroke: '1px #012372',
                        color: 'white',
                        filter: 'drop-shadow(0px -3px 0px #012372)',
                      }}
                    >
                      Commerce <br /> Olympiad 2026
                    </h1>
                  </div>

                  {/* box infos FULL EDGE TO EDGE */}
                  <div className="grid grid-cols-2 grid-rows-2 w-screen mt-2 overflow-hidden">
                    {Array.isArray(keyDetails) && keyDetails.length > 0 ? (
                      keyDetails.slice(0, 4).map((detail: any, idx: number) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 px-3 py-3 backdrop-blur-2xl bg-white/10 text-xs font-semibold relative ${
                            idx % 2 === 0
                              ? 'after:absolute after:top-0 after:right-0 after:w-px after:h-full after:bg-white/20'
                              : ''
                          }`}
                        >
                          <span className="text-white/55 uppercase tracking-[1.4px]">
                            {detail.name}
                          </span>

                          <span className="w-[1px] h-[16px] bg-white/20"></span>

                          <span className="text-white">
                            {detail.extraFields?.value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="col-span-2 text-white/70 p-3">
                        Loading details...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* button */}
              <button
                onClick={() => setIsRegisterPopupOpen(true)}
                className="flex md:text-xl max-w-max cursor-pointer font-bold items-center justify-center gap-2 text-[#0A232F] bg-white px-5 md:px-8 py-3 md:py-4 rounded-full shadow-xl shadow-white/40"
              >
                Register For Freee <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* bottom content */}
            <div className="flex justify-center w-full pt-2">
              <div className="text-2xl md:text-4xl font-bold leading-[120%] px-3 md:px-8 py-2 md:py-5 bg-[#FFC600] rounded-full font-oswald tracking-[2%] uppercase text-[#3B310B] shadow-[0px_2.15px_0px_0px_rgba(163,114,0,1)]">
                ₹3.2 Lakh Pool
              </div>
            </div>
          </div>
        </section>

        {/* mobile overlay button */}
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 py-4 gap-4 z-50 bg-[#EDF1FF] backdrop-blur-sm border-t border-[#0A232F]/10 transition-all duration-300 ${
            isContentInView
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-start flex-col gap-1">
            <p className="font-bold text-xl text-[#081627]">Free</p>
            <p className="text-xs text-[#0A232F]/50 font-medium leading-[150%]">
              Closes 3 May, 9:00 AM IST
            </p>
          </div>
          <button
            onClick={() => setIsRegisterPopupOpen(true)}
            className="flex cursor-pointer text-[14px] font-semibold items-center justify-center gap-1  text-white px-4 py-3 rounded-full primary-btn"
          >
            Register For Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* content */}
        <div
          ref={contentRef}
          className="w-full max-w-350 mx-auto px-4 py-12 space-y-20 lg:space-y-32"
        >
          <div className="flex flex-col lg:flex-row lg:items-start gap-20 ">
            {/* Main Content - Left Column */}
            <div className="min-w-0 flex-1 space-y-20 lg:max-w-none">
              {/* Prize Pool */}
              <div className="flex flex-col gap-9">
                {/* title */}
                <h2 className="font-bold text-[#0A232F]/35 text-2xl md:text-[30px] uppercase leading-[150%] tracking-wide font-oswald text-center lg:text-left">
                  Prize Pool
                </h2>

                {/* card */}
                <div className="bg-white border w-full border-[#A37200]/50 min-h-[532px] overflow-hidden rounded-2xl shadow-[6px_6px_0px_0px_rgba(163,114,0,0.5)]">
                  {' '}
                  {/* header */}
                  <div className="py-[16px] px-[24px] border-b border-[#F5B100]/25 bg-[#F5B100]/16">
                    <h3 className="text-sm font-bold leading-[100%] uppercase text-[#A37200] text-center">
                      Cash + BB Virtuals CA Foundation Course (worth ₹15,999)
                    </h3>
                  </div>
                  {/* Medal color mapping */}
                  {Array.isArray(prizePool) && prizePool.length > 0 ? (
                    <>
                      {/* Desktop view */}
                      {prizePool.map((prize: any, idx: number) => {
                        const medalColorMap: { [key: string]: string } = {
                          gold: '#FFD700',
                          silver: '#C0C0C0',
                          bronze: '#CD7F32',
                          blue: '#1A56DB',
                          green: '#10B981',
                        };
                        const medalColor =
                          medalColorMap[prize.extraFields?.medal_color] ||
                          '#1A56DB';
                        const isImage = idx < 3; // First 3 have images
                        const useStar = idx >= 3; // Rest use medal badges

                        return (
                          <div key={`desktop-${idx}`}>
                            {/* Desktop */}
                            <div
                              className={`p-5 hidden md:flex items-center justify-between border-b border-[#0A232F]/8 ${
                                idx === 0 ? 'bg-[#F5B100]/6' : ''
                              }`}
                            >
                              <div className="flex items-center justify-center gap-3">
                                {isImage ? (
                                  <img
                                    src={prize.extraFields?.icon_url}
                                    alt={prize.name}
                                    className="w-[40px] h-[40px]"
                                  />
                                ) : (
                                  <div
                                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: medalColor }}
                                  >
                                    <Star className="w-[15px] h-[15px] text-white fill-white translate-x-[0.5px]" />
                                  </div>
                                )}

                                <div className="flex flex-col">
                                  <p className="font-bold text-base leading-[120%]">
                                    {prize.name}
                                  </p>
                                  <p className="text-[#0A232F]/50 font-medium">
                                    {prize.extraFields?.cash_prize && (
                                      <span className="text-[#0A232F] font-bold">
                                        {prize.extraFields?.cash_prize}{' '}
                                      </span>
                                    )}
                                    {prize.extraFields?.cash_prize && <>+ </>}
                                    {prize.extraFields?.course_scholarship}
                                  </p>
                                </div>
                              </div>
                              <div className="font-bold text-xl leading-[120%]">
                                {prize.extraFields?.total_value}
                              </div>
                            </div>

                            {/* Mobile */}
                            <div
                              className={`px-3 py-4 md:hidden flex flex-row gap-3 border-b border-[#0A232F]/8 ${
                                idx === 0 ? 'bg-[#F5B100]/6' : ''
                              }`}
                            >
                              {isImage ? (
                                <img
                                  src={prize.extraFields?.icon_url}
                                  alt={prize.name}
                                  className="w-[40px] h-[40px]"
                                />
                              ) : (
                                <div
                                  className="w-[70px] h-[40px] rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: medalColor }}
                                >
                                  <Star className="w-[15px] h-[15px] text-white fill-white translate-x-[0.5px]" />
                                </div>
                              )}
                              <div className="flex flex-col items-start gap-5">
                                <div className="flex flex-col gap-2">
                                  <p className="font-bold text-base leading-[120%]">
                                    {prize.name}
                                  </p>
                                  <p className="text-[#0A232F]/50 font-medium">
                                    {prize.extraFields?.cash_prize && (
                                      <span className="text-[#0A232F] font-bold">
                                        {prize.extraFields?.cash_prize}{' '}
                                      </span>
                                    )}
                                    {prize.extraFields?.cash_prize && <>+ </>}
                                    {prize.extraFields?.course_scholarship}
                                  </p>
                                </div>

                                <div className="font-bold text-xl leading-[120%]">
                                  {prize.extraFields?.total_value}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="p-5 text-[#0A232F]/50">No prizes available</p>
                  )}
                </div>
              </div>

              {/* Subjects */}
              <div className="flex flex-col gap-9">
                {/* title */}
                <h2 className="font-bold text-[#0A232F]/35 text-xl md:text-[30px] uppercase leading-[150%] tracking-wide font-oswald text-center lg:text-left">
                  Subjects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {Array.isArray(subjects) && subjects.length > 0 ? (
                    subjects.map((subject: any, idx: number) => {
                      // Define color scheme (cycles through 4 colors)
                      const colorSchemes = [
                        {
                          borderColor: '#1A56DB',
                          borderClass: 'border-[#1A56DB]/50',
                          shadowClass:
                            'shadow-[6px_6px_0px_0px_rgba(26,86,219,0.5)]',
                          bgLight: 'rgba(26, 86, 219, 0.1)',
                          textColor: '#1A56DB',
                        },
                        {
                          borderColor: '#0E9488',
                          borderClass: 'border-[#0E9488]/50',
                          shadowClass:
                            'shadow-[6px_6px_0px_0px_rgba(14,148,136,0.5)]',
                          bgLight: 'rgba(20, 184, 166, 0.14)',
                          textColor: '#0E9488',
                        },
                        {
                          borderColor: '#E11D48',
                          borderClass: 'border-[#E11D48]/90',
                          shadowClass:
                            'shadow-[6px_6px_0px_0px_rgba(225,29,72,0.5)]',
                          bgLight: 'rgba(225, 29, 72, 0.1)',
                          textColor: '#E11D48',
                        },
                        {
                          borderColor: '#B45309',
                          borderClass: 'border-[#B45309]/90',
                          shadowClass:
                            'shadow-[6px_6px_0px_0px_rgba(180,83,9,0.5)]',
                          bgLight: '#FEF3C7',
                          textColor: '#B45309',
                        },
                      ];
                      const colorScheme = colorSchemes[idx % 4];

                      return (
                        <div
                          key={idx}
                          className={`bg-white flex flex-col p-4 md:p-5 gap-5 border w-full ${colorScheme.borderClass} min-h-[139px] overflow-hidden rounded-2xl ${colorScheme.shadowClass}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="flex items-center justify-center rounded-xl uppercase font-semibold text-2xl w-[48px] h-[48px]"
                              style={{
                                color: colorScheme.textColor,
                                backgroundColor: colorScheme.bgLight,
                              }}
                            >
                              {subject.extraFields?.badge_letter}
                            </div>
                            <div className="flex flex-col">
                              <p className="font-semibold text-[#0A232F]">
                                {subject.name}
                              </p>
                              <p className="font-medium text-sm text-[#0A232FCC]/80 opacity-70">
                                {subject.extraFields?.topics}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 md:gap-3">
                            <div
                              className="py-1 px-3 font-semibold text-sm rounded-full max-w-max"
                              style={{
                                backgroundColor: colorScheme.bgLight,
                                color: colorScheme.textColor,
                              }}
                            >
                              {subject.extraFields?.questions}
                            </div>
                            <div className="py-1 px-3 bg-[#F3F4F6] text-[#0A232FCC]/90 font-semibold text-sm rounded-full max-w-max">
                              {subject.extraFields?.duration}
                            </div>
                            <div className="py-1 px-3 bg-[#F3F4F6] text-[#0A232FCC]/90 font-semibold text-sm rounded-full max-w-max">
                              {subject.extraFields?.marking}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[#0A232F]/50">No subjects available</p>
                  )}
                </div>
              </div>

              {/* Rules */}
              <div className="flex flex-col gap-9">
                {/* title */}
                <h2 className="font-bold text-[#0A232F]/35 text-2xl md:text-[30px] uppercase leading-[150%] tracking-wide font-oswald text-center lg:text-left">
                  Rules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {Array.isArray(rules) && rules.length > 0 ? (
                    rules.map((rule: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white flex flex-col p-5 gap-4 border w-full border-[#3A6BFC]/50 min-h-[139px] overflow-hidden rounded-2xl shadow-[6px_6px_0px_0px_rgba(58,107,252,0.5)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <p className="font-semibold leading-[120%] text-[#0A232]">
                              {rule.extraFields?.rule_number}. {rule.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-[#0A232F]/50 leading-[150%]">
                          {rule.extraFields?.detail}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#0A232F]/50">No rules available</p>
                  )}
                </div>
              </div>

              {/* Faqs */}
              {/* <div className="flex flex-col gap-9">
                <h2 className="font-bold text-[#0A232F]/35 text-2xl md:text-[30px] uppercase leading-[150%] tracking-wide font-oswald text-center lg:text-left">
                  Faqs
                </h2>
                <div className="space-y-4">
                  {items.map((item: any, i: number) => {
                    const open = openIdx === i;
                    return (
                      <div
                        key={i}
                        className="flex rounded-2xl  bg-white/50 px-4 py-4 sm:px-6"
                      >
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => setOpenIdx(open ? null : i)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-base sm:text-lg font-medium text-slate-800">
                              {item.question}
                            </p>

                            <div className="shrink-0 flex items-center justify-center p-1 bg-[#0A232F]/3 rounded-full">
                              {open ? (
                                <ChevronDown className="size-4 text-[#0A232F]" />
                              ) : (
                                <ChevronRight className="size-4 text-[#0A232F]" />
                              )}
                            </div>
                          </div>

                          <div
                            className={`grid transition-[grid-template-rows] duration-200 ${
                              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <p className="mt-2 text-sm sm:text-base leading-relaxed text-lightgray/50">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div> */}
            </div>

            {/* Sticky Sidebar - Right Column */}
            <aside className="shrink-0 lg:sticky lg:top-32 mt-20  w-[360px] hidden  lg:block ">
              <div className="flex flex-col rounded-[24px] h-[553px] border border-[#3A6BFC]/50 shadow-[6px_6px_0px_0px_rgba(58,107,252,0.5)] bg-white p-5 gap-4">
                {' '}
                <p className="font-bold text-xs uppercase tracking-[1.32px] text-[#9CA3AF]">
                  Exam dates
                </p>
                <p className="font-semibold text-3xl leading-[120%] uppercase font-oswald">
                  3–5 May 2026
                </p>
                <p className="font-medium text-[14px] text-[#0A232F]/80">
                  1 mock test per subject
                </p>
                <div className="border-t mt-2 border-[#0A232F14]/50" />
                {/* timer */}
                <div className="flex items-center justify-center px-4 my-1">
                  {/* item */}
                  <div className="flex flex-col items-center justify-center px-6 border-r border-[#0A232F14]/50">
                    <p className="text-[#3A6BFC] font-bold leading-[24px] text-[24px]">
                      {String(countdown.days).padStart(2, '0')}
                    </p>
                    <p className="font-bold text-[10px] text-[#9CA3AF] uppercase tracking-[1.2px]">
                      Days
                    </p>
                  </div>

                  {/* item */}
                  <div className="flex flex-col items-center justify-center px-6 border-r border-[#0A232F14]/50">
                    <p className="text-[#3A6BFC] font-bold leading-[24px] text-[24px]">
                      {String(countdown.hours).padStart(2, '0')}
                    </p>
                    <p className="font-bold text-[10px] text-[#9CA3AF] uppercase tracking-[1.2px]">
                      Hrs
                    </p>
                  </div>

                  {/* item */}
                  <div className="flex flex-col items-center justify-center px-6 border-r border-[#0A232F14]/50">
                    <p className="text-[#3A6BFC] font-bold leading-[24px] text-[24px]">
                      {String(countdown.minutes).padStart(2, '0')}
                    </p>
                    <p className="font-bold text-[10px] text-[#9CA3AF] uppercase tracking-[1.2px]">
                      Min
                    </p>
                  </div>

                  {/* last item (no border) */}
                  <div className="flex flex-col items-center justify-center px-6 border-r border-[#0A232F14]/50">
                    <p className="text-[#3A6BFC] font-bold leading-[24px] text-[24px]">
                      {String(countdown.seconds).padStart(2, '0')}
                    </p>
                    <p className="font-bold text-[10px] text-[#9CA3AF] uppercase tracking-[1.2px]">
                      Sec
                    </p>
                  </div>
                </div>
                <div className="border-t mb-2 border-[#0A232F14]/50" />
                <div className="flex flex-col gap-3">
                  <p className="flex items-center gap-2">
                    <Check className="text-[#10B981]" /> Free entry
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[#10B981]" /> Open to all CUET
                    aspirants
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[#10B981]" /> Top 50 win prizes
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[#F5B100]" /> ₹3.2 Lakh prize pool
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[#10B981]" /> Results in 24 hours
                  </p>
                </div>
                {/* button */}
                <div className="flex items-center flex-col justify-center gap-3 mt-4">
                  <button
                    onClick={() => setIsRegisterPopupOpen(true)}
                    className="flex cursor-pointer text-base font-semibold items-center justify-center gap-2  text-white primary-btn px-4 py-3 rounded-full w-full "
                  >
                    Register For Free <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="text-[#0A232F]/80 font-medium text-sm">
                    Takes under 60 seconds
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <RegisterPopup
        customer={customerData}
        isOpen={isRegisterPopupOpen}
        onClose={() => setIsRegisterPopupOpen(false)}
        onRegistrationComplete={handleRegistrationComplete}
        autoCloseDelay={3000}
        productVariantId={product?.variantId || null}
      />
    </>
  );
}
