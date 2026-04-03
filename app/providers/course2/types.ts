export interface Course2Data {
  id: string;
  name: string;
  slug: string;
  academyName: string;
  description: string;
  hero: {
    heading: string;
    intro: string;
  }
  heroSlides: Array<{
    id: string;
    url: string;
  }>;
}
