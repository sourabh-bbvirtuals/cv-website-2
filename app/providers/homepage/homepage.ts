import gql from 'graphql-tag';
import { QueryOptions, sdk } from '~/graphqlWrapper';

export function getHomePageData(options: QueryOptions) {
  if (typeof (sdk as any).homePageData !== 'function') {
    return Promise.resolve(null);
  }
  return (sdk as any).homePageData(undefined, options);
}

gql`
  query homePageData {
    collection(slug: "home-page") {
      id
      name
      customFields {
        homePageData
      }
      productVariants {
        items {
          id
          name
          featuredAsset {
            id
            preview
          }
          facetValues {
            id
            name
          }
          priceWithTax
          customFields {
            bbvListingId
          }
          product {
            id
            name
            featuredAsset {
              id
              preview
            }
          }
        }
      }
    }
  }
`;
