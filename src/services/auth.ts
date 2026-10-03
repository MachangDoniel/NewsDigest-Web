export interface AdminUser {
  email: string;
  name?: string;
  picture?: string;
}

const TOKEN_KEY = 'newsdigest_admin_token';
const USER_KEY = 'newsdigest_admin_user';

export const getStoredAdminToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredAdminUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAdminSession = (token: string, user: AdminUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const loginWithGoogleToken = async (credential: string): Promise<{
  ok: boolean;
  isAdmin: boolean;
  user?: AdminUser;
  message?: string;
}> => {
  try {
    const res = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (data.ok && data.isAdmin && data.token) {
      setAdminSession(data.token, data.user);
    }
    return data;
  } catch (err: any) {
    return { ok: false, isAdmin: false, message: err.message };
  }
};

export const loginWithPasscode = async (passcode: string): Promise<{
  ok: boolean;
  isAdmin: boolean;
  user?: AdminUser;
  message?: string;
}> => {
  try {
    const res = await fetch('/api/auth/passcode-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    const data = await res.json();
    if (data.ok && data.isAdmin && data.token) {
      setAdminSession(data.token, data.user);
    }
    return data;
  } catch (err: any) {
    return { ok: false, isAdmin: false, message: err.message };
  }
};

export const checkAdminSession = async (): Promise<boolean> => {
  const token = getStoredAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/session', {
      headers: { 'x-admin-token': token },
    });
    const data = await res.json();
    if (!data.isAdmin) {
      clearAdminSession();
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
