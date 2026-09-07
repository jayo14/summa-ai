import { createClient } from "@/lib/supabaseClient";

/**
 * API client helper for communication with the FastAPI backend.
 * Automatically attaches Authorization header when token is present in localStorage.
 */

export function getApiBaseUrl(): string {
  const envUrl =
    (typeof process !== "undefined" &&
      (process.env.FASTAPI_BASE_URL || process.env.NEXT_PUBLIC_FASTAPI_BASE_URL)) ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      (import.meta.env.FASTAPI_BASE_URL ||
        import.meta.env.NEXT_PUBLIC_FASTAPI_BASE_URL ||
        import.meta.env.VITE_FASTAPI_BASE_URL)) ||
    "";

  const trimmed = envUrl.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

/**
 * Ensures access token is automatically refreshed via Supabase client if expired or nearing expiry.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const currentToken = localStorage.getItem("summa_access_token");
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      if (session.access_token !== currentToken) {
        localStorage.setItem("summa_access_token", session.access_token);
      }
      return session.access_token;
    }
  } catch (err) {
    console.warn("Automatic token refresh failed:", err);
  }
  return currentToken;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const base = getApiBaseUrl();
  let url: string;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    url = endpoint;
  } else {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    if (base) {
      const route = cleanEndpoint.startsWith("/api/v1/")
        ? cleanEndpoint.replace(/^\/api\/v1/, "")
        : cleanEndpoint;
      url = `${base}${route}`;
    } else {
      url = cleanEndpoint.startsWith("/api/v1/") ? cleanEndpoint : `/api/v1${cleanEndpoint}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Only auto-logout for authenticated app requests — never for auth
      // handshake endpoints, the initial session-restore GET /user call,
      // or chat/stream (a transient 401 from JWKS warmup must not destroy
      // the session; the chat error state handles it inline).
      const noAutoLogout =
        endpoint.includes("/auth/") ||
        endpoint === "/user" ||
        endpoint.includes("/chat/stream") ||
        endpoint.includes("/conversations");
      if (!noAutoLogout) {
        localStorage.removeItem("summa_access_token");
        window.dispatchEvent(new CustomEvent("summa:unauthorized"));
      }
    }

    let errorMsg = "API request failed";
    if (typeof data.detail === "string") {
      errorMsg = data.detail;
    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
      errorMsg = data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
    } else if (data.message) {
      errorMsg = data.message;
    } else {
      errorMsg = `API error (${response.status})`;
    }
    throw new Error(errorMsg);
  }

  return data as T;
}
