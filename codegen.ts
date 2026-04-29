import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';
import { API_URL } from '~/constants';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    API_URL,
    // Schema extension for SearchResult.offers field from SearchResultExtensionPlugin
    `
      extend type SearchResult {
        offers: String
      }
    `,
  ],
  // schema: process.env.VENDURE_API_URL || 'http://c3-prod.grepvideos.com:5000/shop-api',
  // schema: process.env.VENDURE_API_URL || 'http://localhost:5000/shop-api',
  documents: [
    'app/**/*.{ts,tsx,graphql}',
    '!app/generated/**/*', // Exclude generated files
  ],
  generates: {
    'app/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-generic-sdk',
      ],
      config: {
        scalars: {
          // This tells codegen that the `Money` scalar is a number
          Money: 'number',
        },
        namingConvention: {
          // This ensures generated enums do not conflict with the built-in types.
          enumValues: 'keep',
        },
      },
    },
    'app/generated/schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

export default config;
