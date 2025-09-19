import API_URL from '../config';

export interface ApiError extends Error {
  status: number;
  data?: unknown;
}

export type ApiClient = <T = unknown>(path: string, options?: RequestInit) => Promise<T>;

const resolveUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (!path.startsWith('/')) {
    return API_URL + '/' + path;
  }

  return API_URL + path;
};

export const createApiClient = (getToken: () => string | null): ApiClient => {
  return async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const url = resolveUrl(path);
    const headers = new Headers(options.headers ?? {});

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const token = getToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', 'Bearer ' + token);
    }

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const error = new Error(
        (data as any)?.error ?? (data as any)?.message ?? 'Request failed',
      ) as ApiError;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  };
};
