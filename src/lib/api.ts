export function getApiUrl(path: string): string {
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (baseUrl) {
    return `${baseUrl}${cleanPath}`;
  }
  return cleanPath;
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = getApiUrl(input);
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  
  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...init,
    headers,
    credentials: init?.credentials || 'include'
  });
}
