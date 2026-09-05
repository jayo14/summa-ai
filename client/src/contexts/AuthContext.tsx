import React, { createContext, useContext, useEffect, useState } from "react";
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

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, name?: string) => Promise<void>;
  verifyOtp: (email: string, token: string, type?: string) => Promise<void>;
  resendOtp: (email: string, type?: string) => Promise<string>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (password: string) => Promise<string>;
  updateUser: (data: Partial<User>) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("summa_access_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      const storedToken = localStorage.getItem("summa_access_token");
      if (!storedToken || storedToken === "undefined" || storedToken === "null" || storedToken.trim() === "") {
        localStorage.removeItem("summa_access_token");
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const rawUserData = await fetchApi<any>("/user");
        if (isMounted) {
          setUser(normalizeUser(rawUserData));
        }
      } catch (err) {
        console.warn("Auth token verification failed, clearing session:", err);
        localStorage.removeItem("summa_access_token");
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verifyAuth();

    const handleUnauthorized = () => {
      if (isMounted) {
        setToken(null);
        setUser(null);
        if (window.location.pathname !== "/sign-in") {
          window.location.href = "/sign-in";
        }
      }
    };

    window.addEventListener("summa:unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener("summa:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ access_token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, provider: "credentials" }),
      });

      localStorage.setItem("summa_access_token", res.access_token);
      setToken(res.access_token);
      setUser(normalizeUser(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password?: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ access_token: string; user: any }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name, provider: "credentials" }),
      });

      localStorage.setItem("summa_access_token", res.access_token);
      setToken(res.access_token);
      setUser(normalizeUser(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, code: string, type: string = "signup") => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ access_token: string; user: any }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, token: code, type }),
      });

      localStorage.setItem("summa_access_token", res.access_token);
      setToken(res.access_token);
      setUser(normalizeUser(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string, type: string = "signup"): Promise<string> => {
    const res = await fetchApi<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email, type }),
    });
    return res.message;
  };

  const forgotPassword = async (email: string): Promise<string> => {
    const res = await fetchApi<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return res.message;
  };

  const resetPassword = async (password: string): Promise<string> => {
    const res = await fetchApi<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    return res.message;
  };

  const updateUser = async (data: Partial<User>): Promise<User> => {
    const rawUpdated = await fetchApi<any>("/user", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const normalized = normalizeUser(rawUpdated);
    setUser(normalized);
    return normalized;
  };

  const logout = () => {
    localStorage.removeItem("summa_access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
