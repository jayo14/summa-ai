import { create } from "zustand";
import { getSupabaseClient } from "@/lib/supabaseClient";
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

function getSupabase(): ReturnType<typeof getSupabaseClient> {
  return getSupabaseClient();
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
  logout: () => Promise<void>;
  setUserFromCallback: (user: any, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  initialized: false,

  initializeAuth: async () => {
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false, initialized: true });
        return;
      }

      const token = session.access_token;

      // Fetch application profile from FastAPI
      try {
        const rawUserData = await fetchApi<any>("/auth/me");
        const normalized = normalizeUser(rawUserData?.user || rawUserData);
        set({ token, user: normalized, isAuthenticated: true, isLoading: false, initialized: true });
      } catch {
        // Profile fetch failed — clear Supabase session too
        await supabase.auth.signOut();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false, initialized: true });
      }
    } catch {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false, initialized: true });
    }
  },

  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || "" });

      if (error) {
        // Check for email not verified
        if (error.message.toLowerCase().includes("email not confirmed") ||
            error.message.toLowerCase().includes("not verified")) {
          throw new Error("not verified");
        }
        throw error;
      }

      if (!data.session?.access_token) {
        throw new Error("Authentication failed — no session");
      }

      const token = data.session.access_token;

      // Fetch application profile
      const rawUserData = await fetchApi<any>("/auth/me");
      const normalized = normalizeUser(rawUserData?.user || rawUserData);
      set({ token, user: normalized, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signup: async (email: string, password?: string, name?: string) => {
    set({ isLoading: true });
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || "",
        options: { data: { name: name || email.split("@")[0] } },
      });

      if (error) throw error;

      // If email confirmation is required, data.session may be null
      if (data.session?.access_token) {
        const token = data.session.access_token;
        const rawUserData = await fetchApi<any>("/auth/me");
        const normalized = normalizeUser(rawUserData?.user || rawUserData);
        set({ token, user: normalized, isAuthenticated: true, isLoading: false });
      } else {
        // Email verification required — not authenticated yet
        set({ isLoading: false });
      }
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  verifyOtp: async (email: string, code: string, type: string = "signup") => {
    set({ isLoading: true });
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: type as any,
      });

      if (error) throw error;

      if (!data.session?.access_token) {
        throw new Error("Verification failed — no session");
      }

      const token = data.session.access_token;
      const rawUserData = await fetchApi<any>("/auth/me");
      const normalized = normalizeUser(rawUserData?.user || rawUserData);
      set({ token, user: normalized, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  resendOtp: async (email: string, _type: string = "signup"): Promise<string> => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw error;
    return "Verification code sent to your email.";
  },

  forgotPassword: async (email: string): Promise<string> => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback?type=recovery`,
    });
    if (error) throw error;
    return "If an account exists for this email address, password reset instructions have been sent.";
  },

  resetPassword: async (password: string): Promise<string> => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return "Password updated successfully. You can now sign in with your new password.";
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

  logout: async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch {
      // Sign-out errors are non-critical — proceed with local cleanup
    }
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
