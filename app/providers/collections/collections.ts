import gql from 'graphql-tag';
import { sdk, QueryOptions } from '../../graphqlWrapper';
import { CollectionListOptions } from '~/generated/graphql';

export function getCollections(
  request: Request,
  options?: CollectionListOptions,
) {
  return sdk
    .collections({ options }, { request })
    .then((result) => result.collections?.items);
}

export function getCollectionBySlug(slug: string, options: QueryOptions) {
  return sdk.getCollectionBySlug({ slug }, options);
}

// Custom function that ensures children customFields are included
export async function getCollectionWithChildren(
  slug: string,
  options: QueryOptions,
) {
  const API_URL =
    process.env.VENDURE_API_URL || 'http://localhost:3000/shop-api';

  const { getSessionStorage } = await import('../../sessions');
  const query = `
    query($slug: String!) {
      collection(slug: $slug) {
        id
        name
        slug
        description
        customFields {
          videoUrl
          videoDuration
        }
        featuredAsset {
          id
          preview
        }
        assets {
          id
          preview
        }
        breadcrumbs {
          id
          name
          slug
        }
        children {
          id
          name
          slug
          description
        }
        parent {
          id
          name
          slug
          children {
            id
            name
            slug
            description
          }
        }
        createdAt
        updatedAt
        position
        languageCode
        translations {
          id
          languageCode
          name
          description
          slug
        }
      }
    }
  `;

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const session = await getSessionStorage().then((sessionStorage) =>
    sessionStorage.getSession(options.request?.headers.get('Cookie')),
  );

  if (session) {
    const token = session.get('authToken');
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: { slug },
    }),
  });

  const result: any = await response.json();

  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(JSON.stringify(result.errors[0]));
  }
  console.log('result.data.collection', result.data.collection);
  return { collection: result.data.collection };
}

gql`
  query collections($options: CollectionListOptions) {
    collections(options: $options) {
      items {
        id
        name
        slug
        parent {
          name
        }
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;

gql`
  query getCollectionBySlug($slug: String!) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      customFields {
        videoUrl
        videoDuration
      }
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      breadcrumbs {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        description
      }
      parent {
        id
        name
        slug
      }
      createdAt
      updatedAt
      position
      languageCode
      translations {
        id
        languageCode
        name
        description
        slug
      }
    }
  }
`;

gql`
  query getCollectionWithChildren($slug: String!) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      customFields {
        videoUrl
        videoDuration
      }
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      breadcrumbs {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        description
      }
      parent {
        id
        name
        slug
        children {
          id
          name
          slug
          description
        }
      }
      createdAt
      updatedAt
      position
      languageCode
      translations {
        id
        languageCode
        name
        description
        slug
      }
    }
  }
`;
