import { useCallback, useEffect, useMemo, useState } from 'react';

export type RouteName = 'today' | 'ai' | 'github' | 'skills' | 'papers' | 'watchlist' | 'operations' | 'ai-lab';

const publicRoutes: RouteName[] = ['today', 'ai', 'github', 'skills', 'papers'];
const adminRoutes: RouteName[] = [...publicRoutes, 'watchlist', 'operations'];
const labRoutes: RouteName[] = [...publicRoutes, 'ai-lab'];

function readLocation(isAdmin: boolean, isLab: boolean) {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path = 'today', query = ''] = raw.split('?');
  const allowed = isAdmin ? adminRoutes : labRoutes;
  const route = allowed.includes(path as RouteName) ? (path as RouteName) : 'today';
  return { route, params: new URLSearchParams(query) };
}

export function routeHref(route: RouteName, params?: URLSearchParams): string {
  if (route === 'ai-lab' && !params) return '#/ai-lab';
  const query = params?.toString();
  return `#/${route}${query ? `?${query}` : ''}`;
}

export function useHashRoute(isAdmin: boolean, isLab = false) {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const rawPath = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    const allowed = isAdmin ? adminRoutes : labRoutes;
    if (!window.location.hash || !allowed.includes(rawPath as RouteName)) {
      window.history.replaceState(null, '', routeHref(isLab ? 'ai-lab' : 'today'));
      setHash(window.location.hash);
    }
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [isAdmin, isLab]);

  const location = useMemo(() => readLocation(isAdmin, isLab), [hash, isAdmin, isLab]);
  const navigate = useCallback((route: RouteName, params?: URLSearchParams) => {
    window.location.hash = routeHref(route, params);
  }, []);
  const updateParams = useCallback((patch: Record<string, string | undefined | null>) => {
    const next = new URLSearchParams(location.params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    navigate(location.route, next);
  }, [location.params, location.route, navigate]);

  return { ...location, navigate, updateParams };
}
