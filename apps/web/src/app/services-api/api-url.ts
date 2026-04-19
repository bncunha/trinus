const DEFAULT_API_BASE_URL = 'http://localhost:3000';

declare global {
  interface Window {
    __TRINUS_API_URL__?: string;
  }
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && typeof window.__TRINUS_API_URL__ === 'string') {
    return window.__TRINUS_API_URL__.replace(/\/$/, '');
  }

  return DEFAULT_API_BASE_URL;
}
