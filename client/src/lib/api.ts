/**
 * API client helper for communication with the FastAPI backend.
 * Automatically attaches Authorization header when token is present in localStorage.
 */

const API_BASE = "/api";

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("summa_access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("/") ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.message || `API error (${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}
