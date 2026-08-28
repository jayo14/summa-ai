import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider?: string;
  onboarded?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, name?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("summa_access_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem("summa_access_token");
      if (!storedToken || storedToken === "undefined" || storedToken === "null" || storedToken.trim() === "") {
        localStorage.removeItem("summa_access_token");
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const userData = await fetchApi<User>("/user");
        setUser(userData);
      } catch (err) {
        console.warn("Auth token verification failed, clearing session:", err);
        localStorage.removeItem("summa_access_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ access_token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, provider: "credentials" }),
      });

      localStorage.setItem("summa_access_token", res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password?: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ access_token: string; user: User }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name, provider: "credentials" }),
      });

      localStorage.setItem("summa_access_token", res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
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
        forgotPassword,
        resetPassword,
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
