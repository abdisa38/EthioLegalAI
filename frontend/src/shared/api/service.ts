import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { http } from './http';

/**
 * Base API service class for typed API operations
 */
export class ApiService {
  protected http: AxiosInstance;

  constructor(httpClient: AxiosInstance = http) {
    this.http = httpClient;
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.http.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.http.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.http.put<T>(url, data, config);
    return response.data;
  }

  protected async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.http.patch<T>(url, data, config);
    return response.data;
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.http.delete<T>(url, config);
    return response.data;
  }
}

/**
 * Type-safe API request builder
 */
export class ApiRequest<T = any> {
  private url: string;
  private method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET';
  private data?: unknown;
  private config: AxiosRequestConfig = {};

  constructor(url: string) {
    this.url = url;
  }

  setMethod(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'): this {
    this.method = method;
    return this;
  }

  setData(data: unknown): this {
    this.data = data;
    return this;
  }

  setConfig(config: AxiosRequestConfig): this {
    this.config = { ...this.config, ...config };
    return this;
  }

  async execute(): Promise<T> {
    const response = await http({
      url: this.url,
      method: this.method,
      data: this.data,
      ...this.config,
    });
    return response.data;
  }
}

/**
 * Request cache manager
 */
export class RequestCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private ttl: number; // in milliseconds

  constructor(ttl = 5 * 60 * 1000) {
    // 5 minutes default
    this.ttl = ttl;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const requestCache = new RequestCache();
