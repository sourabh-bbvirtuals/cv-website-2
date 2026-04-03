/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const commonConfig = {
  appDirectory: 'app',
  serverModuleFormat: 'esm',
  serverDependenciesToBundle: [
    'remix-i18next',
    '@remix-validated-form/with-zod',
    'swiper',
    'swiper/react',
    'swiper/modules',
    'ssr-window',
    'dom7',
  ],
  tailwind: true,
  browserNodeBuiltinsPolyfill: {
    modules: {
      crypto: true,
    },
  },
};

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const devConfig = {
  appDirectory: 'app',
  serverModuleFormat: 'cjs',
  devServerPort: 8002,
  ignoredRouteFiles: ['.*'],
  ...commonConfig,
};

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const buildConfig = {
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildDirectory: 'build',
  ignoredRouteFiles: ['.*'],
  ...commonConfig,
};

function selectConfig() {
  // Vercel and some tools can load this file with NODE_ENV unset.
  // Default to production build config in that case.
  const env = process.env.NODE_ENV || 'production';

  if (env === 'development') {
    return devConfig;
  }

  return buildConfig;
}

export default selectConfig();
