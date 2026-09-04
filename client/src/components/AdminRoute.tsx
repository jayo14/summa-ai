import React, { useEffect } from "react";
import { Redirect } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/roles";
import { SummaPreloader } from "@/components/SummaPreloader";

interface AdminRouteProps {
  component: React.ComponentType;
}

export function AdminRoute({ component: Component }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error("Please sign in to access the Admin Dashboard");
      } else if (user?.role !== UserRole.ADMIN) {
        toast.error("Access Denied: Admin privileges required", {
          description: "Your account does not have permission to access administration features.",
        });
      }
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return <SummaPreloader />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/sign-in?redirectTo=/admin" />;
  }

  if (user?.role !== UserRole.ADMIN) {
    return <Redirect to="/" />;
  }

  return <Component />;
}
