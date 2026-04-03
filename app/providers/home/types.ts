// GraphQL types for home data structure
export interface HomeMeta {
  url: string;
  title: string;
  description: string;
}

export interface HomeHero {
  heading: string;
  intro: string;
  specialEvent?: {
    image: string;
    title: string;
    subtitle?: string;
    slug: string;
  };
}

export interface HomeBlog {
  name: string;
  slug: string;
  image: string;
}

export interface HomeCourse {
  id: string;
  title: string;
  image: string;
  price: string;
  slug: string;
  offerPrice?: string;
}

export interface HomeBook {
  id: string;
  title: string;
  image: string;
  price: string;
  slug: string;
  offerPrice?: string;
}

export interface HomeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  image?: string;
};

export interface HomeStat {
  id: string;
  label: string;
  value: string;
  icon: string;
};

export interface HomeTestimonial {
  author: string;
  role: string;
  text: string;
  image: string;
}

export interface HomeStats {
  id: string;
  icon: string;
  value: string;
  text: string;
}

export interface HomeFAQ {
  q: string;
  a: string;
}

export interface HomeContactPhone {
  ca_foundation: string;
  ca_inter: string;
  ca_final: string;
}

export interface HomeContact {
  email: string[];
  phone: HomeContactPhone;
  address: string;
}

export interface HomeLink {
  title: string;
  url: string;
}

export interface HomeFaculty {
  name: string;
  slug: string;
  profile_url?: string;
  image: string;
  level?: string[];
  courses: {name: string, slug: string}[];
}

// Section data with heading and subheading support
export interface HomeSectionData<T> {
  heading?: string;
  subheading?: string;
  data: T[];
}

export interface HomeMessage {
  author: string;
  title: string;
  message: string;
}

export interface HomeOffer {
  imageUrl: string;
  imageAlt: string;
}

export interface HomeData {
  hero: HomeHero;
  banners: HomeSectionData<{
    id: string;
    url: string;
  }>;
  testimonials: HomeSectionData<HomeTestimonial>;
  message: HomeMessage;
  faqs: HomeSectionData<HomeFAQ>;
  offer: HomeOffer | null;
}

// GraphQL query types
export interface HomeQuery {
  home: HomeData;
}

export interface HomeQueryVariables {
  // No variables needed for static data
}
