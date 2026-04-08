import { gql } from 'graphql-tag';

export const GET_BLOG_COLLECTIONS = gql`
  query getBlogCollections($options: CollectionListOptions) {
    collections(options: $options) {
      items {
        id
        name
        slug
        description
        featuredAsset {
          id
          preview
        }
        assets {
          id
          preview
        }
        children {
          id
          name
          slug
          description
          featuredAsset {
            id
            preview
          }
          assets {
            id
            preview
          }
        }
        parent {
          id
          name
          slug
        }
        createdAt
        updatedAt
        position
      }
      totalItems
    }
  }
`;
