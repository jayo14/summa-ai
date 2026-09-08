import React, { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, UserStatus } from "@/types/roles";
import { AdminLayout } from "@/components/admin/AdminLayout";

// Admin page imports
import { OverviewPage } from "@/pages/admin/OverviewPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { InstitutionsPage } from "@/pages/admin/InstitutionsPage";
import { AnalyticsPage } from "@/pages/admin/AnalyticsPage";
import { SubscriptionsPage } from "@/pages/admin/SubscriptionsPage";
import { RevenuePage } from "@/pages/admin/RevenuePage";
import { EngagementPage } from "@/pages/admin/EngagementPage";
import { ContentPage } from "@/pages/admin/ContentPage";
import { QuizzesPage } from "@/pages/admin/QuizzesPage";
import { SessionsPage } from "@/pages/admin/SessionsPage";
import { MessagesPage } from "@/pages/admin/MessagesPage";
import { FeedbackPage } from "@/pages/admin/FeedbackPage";
import { IntegrationsPage } from "@/pages/admin/IntegrationsPage";
import { ComponentsPage } from "@/pages/admin/ComponentsPage";
import { ComponentDetailPage } from "@/pages/admin/components/ComponentDetailPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { AuditPage } from "@/pages/admin/AuditPage";
import { AIModelsPage } from "@/pages/admin/AIModelsPage";

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  provider?: string;
  onboarded: boolean;
  onboarding_data?: {
    degree?: string;
    field_of_study?: string;
  };
  last_active?: string;
  created_at?: string;
}

interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_user_id: string;
  target_email: string;
  details: string;
  timestamp: string;
}

type AdminTab =
  | "overview"
  | "users"
  | "institutions"
  | "analytics"
  | "subscriptions"
  | "revenue"
  | "engagement"
  | "content"
  | "quizzes"
  | "sessions"
  | "messages"
  | "feedback"
  | "integrations"
  | "components"
  | "ai-models"
  | "settings"
  | "audit";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, params] = useRoute("/admin/:tab");
  const [, componentParams] = useRoute("/admin/components/:id");

  // Determine tab: /admin/components/:id still maps to "components" tab
  const componentId = componentParams?.id;
  const currentTabFromUrl: AdminTab = componentId
    ? "components"
    : ((params?.tab as AdminTab) || "overview");

  const [activeTab, setActiveTab] = useState<AdminTab>(currentTabFromUrl);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.tab && params.tab !== activeTab) {
      setActiveTab(params.tab as AdminTab);
    }
  }, [params?.tab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uJson, aJson, sJson] = await Promise.all([
        fetchApi<any>("/admin/users"),
        fetchApi<any>("/admin/audit-logs"),
        fetchApi<any>("/admin/stats"),
      ]);

      if (uJson?.users) {
        setUsers(uJson.users);
      }
      if (aJson?.audit_logs) {
        setAuditLogs(aJson.audit_logs);
      }
      if (sJson?.data) {
        setAdminStats(sJson.data);
      }
    } catch (err) {
      toast.error("Failed to refresh admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRoleStr: string) => {
    const targetRole = newRoleStr === "admin" ? UserRole.ADMIN : UserRole.USER;
    try {
      await fetchApi(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: targetRole }),
      });

      toast.success(`User role updated to ${targetRole.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to update user role.");
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    try {
      await fetchApi(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      toast.success(`User status updated to ${newStatus.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to update account status.");
    }
  };

  const renderPage = () => {
    // Handle component detail route
    if (activeTab === "components" && componentId) {
      return <ComponentDetailPage />;
    }

    switch (activeTab) {
      case "overview":
        return <OverviewPage />;
      case "users":
        return (
          <UsersPage
            users={users}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
            onRefresh={fetchAdminData}
          />
        );
      case "institutions":
        return <InstitutionsPage />;
      case "analytics":
        return <AnalyticsPage stats={adminStats} />;
      case "subscriptions":
        return <SubscriptionsPage />;
      case "revenue":
        return <RevenuePage />;
      case "engagement":
        return <EngagementPage />;
      case "content":
        return <ContentPage />;
      case "quizzes":
        return <QuizzesPage />;
      case "sessions":
        return <SessionsPage />;
      case "messages":
        return <MessagesPage />;
      case "feedback":
        return <FeedbackPage />;
      case "integrations":
        return <IntegrationsPage />;
      case "components":
        return <ComponentsPage />;
      case "ai-models":
        return <AIModelsPage />;
      case "settings":
        return <SettingsPage />;
      case "audit":
        return <AuditPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab}>
      {renderPage()}
    </AdminLayout>
  );
}
