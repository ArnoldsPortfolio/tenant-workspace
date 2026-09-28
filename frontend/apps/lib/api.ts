import type { TokenPair } from "./types";
export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
export function saveSession(tokens: TokenPair, email: string): void {
  localStorage.setItem("access", tokens.access_token);
  localStorage.setItem("refresh", tokens.refresh_token);
  localStorage.setItem("email", email);
}
export function clearSession(): void {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("email");
  localStorage.removeItem("workspaceId");
  localStorage.removeItem("workspaceName");
}
export function accessToken(): string | null { return localStorage.getItem("access"); }
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = accessToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(data.message ?? data.code ?? text);
  return data as T;
}
