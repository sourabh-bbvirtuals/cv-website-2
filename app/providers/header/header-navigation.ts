import type { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';

export interface NavigationItem {
  id: string;
  label: string;
  url?: string;
  subMenu?: NavigationItem[];
}

export interface HeaderNavigationData {
  navigation: NavigationItem[];
}

const DEFAULT_NAVIGATION: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    url: '/',
  },
  {
    id: 'about',
    label: 'About',
    url: '/about-us',
  },
  {
    id: 'courses',
    label: 'Courses',
    url: '/courses',
  },
];

export async function getHeaderNavigationData(
  options: QueryOptions,
): Promise<HeaderNavigationData | null> {
  try {
    const result = await getCollectionBySlug('header', options);

    if (!result.collection?.customFields?.customData) {
      console.log('⚠️ header collection not found, using default navigation');
      return { navigation: DEFAULT_NAVIGATION };
    }

    const navigationData = JSON.parse(
      result.collection.customFields.customData,
    );
    // Post-process to inject "Costing" under "Books > CA Inter"
    const processItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.map((item) => {
        const label = (item.label || '').toLowerCase().trim();
        let newItem = { ...item };

        // Match "Books" area
        const isBooks = label.includes('books');

        if (newItem.subMenu) {
          newItem.subMenu = newItem.subMenu.map((sub) => {
            const subLabel = (sub.label || '').toLowerCase().trim();

            // Match "CA Inter"
            if (
              subLabel.includes('ca inter') ||
              subLabel.includes('ca-inter') ||
              subLabel.includes('ca intermediate')
            ) {
              const existingSubMenu = sub.subMenu || [];
              const hasCosting = existingSubMenu.some((m) =>
                (m.label || '').toLowerCase().includes('costing'),
              );

              if (!hasCosting) {
                return {
                  ...sub,
                  subMenu: [
                    ...existingSubMenu,
                    {
                      id: 'costing',
                      label: 'Costing',
                      subMenu: [
                        {
                          id: 'costing-regular',
                          label: 'Regular In-Depth',
                          url: '/lectures/ca inter/cost-and-management-accounting?batch-type=regular-in-depth',
                        },
                        {
                          id: 'costing-fast-track',
                          label: 'Fast Track',
                          url: '/lectures/ca inter/cost-and-management-accounting?batch-type=fast-track',
                        },
                        {
                          id: 'costing-ultimate',
                          label: 'Ultimate Solution (Books)',
                          url: '/lectures/ca inter/cost-and-management-accounting?product-type=book',
                        },
                      ],
                    },
                  ],
                };
              }
            }
            return sub;
          });

          // Recurse into sub-menus to find "Books" or "CA Inter" deeper
          newItem.subMenu = processItems(newItem.subMenu);
        }

        return newItem;
      });
    };

    const finalNavigation = processItems(
      navigationData.navigation || DEFAULT_NAVIGATION,
    );

    return {
      navigation: finalNavigation,
    };
  } catch (error) {
    console.log('❌ Error fetching header collection:', error);
    return { navigation: DEFAULT_NAVIGATION };
  }
}
