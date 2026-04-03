// Removed static course data import - using Vendure API only
import type { Course2Data } from './types';
import { sdk } from '~/graphqlWrapper';
import type { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';

/**
 * Get course data from Vendure GraphQL collection by slug
 * @param slug - Course slug to fetch
 * @param options - Query options containing request
 * @returns Course data from GraphQL or null if not found
 */
export async function getCourseFromVendure(slug: string, options: QueryOptions): Promise<Course2Data | null> {
  try {
    const result = await getCollectionBySlug(slug, options);
    if (!result.collection?.customFields?.customData) {
      return null;
    }

    const courseData = JSON.parse(result.collection.customFields.customData);
    
    // Transform the data to match Course2Data interface
    const transformedData: Course2Data = {
      id: courseData.id || slug,
      name: courseData.name || courseData.title || '',
      slug: slug,
      hero: courseData.hero,
      academyName: courseData.academyName || '',
      description: courseData.description || '',
      heroSlides: courseData.banners || [],
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching course from Vendure:', error);
    return null;
  }
}

/**
 * Get course data with Vendure-first approach and fallback to static data
 * @param slug - Course slug to fetch
 * @param options - Optional query options for Vendure
 * @returns Course data from Vendure or static fallback
 */
export async function getCourse2BySlugWithVendure(slug: string, options?: QueryOptions): Promise<Course2Data | null> {
  // Try to fetch from Vendure first if options are provided
  if (options) {
    const vendureCourse = await getCourseFromVendure(slug, options);
    if (vendureCourse) {
      return vendureCourse;
    }
  }
  
  // Fallback to static data
  return null;
}

export function filterCourses(courses: any[], activeFilters: Record<string, string[]>): any[] {
  if (Object.keys(activeFilters).length === 0) {
    return courses;
  }

  return courses.filter((course) => {
    return Object.entries(activeFilters).every(([groupId, selectedOptions]) => {
      if (selectedOptions.length === 0) return true;

      // Map filter groups to course properties
      switch (groupId) {
        case 'attempt':
          // Check if course matches any selected attempt
          return selectedOptions.some(option => 
            course.startDate?.toLowerCase().includes(option.replace('-', ' '))
          );
        case 'batch-type':
          // Check if course matches any selected batch type
          return selectedOptions.some(option => 
            course.batchType?.toLowerCase().includes(option.replace('-', ' '))
          );
        case 'faculty-type':
          // Check if course has any of the selected faculties
          return selectedOptions.some(option => 
            course.faculties?.some((faculty: any) => 
              faculty.name.toLowerCase().includes(option.replace('-', ' '))
            )
          );
        default:
          return true;
      }
    });
  });
}
