import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export interface QueryOptions {
  client: ApolloClient<NormalizedCacheObject>;
} 