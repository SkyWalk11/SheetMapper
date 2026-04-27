export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface IHttpClient {
  get<T>(url: string, config?: RequestInit): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: unknown, config?: RequestInit): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: unknown, config?: RequestInit): Promise<HttpResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: RequestInit): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: RequestInit): Promise<HttpResponse<T>>;
}
