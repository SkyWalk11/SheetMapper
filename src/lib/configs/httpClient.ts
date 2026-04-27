import { API_BASE_URL } from '@/lib/constants/config';
import type { HttpResponse, IHttpClient } from './httpClient.interface';

class HttpClient implements IHttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(url: string, config: RequestInit = {}): Promise<HttpResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: { 'Content-Type': 'application/json', ...config.headers },
      ...config,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data, status: response.status, statusText: response.statusText };
  }

  get<T>(url: string, config?: RequestInit) {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  post<T>(url: string, data?: unknown, config?: RequestInit) {
    return this.request<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) });
  }

  put<T>(url: string, data?: unknown, config?: RequestInit) {
    return this.request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) });
  }

  patch<T>(url: string, data?: unknown, config?: RequestInit) {
    return this.request<T>(url, { ...config, method: 'PATCH', body: JSON.stringify(data) });
  }

  delete<T>(url: string, config?: RequestInit) {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
