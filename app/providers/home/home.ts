import type { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';
import { search } from '~/providers/products/products';
import {
  HomeBook,
  HomeCourse,
  HomeVideo,
  HomeTestimonial,
  HomeMessage,
  HomeStat,
} from './types';

export async function getHomePopup(options: QueryOptions): Promise<{
  imageUrl: string;
  imageAlt: string;
} | null> {
  try {
    const result = await getCollectionBySlug('home-popup', options);
    if (result.collection?.featuredAsset?.preview) {
      return {
        imageUrl: result.collection?.featuredAsset.preview,
        imageAlt: result.collection?.name || 'Popup',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getHomeBanners(options: QueryOptions): Promise<any> {
  try {
    const result = await getCollectionBySlug('home-banners', options);
    if (!result.collection?.customFields?.customData) return [];
    const homeBanners = JSON.parse(result.collection.customFields.customData);
    return typeof homeBanners === 'object' ? homeBanners : [];
  } catch {
    return [];
  }
}

export async function getHomeCourses(options: QueryOptions): Promise<{
  heading: string;
  viewAllUrl: string;
  courses: HomeCourse[];
}> {
  const fallbackResult = {
    heading: 'Hot Selling Courses',
    viewAllUrl: '/',
    courses: [],
  };
  try {
    const result = await getCollectionBySlug('home-courses', options);
    if (!result.collection) return fallbackResult;
    const customData = result.collection.customFields?.customData
      ? JSON.parse(result.collection.customFields.customData)
      : {};

    const normalizeViewAllUrl = (
      url: string | undefined,
      fallbackSubjectUrl: string,
    ): string => {
      const value = String(url || '').trim();
      if (!value) return fallbackSubjectUrl;

      // Known broken pattern from CMS data: /faculty/<slug>/courses
      if (/^\/faculty\/[^/]+\/courses\/?$/i.test(value)) {
        return fallbackSubjectUrl;
      }

      // Allow valid internal routes only; otherwise fallback.
      if (
        value.startsWith('/courses') ||
        value.startsWith('/products2') ||
        value.startsWith('/books') ||
        value.startsWith('/lectures') ||
        value.startsWith('/test-series') ||
        value === '/'
      ) {
        // `/courses` is too broad for homepage "View all".
        // Prefer subject listing page similar to screenshot-2.
        if (value === '/courses') return fallbackSubjectUrl;
        return value;
      }

      return fallbackSubjectUrl;
    };

    const inferDefaultLecturesUrl = (courses: any[]): string => {
      const firstTitle = String(courses?.[0]?.productName || '').toLowerCase();
      if (
        firstTitle.includes('foundation') &&
        firstTitle.includes('quantitative')
      ) {
        return '/lectures/ca-found/quantitative-aptitude';
      }
      if (firstTitle.includes('inter')) {
        return '/lectures/ca-inter/financial-management';
      }
      if (firstTitle.includes('final')) {
        return '/lectures/ca-final/advanced-financial-management';
      }
      return '/lectures/ca-found/quantitative-aptitude';
    };
    const searchResult = await search(
      {
        input: {
          groupByProduct: true,
          collectionSlug: 'home-courses',
          take: 4,
          skip: 0,
        },
      },
      { request: options.request },
    );

    const searchItems = searchResult?.search?.items || [];
    const defaultLecturesUrl = inferDefaultLecturesUrl(searchItems as any[]);
    return {
      heading: customData.title || result.collection.name,
      viewAllUrl: normalizeViewAllUrl(
        customData.viewAllUrl,
        defaultLecturesUrl,
      ),
      courses: (searchItems as any).map((item: any) => {
        const offers = item.offers ? JSON.parse(item.offers) : [];
        const discountPrice = offers
          .map((offer: any) => offer.discountAmount)
          .reduce((a: number, b: number) => a + b, 0);
        const priceInPaise = item.priceWithTax?.value
          ? item.priceWithTax.value
          : item.priceWithTax.min
          ? item.priceWithTax.min
          : 0;
        const priceInRupees = priceInPaise / 100;
        const offerPrice = priceInRupees - discountPrice;
        return {
          id: item.productId,
          title: item.productName,
          image: item.productAsset?.preview || '',
          price: `₹${priceInRupees.toFixed(2)}`,
          offerPrice:
            discountPrice > 0 ? `₹${offerPrice.toFixed(2)}` : undefined,
          slug: item.slug,
        };
      }) as HomeCourse[],
    };
  } catch {
    return fallbackResult;
  }
}

export async function getHomeBooks(options: QueryOptions): Promise<{
  heading: string;
  viewAllUrl: string;
  books: HomeBook[];
}> {
  const fallbackResult = {
    heading: 'Hot Selling Books',
    viewAllUrl: '/',
    books: [],
  };
  try {
    const result = await getCollectionBySlug('home-books', options);
    if (!result.collection) return fallbackResult;

    const rawCustomData = result.collection.customFields?.customData;
    let parsedCustomData: any = {};
    try {
      parsedCustomData = rawCustomData ? JSON.parse(rawCustomData) : {};
    } catch {
      parsedCustomData = {};
    }

    // 1) Build books from customFields.customData (supports both hard/soft)
    const customBooks: any[] = Array.isArray(parsedCustomData)
      ? parsedCustomData
      : Array.isArray(parsedCustomData?.books)
      ? parsedCustomData.books
      : [];

    const normalizeSlug = (value: string) =>
      String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    const courseSlugFromLevel = (level: string) => {
      const v = normalizeSlug(level);
      if (v.includes('found')) return 'ca-found';
      if (v.includes('inter')) return 'ca-inter';
      if (v.includes('final')) return 'ca-final';
      return v;
    };

    const customViewAllUrl =
      typeof parsedCustomData === 'object' &&
      parsedCustomData &&
      !Array.isArray(parsedCustomData) &&
      parsedCustomData.viewAllUrl
        ? String(parsedCustomData.viewAllUrl)
        : (() => {
            const first = customBooks[0];
            if (!first) return '/';
            const level = first.level || '';
            const category =
              first.category || first.subject || first.title || '';
            const courseSlug = courseSlugFromLevel(level);
            const subjectSlug = normalizeSlug(category);
            if (!courseSlug || !subjectSlug) return '/';
            return `/books/${courseSlug}/${subjectSlug}`;
          })();

    if (customBooks.length > 0) {
      const hard = customBooks.filter(
        (b: any) => String(b.type || '').toLowerCase() === 'hardcopy',
      );
      const soft = customBooks.filter(
        (b: any) => String(b.type || '').toLowerCase() === 'softcopy',
      );

      // Prefer showing both hard/soft if present.
      const preferredBooks = [
        ...hard.slice(0, 2),
        ...soft.slice(0, 2),
        ...customBooks.filter((b: any) => {
          const key = String(b.id ?? b.slug ?? '');
          return !key
            ? false
            : ![...hard.slice(0, 2), ...soft.slice(0, 2)].some(
                (x: any) => String(x.id ?? x.slug ?? '') === key,
              );
        }),
      ].slice(0, 4);

      const booksFromCustomData = preferredBooks.map((b: any) => {
        const priceNum = Number(b.price ?? 0);
        const discountPriceNum = Number(b.discountPrice ?? priceNum);
        const hasDiscount = discountPriceNum > 0 && discountPriceNum < priceNum;
        const offerPrice = hasDiscount ? discountPriceNum : undefined;

        // Prefer thumbnail; support thumbnail arrays if present.
        const image =
          (Array.isArray(b.thumbnail) ? b.thumbnail[0] : b.thumbnail) ||
          (Array.isArray(b.images) ? b.images[0] : b.images) ||
          b.image ||
          '';

        return {
          id: String(b.id ?? b.slug ?? ''),
          title: String(b.title ?? b.category ?? 'Book'),
          image: String(image),
          price: `₹${priceNum}`,
          offerPrice: offerPrice !== undefined ? `₹${offerPrice}` : undefined,
          slug: String(b.slug ?? ''),
        } as HomeBook;
      });

      return {
        heading:
          (typeof parsedCustomData === 'object' &&
          parsedCustomData?.title &&
          !Array.isArray(parsedCustomData)
            ? String(parsedCustomData.title)
            : result.collection.name) || fallbackResult.heading,
        viewAllUrl: customViewAllUrl || fallbackResult.viewAllUrl,
        books: booksFromCustomData.filter((b) => b.slug && b.id),
      };
    }

    // 2) Fallback to GraphQL products (if customData isn't set)
    const searchResult = await search(
      {
        input: {
          groupByProduct: true,
          collectionSlug: 'home-books',
          take: 4,
          skip: 0,
        },
      },
      { request: options.request },
    );

    const searchItems = searchResult?.search?.items || [];
    const customDataObj =
      typeof parsedCustomData === 'object' && parsedCustomData
        ? parsedCustomData
        : {};

    return {
      heading: customDataObj.title || result.collection.name,
      viewAllUrl: customDataObj.viewAllUrl || '/',
      books: (searchItems as any).map((item: any) => {
        const offers = item.offers ? JSON.parse(item.offers) : [];
        const discountPrice = offers
          .map((offer: any) => offer.discountAmount)
          .reduce((a: number, b: number) => a + b, 0);
        const priceInPaise = item.priceWithTax?.value
          ? item.priceWithTax.value
          : item.priceWithTax.min
          ? item.priceWithTax.min
          : 0;
        const priceInRupees = priceInPaise / 100;
        const offerPrice = priceInRupees - discountPrice;
        return {
          id: item.productId,
          title: item.productName,
          image: item.productAsset?.preview || '',
          price: `₹${priceInRupees}`,
          offerPrice:
            discountPrice > 0 ? `₹${offerPrice.toFixed(2)}` : undefined,
          slug: item.slug,
        };
      }) as HomeBook[],
    };
  } catch {
    return fallbackResult;
  }
}

export async function getHomeVideos(options: QueryOptions): Promise<{
  heading: string;
  youtubeChannelLink: string;
  videos: HomeVideo[];
} | null> {
  try {
    const result = await getCollectionBySlug('home-videos', options);
    if (!result.collection?.customFields?.customData) return null;
    const customData = JSON.parse(result.collection.customFields.customData);

    if (typeof customData !== 'object' || customData === null) {
      return null;
    }

    const rawVideos: HomeVideo[] = Array.isArray((customData as any).videos)
      ? (customData as any).videos
      : [];

    const enrichedVideos: HomeVideo[] = await Promise.all(
      rawVideos
        .map(async (video) => {
          if (!video?.url) return video;

          // Only attempt enrichment for YouTube links
          if (
            !video.url.includes('youtube.com') &&
            !video.url.includes('youtu.be')
          ) {
            return video;
          }

          try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
              video.url,
            )}&format=json`;
            const res = await fetch(oembedUrl);
            if (!res.ok) return video;

            const data = (await res.json()) as {
              title?: string;
              thumbnail_url?: string;
            };

            return {
              ...video,
              title: video.title || data.title || '',
              thumbnail: video.thumbnail || data.thumbnail_url || '',
            };
          } catch {
            return video;
          }
        })
        .filter(Boolean),
    );
    return {
      heading: customData.title || result.collection.name || '',
      youtubeChannelLink: customData.youtubeChannelLink || '',
      videos: enrichedVideos,
    };
  } catch {
    return null;
  }
}

export async function getHomeStats(options: QueryOptions): Promise<{
  heading: string;
  stats: HomeStat[];
} | null> {
  try {
    const result = await getCollectionBySlug('home-stats', options);
    if (!result.collection?.customFields?.customData) return null;
    const homeStats = JSON.parse(result.collection.customFields.customData);
    return typeof homeStats === 'object'
      ? {
          heading: homeStats.title || result.collection.name || 'Our Impact',
          stats: homeStats.stats.map((stat: any) => ({
            id: stat.id,
            label: stat.label,
            value: stat.value,
            icon: stat.icon,
          })),
        }
      : null;
  } catch {
    return null;
  }
}

export async function getHomeTestimonials(options: QueryOptions): Promise<{
  heading: string;
  testimonials: HomeTestimonial[];
} | null> {
  try {
    const result = await getCollectionBySlug('home-testimonials', options);
    if (!result.collection?.customFields?.customData) return null;
    const homeTestimonials = JSON.parse(
      result.collection.customFields.customData,
    );
    return typeof homeTestimonials === 'object'
      ? {
          heading: homeTestimonials.title || result.collection.name,
          testimonials: homeTestimonials.testimonials.map(
            (testimonial: any) => ({
              author: testimonial.author,
              role: testimonial.role,
              text: testimonial.text,
              image: testimonial.image,
            }),
          ),
        }
      : null;
  } catch {
    return null;
  }
}

export async function getHomeMotivationalPoster(
  options: QueryOptions,
): Promise<{
  heading: string;
  poster: HomeMessage;
} | null> {
  try {
    const result = await getCollectionBySlug(
      'home-motivational-poster',
      options,
    );
    if (!result.collection?.customFields?.customData) return null;
    const homeMotivational = JSON.parse(
      result.collection.customFields.customData,
    );
    return typeof homeMotivational === 'object'
      ? {
          heading: homeMotivational.title || '',
          poster: {
            author: homeMotivational.poster.author,
            title: homeMotivational.poster.title,
            message: homeMotivational.poster.message,
          },
        }
      : null;
  } catch {
    return null;
  }
}
export async function getHomeNewLaunch(options: QueryOptions): Promise<{
  heading: string;
  viewAllUrl: string;
  courses: HomeCourse[];
}> {
  const fallbackResult = {
    heading: 'New Launch',
    viewAllUrl: '/',
    courses: [],
  };
  try {
    const result = await getCollectionBySlug('home-new-launch', options);
    if (!result.collection) return fallbackResult;
    const customData = result.collection.customFields?.customData
      ? JSON.parse(result.collection.customFields.customData)
      : {};
    const searchResult = await search(
      {
        input: {
          groupByProduct: true,
          collectionSlug: 'home-new-launch',
          take: 4,
          skip: 0,
        },
      },
      { request: options.request },
    );

    const searchItems = searchResult?.search?.items || [];
    return {
      heading: customData.title || result.collection.name,
      viewAllUrl: customData.viewAllUrl || '/',
      courses: (searchItems as any).map((item: any) => {
        const offers = item.offers ? JSON.parse(item.offers) : [];
        const discountPrice = offers
          .map((offer: any) => offer.discountAmount)
          .reduce((a: number, b: number) => a + b, 0);
        const priceInPaise = item.priceWithTax?.value
          ? item.priceWithTax.value
          : item.priceWithTax.min
          ? item.priceWithTax.min
          : 0;
        const priceInRupees = priceInPaise / 100;
        const offerPrice = priceInRupees - discountPrice;
        return {
          id: item.productId,
          title: item.productName,
          image: item.productAsset?.preview || '',
          price: `₹${priceInRupees.toFixed(2)}`,
          offerPrice:
            discountPrice > 0 ? `₹${offerPrice.toFixed(2)}` : undefined,
          slug: item.slug,
        };
      }) as HomeCourse[],
    };
  } catch {
    return fallbackResult;
  }
}
