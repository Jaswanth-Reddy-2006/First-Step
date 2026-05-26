// src/lib/api.ts — Frontend HTTP client for the Express API

const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("first_step_session_token");
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = { message: "Invalid server response" };
  }

  if (!res.ok) {
    throw new Error(data?.message || `API error ${res.status}`);
  }

  return data as T;
}

export const api = {
  get:    <T = unknown>(path: string) => request<T>("GET", path),
  post:   <T = unknown>(path: string, body: unknown) => request<T>("POST", path, body),
  put:    <T = unknown>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: <T = unknown>(path: string) => request<T>("DELETE", path),
};

// Check if the API server is running
export async function checkApiStatus(): Promise<{ available: boolean; dbConnected: boolean }> {
  try {
    const data = await fetch("/api/auth/status", { signal: AbortSignal.timeout(2000) });
    if (!data.ok) return { available: false, dbConnected: false };
    const json = await data.json();
    return { available: true, dbConnected: json.dbConnected ?? false };
  } catch {
    return { available: false, dbConnected: false };
  }
}
