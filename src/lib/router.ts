import { useEffect, useState } from 'react';

export interface Route {
  path: string;
  segments: string[];
  params: URLSearchParams;
}

function parse(hash: string): Route {
  const clean = hash.replace(/^#/, '') || '/dashboard';
  const [path, query = ''] = clean.split('?');
  const segments = path.split('/').filter(Boolean);
  return { path: '/' + segments.join('/'), segments, params: new URLSearchParams(query) };
}

export function useRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return parse(hash);
}

export function navigate(to: string) {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = target;
  }
}

export function setParam(route: Route, key: string, value: string | null) {
  setParams(route, { [key]: value });
}

export function setParams(route: Route, updates: Record<string, string | null>) {
  const params = new URLSearchParams(route.params);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  const q = params.toString();
  const target = `#${route.path}${q ? `?${q}` : ''}`;
  window.history.replaceState(null, '', target);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
