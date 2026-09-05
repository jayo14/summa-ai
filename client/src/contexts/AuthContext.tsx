import React, { useEffect } from "react";
import { useAuthStore, User } from "@/stores/authStore";

export type { User };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
};

export const useAuth = () => {
  return useAuthStore();
};
