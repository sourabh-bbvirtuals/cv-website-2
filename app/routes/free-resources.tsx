import { Outlet } from '@remix-run/react';

/**
 * Layout for `/free-resources/*` so nested quiz routes (`quizzes/:slug/start`, etc.)
 * render via `<Outlet />`. Index listing lives in `free-resources._index.tsx`.
 */
export default function FreeResourcesLayoutRoute() {
  return <Outlet />;
}
