import React from 'react';
import DesktopCourseDetailPage from './DesktopCourseDetailPage';
import MobileCourseDetailPage from './MobileCourseDetailPage';

// ─── Types ────────────────────────────────────────────────────────────────────
export type SpecItem = {
  order: number;
  identifier: string;
  name: string;
  type: string;
  table?: Record<string, string>;
  text?: string;
  data?: SpecItem[];
  list?: string[];
  faqItems?: Array<{ question: string; answer: string }>;
  videoItems?: Array<{ url: string; title: string; durationMinutes: number }>;
  contactSupportDetail?: {
    title: string;
    description: string;
    buttonText: string;
    url: string;
  };
  statItems?: Array<{ label: string; value: string }>;
  extraFields?: Record<string, string>;
  facultyInfos?: Array<{
    name: string;
    imageUrl?: string;
    description?: string;
  }>;
  iconWithTextItems?: Array<{
    text: string;
    iconUrl?: string;
    muiIconName?: string;
  }>;
};

export type VariantOption = {
  id: string;
  name: string;
  value?: string;
  group?: { id: string; name: string };
};

export type OptionGroup = {
  id: string;
  name: string;
  code: string;
  options: Array<{ id: string; name: string }>;
};

export type VariantProperty = {
  id: string;
  name: string;
  priceWithTax: number;
  currencyCode: string;
  sku: string;
  stockLevel: number;
  options: VariantOption[];
};

export type ProductData = {
  id: string;
  title: string;
  description: string;
  price: string;
  priceWithTax: number;
  featuredAsset?: { preview: string } | null;
  faculties?: Array<{
    name: string;
    image: string;
    description: string;
    designation?: string;
    experience?: string;
  }>;
  facetValues?: Array<{ name: string; facet: { name: string } }>;
  customFields?: {
    customData?: string | null;
  };
  variantId?: string | null;
  optionGroups?: OptionGroup[];
  variants?: VariantProperty[];
} | null;

export type IncludedProduct = {
  bbvProductId: string;
  productName: string;
  specifications: SpecItem[];
};

export type CourseDetailPageProps = {
  slug?: string;
  product?: ProductData;
  specifications?: {
    product?: SpecItem[];
    includedProducts?: IncludedProduct[];
  } | null;
  isEnrolled?: boolean;
  enrolledVariantIds?: string[];
};

// ─── Custom Dropdown Component ────────────────────────────────────────────────
export type CustomDropdownProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
};

// ─── Mock Product Data (for UI testing/development) ──────────────────────────
export const MOCK_PRODUCT: ProductData = {
  id: 'mock-course-2024',
  title: 'Advanced Web Development Masterclass',
  description:
    'Learn to build scalable web applications with React, TypeScript, and modern web technologies. Perfect for intermediate developers looking to master advanced concepts.',
  price: '₹4,999',
  priceWithTax: 5899,
  featuredAsset: {
    preview:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  },
  faculties: [
    {
      name: 'John Smith',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      description:
        'Full-stack developer with 10+ years of experience in React and Node.js. Former tech lead at Google.',
    },
    {
      name: 'Sarah Johnson',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      description:
        'Expert in TypeScript and frontend architecture. Created multiple open-source libraries.',
    },
    {
      name: 'Michael Chen',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      description:
        'DevOps specialist and cloud architect. Helps scale web applications to millions of users.',
    },
  ],
  customFields: {
    customData: JSON.stringify({
      courseDuration: '12 weeks',
      skillLevel: 'Intermediate to Advanced',
      certification: true,
      maxStudents: 50,
      rating: 4.8,
      reviews: 324,
    }),
  },
  variantId: 'variant-mock-2024-001',
};

// ─── Mock Specifications Data (for UI testing/development) ──────────────────
export const MOCK_SPECIFICATIONS = {
  product: [
    // Course Info Section (Table)
    {
      order: 1,
      identifier: 'course_info',
      name: 'Course Info',
      type: 'table',
      table: {
        Language: 'English',
        Mode: 'Live Classes',
        'Start Date': '15 April 2024',
        'End Date': '30 June 2024',
        Standard: 'Class 12',
        'Board Year': '2024-2025',
        Duration: '12 Weeks',
        'Batch Size': 'Max 50 Students',
      },
    },
    // Features Section (Composite with nested table and list)
    {
      order: 2,
      identifier: 'features',
      name: 'Features',
      type: 'composite',
      data: [
        {
          order: 1,
          identifier: 'features_table',
          name: "What's Included",
          type: 'table',
          table: {
            'Live Classes': '3 Classes Per Week',
            'Doubt Sessions': 'Daily Sessions',
            'Study Material': 'Complete PDF Notes',
            'Mock Tests': '10 Full Length Tests',
            Assignments: 'Weekly Assignments',
            Certification: 'Official Certificate',
          },
        },
        {
          order: 2,
          identifier: 'features_highlights',
          name: 'Course Highlights',
          type: 'list',
          list: [
            'Expert instructors with 10+ years experience',
            'Interactive live sessions with Q&A',
            'Structured curriculum aligned with latest syllabus',
            'Regular performance tracking and feedback',
            'Lifetime access to recorded classes',
            'Community support from peers and mentors',
            'Career guidance and college preparation',
            'Affordable pricing with flexible payment plans',
          ],
        },
      ],
    },
    // About Course Section (HTML)
    {
      order: 3,
      identifier: 'about_course',
      name: 'About Course',
      type: 'html',
      text: `<p>This comprehensive course is designed to help students master advanced web development concepts and build production-ready applications.</p>
        <p><strong>What You'll Learn:</strong></p>
        <ul>
          <li>Advanced React patterns and optimization techniques</li>
          <li>TypeScript for type-safe development</li>
          <li>State management with Redux and Context API</li>
          <li>Building scalable backend services with Node.js</li>
          <li>Database design and optimization</li>
          <li>Deployment and DevOps essentials</li>
        </ul>
        <p>By the end of this course, you'll have a portfolio of real-world projects and be ready for senior-level positions.</p>`,
    },
    // Demo Lectures (Video Carousel)
    {
      order: 4,
      identifier: 'demo_lectures',
      name: 'Demo Lectures',
      type: 'video_carousel',
      videoItems: [
        {
          url: 'https://www.youtube.com/watch?v=jH8DqS8Sxys',
          title: 'React Hooks Deep Dive',
          durationMinutes: 45,
        },
        {
          url: 'https://www.youtube.com/watch?v=xvFZjo5PgG0',
          title: 'TypeScript Advanced Types',
          durationMinutes: 38,
        },
        {
          url: 'https://www.youtube.com/watch?v=8NPfqSXqUSs',
          title: 'Building APIs with Node.js',
          durationMinutes: 52,
        },
        {
          url: 'https://www.youtube.com/watch?v=lkIFF4maKMU',
          title: 'Database Design Best Practices',
          durationMinutes: 41,
        },
      ],
    },
    // Curriculum/Syllabus Section (Composite with nested structure)
    {
      order: 5,
      identifier: 'syllabus',
      name: 'Curriculum',
      type: 'composite',
      data: [
        {
          order: 1,
          identifier: 'module_1',
          name: 'Module 1: React Fundamentals',
          type: 'composite',
          data: [
            {
              order: 1,
              identifier: 'week_1',
              name: 'Week 1: JSX & Components',
              type: 'list',
              list: [
                'Introduction to JSX',
                'Functional Components',
                'Props and PropTypes',
                'Component Composition',
                'Hands-on Project: Build a Component Library',
              ],
            },
            {
              order: 2,
              identifier: 'week_2',
              name: 'Week 2: State & Lifecycle',
              type: 'list',
              list: [
                'useState Hook',
                'useEffect Hook',
                'Custom Hooks',
                'Performance Optimization',
                'Mini Project: Todo Application',
              ],
            },
          ],
        },
        {
          order: 2,
          identifier: 'module_2',
          name: 'Module 2: Advanced React Patterns',
          type: 'composite',
          data: [
            {
              order: 1,
              identifier: 'week_3',
              name: 'Week 3: Context & State Management',
              type: 'list',
              list: [
                'Context API Mastery',
                'Redux Basics',
                'Redux Middleware',
                'State Normalization',
                'Project: E-commerce App',
              ],
            },
            {
              order: 2,
              identifier: 'week_4',
              name: 'Week 4: Advanced Patterns',
              type: 'list',
              list: [
                'Render Props',
                'Higher Order Components',
                'Compound Components',
                'Error Boundaries',
                'Capstone Project Setup',
              ],
            },
          ],
        },
      ],
    },
    // Faculties Section
    {
      order: 6,
      identifier: 'faculties',
      name: 'Faculties',
      type: 'html',
      text: '<p>Learn from industry experts with proven track records</p>',
    },
    // FAQs Section
    {
      order: 7,
      identifier: 'faqs',
      name: 'FAQs',
      type: 'faq',
      faqItems: [
        {
          question: 'Who should take this course?',
          answer:
            'This course is perfect for intermediate developers looking to master advanced concepts. You should have basic knowledge of React and JavaScript.',
        },
        {
          question: 'What is the course duration?',
          answer:
            'The course runs for 12 weeks with 3 live classes per week. Each class is approximately 1-1.5 hours long.',
        },
        {
          question: 'Do I get a certificate?',
          answer:
            "Yes, upon successful completion of all assignments and the final project, you'll receive an official course completion certificate.",
        },
        {
          question: 'Is there lifetime access to recordings?',
          answer:
            'Absolutely! All class recordings are saved and you get lifetime access to them. You can review concepts anytime.',
        },
        {
          question: 'What if I miss a live class?',
          answer:
            "Don't worry! All live sessions are recorded and made available within 24 hours. You can watch at your convenience.",
        },
        {
          question: 'Is there any refund policy?',
          answer:
            "We offer a 7-day money-back guarantee if you're not satisfied with the course content.",
        },
      ],
    },
    // Stats Section
    {
      order: 8,
      identifier: 'stats',
      name: 'Course Stats',
      type: 'stat_items',
      statItems: [
        { label: 'Students', value: '5,000+' },
        { label: 'Lessons', value: '48' },
        { label: 'Practice Projects', value: '12' },
        { label: 'Success Rate', value: '94%' },
      ],
    },
    // Contact Support Section
    {
      order: 9,
      identifier: 'contact_support',
      name: 'Contact Support',
      type: 'contact_support',
      contactSupportDetail: {
        title: 'Need Help? Get in Touch',
        description:
          'Our support team is available 24/7 to help you with any questions or concerns about the course.',
        buttonText: 'Contact Support',
        url: 'https://wa.me/919876543210',
      },
    },
  ],
};

// ─── Nav IDs derived from spec identifiers we want to show in subnav ─────────
export const NAV_MAP: Record<string, string> = {
  features: 'Features',
  about_course: 'About',
  demo_lectures: 'Demo Lectures',
  syllabus: 'Curriculum',
  faculties: 'Faculties',
  faqs: 'FAQs',
};

export const SUBNAV_SCROLL_SPY_OFFSET_PX = 128;

export default function CourseDetailPage({
  slug,
  product: propProduct,
  specifications: propSpecifications,
  isEnrolled,
  enrolledVariantIds = [],
}: CourseDetailPageProps) {
  return (
    <>
      <div className="hidden md:block">
        <DesktopCourseDetailPage
          slug={slug}
          product={propProduct}
          specifications={propSpecifications}
          isEnrolled={isEnrolled}
          enrolledVariantIds={enrolledVariantIds}
        />
      </div>
      <div className="md:hidden">
        <MobileCourseDetailPage
          slug={slug}
          product={propProduct}
          specifications={propSpecifications}
          isEnrolled={isEnrolled}
          enrolledVariantIds={enrolledVariantIds}
        />
      </div>
    </>
  );
}
