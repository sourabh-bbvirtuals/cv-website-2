import { sdk } from '~/graphqlWrapper';
import type { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';

export interface LayoutAnnouncement {
  tag: string;
  text: string;
  id?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Get top announcements from Vendure GraphQL collection for Layout component
 * @param options - Query options containing request
 * @returns Announcements array formatted for Layout component
 */
export async function getTopAnnouncementsForLayout(options: QueryOptions): Promise<LayoutAnnouncement[]> {
  try {
    const result = await getCollectionBySlug('top-announcements', options);
    if (!result.collection?.customFields?.customData) {
      // Return default announcement if no data found
      return [];
    }

    const announcementsData = JSON.parse(result.collection.customFields.customData);
    
    // Handle both array format and object with announcements array
    let announcements: any[] = [];
    if (Array.isArray(announcementsData)) {
      announcements = announcementsData;
    } else if (announcementsData.announcements && Array.isArray(announcementsData.announcements)) {
      announcements = announcementsData.announcements;
    } else if (announcementsData.data && Array.isArray(announcementsData.data)) {
      announcements = announcementsData.data;
    }

    // Filter active announcements and check date ranges
    const currentDate = new Date();
    
    const filteredAnnouncements = announcements
      .filter((announcement: any) => {
        // If isActive is not defined, assume it's active
        if (announcement.isActive !== undefined && !announcement.isActive) {
          return false;
        }
        
        // Check date ranges if provided
        if (announcement.startDate) {
          const startDate = new Date(announcement.startDate);
          if (currentDate < startDate) return false;
        }
        
        if (announcement.endDate) {
          const endDate = new Date(announcement.endDate);
          if (currentDate > endDate) return false;
        }
        
        return true;
      })
      .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0)) // Sort by priority desc
      .map((announcement: any) => ({
        id: announcement.id || Math.random().toString(36),
        tag: announcement.tag || 'Info',
        text: announcement.text || announcement.message || '',
        isActive: announcement.isActive !== false,
        priority: announcement.priority || 0,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
      }))
      .filter((announcement: LayoutAnnouncement) => announcement.text.trim() !== ''); // Remove empty messages

    // If no valid announcements found, return default
    if (filteredAnnouncements.length === 0) {
      return [];
    }

    return filteredAnnouncements;
  } catch (error) {
    console.error('Error fetching top announcements from Vendure:', error);
    // Return default announcement on error
    return [];
  }
}
