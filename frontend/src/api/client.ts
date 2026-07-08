import { API_BASE_URL } from "../config/env";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

let _tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _tokenGetter = fn;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!_tokenGetter) return {};
  const token = await _tokenGetter();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  path: string,
  options: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const hasBody = options.body !== undefined && options.method !== "GET";
  const headers: Record<string, string> = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...authHeaders,
    ...options.headers,
  };

  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 429) {
    throw new ApiError(429, "Too many requests, try again shortly");
  }

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || body.message || detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
