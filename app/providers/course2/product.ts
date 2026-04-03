export interface Course2Product {
  id: string;
  title: string;
  batchType: string;
  instructor: string;
  profileImages: string[];
  language: string;
  duration: string;
  lectures: string;
  studyMaterial: string;
  features: string[];
  basePrices: {
    OD: number;
    PD: number;
    LS: number;
  };
  modeOptions: {
    OD: { name: string; description: string };
    PD: { name: string; description: string };
    LS: { name: string; description: string };
  };
  subjects: Array<{ name: string; value: string }>;
  examAttempts: string[];
  bookOptions: Array<{ value: string; label: string; price?: number }>;
  offerOptions: Array<{ value: string; label: string; price?: number }>;
  facultyOptions: Array<{ value: string; label: string }>;
  batchOptions: string[];
  shippingOptions: Array<{ value: string; label: string; price?: number }>;
  states: string[];
  testSeriesOptions: Array<{ value: string; label: string; price?: number }>;
  description: string;
  courseHighlights: string[];
  productDetails: Array<{ label: string; value: string }>;
  faculty: Array<{
    name: string;
    image: string;
    description: string;
  }>;
  studyMaterials: Array<{
    name: string;
    type: string;
    link?: string;
  }>;
}

// Helper function to convert course data to product format
function convertCourseToProduct(course: any, courseSlug: string): Course2Product {
  const basePrice = parseInt(course.pricing?.current?.replace(/[₹,]/g, '') || '10000', 10);
  
  return {
    id: course.slug || course.id,
    title: course.title,
    batchType: course.batchType || course.courseType,
    instructor: course.faculties?.[0]?.name || 'Expert Faculty',
    profileImages: course.faculties?.map((f: any) => f.image) || [
      'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=240&auto=format&fit=crop'
    ],
    language: course.language || 'Hindi + English',
    duration: course.duration || '120 hrs',
    lectures: course.lectures || 'Approx. 120 hrs',
    studyMaterial: 'ICAI Study Material',
    features: [
      course.batchType || 'Regular In-Depth Batch',
      '100% syllabus coverage as per the institute module',
      'Unlimited Course Validity & 1.5 views',
      course.duration || 'Approx. 120 hrs',
      'ICAI Study Material would be used in this batch',
      'Daily Audio Revision of Lectures',
      'Daily Practice Question checked for each student',
      'Video Database 400+ questions',
      'Two portion-wise tests: Each of 50 marks',
      'Two Full Course tests: Each of 100 marks',
    ],
    basePrices: {
      OD: basePrice,
      PD: Math.round(basePrice * 1.2),
      LS: Math.round(basePrice * 1.5),
    },
    modeOptions: {
      OD: { name: 'Online Delivery', description: 'Access course content online' },
      PD: { name: 'Pen Drive', description: 'Course content on pen drive' },
      LS: { name: 'Live Sessions', description: 'Live interactive sessions' },
    },
    subjects: [
      { name: course.specialization || 'All Subjects', value: course.specialization || 'all' },
    ],
    examAttempts: ['May 2026', 'Nov 2026', 'May 2027'],
    bookOptions: [
      { value: '0', label: 'No Books', price: 0 },
      { value: '1', label: 'Basic Books', price: 2000 },
      { value: '2', label: 'Complete Books', price: 5000 },
    ],
    offerOptions: [
      { value: '0', label: 'No Offer', price: 0 },
      { value: '1', label: 'Early Bird (10%)', price: -Math.round(basePrice * 0.1) },
      { value: '2', label: 'Group Discount (15%)', price: -Math.round(basePrice * 0.15) },
    ],
    facultyOptions: [
      { value: 'single', label: 'Single Faculty' },
      { value: 'multiple', label: 'Multiple Faculty' },
    ],
    batchOptions: ['Regular In-Depth', 'FastTrack', 'Exam-Oriented', 'Combo'],
    shippingOptions: [
      { value: '0', label: 'Digital Delivery', price: 0 },
      { value: '1', label: 'Standard Shipping', price: 200 },
      { value: '2', label: 'Express Shipping', price: 500 },
    ],
    states: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat'],
    testSeriesOptions: [
      { value: '0', label: 'No Test Series', price: 0 },
      { value: '1', label: 'Basic Test Series', price: 1000 },
      { value: '2', label: 'Complete Test Series', price: 3000 },
    ],
    description: course.description || 'Comprehensive course covering all aspects of the subject with expert faculty guidance.',
    courseHighlights: [
      'Expert Faculty Guidance',
      'Comprehensive Study Material',
      'Regular Doubt Clearing Sessions',
      'Mock Tests and Practice Papers',
      'Lifetime Access to Recordings',
    ],
    productDetails: [
      { label: 'Course Type', value: course.courseType || 'Regular In-Depth' },
      { label: 'Duration', value: course.duration || '120 hrs' },
      { label: 'Language', value: course.language || 'Hindi + English' },
      { label: 'Start Date', value: course.startDate || 'Jan 2026' },
    ],
    faculty: course.faculties?.map((f: any) => ({
      name: f.name,
      image: f.image,
      description: 'Expert faculty with years of experience',
    })) || [{
      name: 'Expert Faculty',
      image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=240&auto=format&fit=crop',
      description: 'Expert faculty with years of experience',
    }],
    studyMaterials: [
      { name: 'ICAI Study Material', type: 'download', link: '#' },
      { name: 'Practice Questions', type: 'download', link: '#' },
      { name: 'Mock Tests with Solutions', type: 'download', link: '#' },
    ],
  };
}

export function getCourse2ProductBySlug(courseSlug: string, productSlug: string): Course2Product | null {
  // If not found in sample products, try to create from course data
  try {
    // Import course data dynamically
    const facultyData = require('~/data/faculty2.json');
    const courseData = require('~/data/courses2.json');
    
    // Look for the course in faculty2.json
    let course = null;
    for (const faculty of Object.values(facultyData.faculties) as any[]) {
      if (faculty.courses) {
        course = faculty.courses.find((c: any) => c.slug === productSlug);
        if (course) break;
      }
    }
    
    // If not found in faculty2, look in courses2.json
    if (!course && courseData.courses) {
      course = courseData.courses.find((c: any) => c.slug === productSlug);
    }
    
    if (course) {
      // Convert course data to product format
      return convertCourseToProduct(course, courseSlug);
    }
    
    return null;
  } catch (error) {
    console.error('Error loading course data:', error);
    return null;
  }
}

export function getAllCourse2ProductSlugs(): Array<{ courseSlug: string; productSlug: string }> {
  // In a real implementation, this would fetch all product slugs from your API
  // For now, we'll return the sample product slugs
  return [
    { courseSlug: 'ca-final', productSlug: 'ca-final-audit-regular' },
    { courseSlug: 'ca-final', productSlug: 'ca-final-costing-fasttrack' },
  ];
}
