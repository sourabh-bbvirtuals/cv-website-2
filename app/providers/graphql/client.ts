import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export function getClient(request: Request) {
  const httpLink = createHttpLink({
    uri: process.env.GRAPHQL_API_URL || 'http://localhost:3000/shop-api',
    credentials: 'include',
  });

  const authLink = setContext((_, { headers }) => {
    // Get the cookie from the request
    const cookie = request.headers.get('cookie');
    
    return {
      headers: {
        ...headers,
        cookie,
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
} 