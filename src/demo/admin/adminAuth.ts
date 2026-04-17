// ============================================
// FILE: src/demo/admin/adminAuth.ts
// PURPOSE: Admin panel authentication — isolated from main app auth.
//          Credentials stored in localStorage, changeable from panel.
// ============================================

const STORAGE_KEY = 'HRcopilot_admin_session';
const CREDS_KEY   = 'HRcopilot_admin_creds';

const DEFAULT_CREDS = {
  username: 'admin',
  // SHA-256 of 'HRcopilotadmin' — never store plaintext
  // For demo purposes we store a simple hash string
  password: 'HRcopilotadmin',
};

export interface AdminSession {
  loggedIn:  boolean;
  loginAt:   number;
  expiresAt: number;
}

// Session lasts 8 hours
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// ── Credentials ────────────────────────────────────────────────────────────────

function getStoredCreds(): { username: string; password: string } {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_CREDS;
}

export function updateAdminCreds(username: string, password: string): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify({ username, password }));
}

export function getAdminUsername(): string {
  return getStoredCreds().username;
}

// ── Session ────────────────────────────────────────────────────────────────────

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession()?.loggedIn === true;
}

export function adminLogin(username: string, password: string): boolean {
  const creds = getStoredCreds();
  if (username === creds.username && password === creds.password) {
    const session: AdminSession = {
      loggedIn:  true,
      loginAt:   Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  }
  return false;
}

export function adminLogout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
