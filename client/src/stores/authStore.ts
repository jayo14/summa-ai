import { create } from "zustand";
import { fetchApi } from "@/lib/api";
import { UserRole, UserStatus } from "@/types/roles";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  provider?: string;
  email_verified?: boolean;
  onboarded?: boolean;
}

function normalizeUser(userData: any): User {
  const roleStr = String(userData?.role || "").toLowerCase().trim();
  const role = roleStr === "admin" ? UserRole.ADMIN : UserRole.USER;
  const statusStr = String(userData?.status || "").toLowerCase().trim();
  const status = statusStr === "suspended" ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

  return {
    ...userData,
    email_verified: userData?.email_verified !== undefined ? Boolean(userData.email_verified) : true,
    role,
    status,
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;
  
  initializeAuth: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, name?: string) => Promise<void>;
  verifyOtp: (email: string, token: string, type?: string) => Promise<void>;
  resendOtp: (email: string, type?: string) => Promise<string>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (password: string) => Promise<string>;
  updateUser: (data: Partial<User>) => Promise<User>;
  logout: () => void;
  setUserFromCallback: (user: any, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("summa_access_token"),
  isLoading: true,
  isAuthenticated: false,
  initialized: false,

  initializeAuth: async () => {
    const storedToken = localStorage.getItem("summa_access_token");
    if (!storedToken || storedToken === "undefined" || storedToken === "null" || storedToken.trim() === "") {
      localStorage.removeItem("summa_access_token");
      set({ token: null, user: null, isAuthenticated: false, isLoading: false, initialized: true });
      return;
    }

    try {
      const rawUserData = await fetchApi<any>("/user");
      const normalized = normalizeUser(rawUserData);
      set({ token: storedToken, user: normalized, isAuthenticated: true, isLoading: false, initialized: true });
    } catch (err) {
      console.warn("Auth token verification failed, clearing session:", err);
      localStorage.removeItem("summa_access_token");
      set({ token: null, user: null, isAuthenticated: false, isLoading: false, initialized: true });
    }
  },

  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const res = await fetchApi<{ access_token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, provider: "credentials" }),
      });

      localStorage.setItem("summa_access_token", res.access_token);
      const normalized = normalizeUser(res.user);
      set({ token: res.access_token, user: normalized, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signup: async (email: string, password?: string, name?: string) => {
    set({ isLoading: true });
    try {
      const res = await fetchApi<{ access_token: string; user: any }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name, provider: "credentials" }),
      });

      localStorage.setItem("summa_access_token", res.access_token);
      const normalized = normalizeUser(res.user);
      set({ token: res.access_token, user: normalized, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  verifyOtp: async (email: string, code: string, type: string = "signup") => {
    set({ isLoading: true });
    try {
      const res = await fetchApi<{ access_token: string; user: any }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, token: code, type }),
      });

      localStorage.setItem("summa_access_token", res.access_token);
      const normalized = normalizeUser(res.user);
      set({ token: res.access_token, user: normalized, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  resendOtp: async (email: string, type: string = "signup"): Promise<string> => {
    const res = await fetchApi<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email, type }),
    });
    return res.message;
  },

  forgotPassword: async (email: string): Promise<string> => {
    const res = await fetchApi<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return res.message;
  },

  resetPassword: async (password: string): Promise<string> => {
    // Use the recovery token stored by /callback for password-reset flows.
    // Fall back to the regular session token for in-session password changes.
    const recoveryToken = localStorage.getItem("summa_reset_token");
    const sessionToken = localStorage.getItem("summa_access_token");
    const tokenToUse = recoveryToken || sessionToken;

    const res = await fetchApi<{ message: string }>("/auth/reset-password", {
      method: "POST",
      headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
      body: JSON.stringify({ password }),
    });
    // Clear the one-time recovery token after use
    if (recoveryToken) localStorage.removeItem("summa_reset_token");
    return res.message;
  },

  updateUser: async (data: Partial<User>): Promise<User> => {
    const rawUpdated = await fetchApi<any>("/user", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const normalized = normalizeUser(rawUpdated);
    set({ user: normalized });
    return normalized;
  },

  logout: () => {
    localStorage.removeItem("summa_access_token");
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  setUserFromCallback: (userData: any, token: string) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem("summa_access_token", token);
    set({ token, user: normalized, isAuthenticated: true, isLoading: false, initialized: true });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("summa:unauthorized", () => {
    useAuthStore.getState().logout();
    if (window.location.pathname !== "/sign-in") {
      window.location.href = "/sign-in";
    }
  });
}
