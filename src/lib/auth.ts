// src/lib/auth.ts — Frontend authentication service

import { api, checkApiStatus } from "./api";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  mode: "database" | "localStorage";
}

// ── Storage keys ──────────────────────────────────────────────────────────────
const TOKEN_KEY = "first_step_session_token";
const USER_KEY  = "first_step_active_user";

// ── Helpers ───────────────────────────────────────────────────────────────────
function saveSession(user: AuthUser, token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── API Calls ─────────────────────────────────────────────────────────────────
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const result = await api.post<AuthResult>("/auth/signup", { name, email, password });
  saveSession(result.user, result.token);
  return result.user;
}

export async function login(
  email: string,
  password: string
): Promise<AuthUser> {
  const result = await api.post<AuthResult>("/auth/login", { email, password });
  saveSession(result.user, result.token);
  return result.user;
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    try { await api.post("/auth/logout", {}); } catch { /* ignore */ }
  }
  clearSession();
}

// Verifies the stored token against the server; clears it if invalid
export async function verifySession(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const result = await api.get<{ user: AuthUser }>("/auth/me");
    // Refresh stored user in case name changed
    saveSession(result.user, token);
    return result.user;
  } catch {
    // Token invalid or expired — clear it
    clearSession();
    return null;
  }
}

// Quick check: is the API server reachable?
export { checkApiStatus };

// ── Guest mode (localStorage-only, no password) ───────────────────────────────
// Used when the API server is not running or DB is not configured
export function loginAsGuest(name: string, email: string): AuthUser {
  const user: AuthUser = {
    id: `guest-${email}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
  };
  // Sign a fake JWT-like string for guest mode (just base64 encoded payload)
  const fakeToken = `guest.${btoa(JSON.stringify(user))}`;
  saveSession(user, fakeToken);
  return user;
}

export function isGuestToken(token: string | null): boolean {
  return token?.startsWith("guest.") ?? false;
}
