/**
 * /callback — handles Supabase email confirmation and OAuth redirects.
 *
 * Supabase appends these query params to the redirect URL:
 *   - Email confirmation:  ?access_token=...&refresh_token=...&type=signup
 *   - Password reset:      ?access_token=...&refresh_token=...&type=recovery
 *   - OAuth (Google etc):  ?access_token=...&refresh_token=...&type=magiclink
 *
 * This page exchanges the token with the backend, stores it, and routes
 * the user by role:
 *   admin  → /admin
 *   user   → /
 *   recovery → /reset-password (token forwarded in state)
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/stores/authStore";
import { fetchApi } from "@/lib/api";
import { SummaPreloader } from "@/components/SummaPreloader";
import { UserRole } from "@/types/roles";
import { toast } from "sonner";

export default function Callback() {
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const setUserFromCallback = useAuthStore((s) => s.setUserFromCallback);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Supabase may put the fragment in the hash instead of the query string
    // (depends on project settings). Handle both.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const accessToken =
      params.get("access_token") || hashParams.get("access_token") || "";
    const type =
      params.get("type") || hashParams.get("type") || "signup";
    const errorDesc =
      params.get("error_description") || hashParams.get("error_description");

    if (errorDesc) {
      setError(errorDesc);
      toast.error(errorDesc);
      return;
    }

    if (!accessToken) {
      setError("No access token found in callback URL.");
      return;
    }

    // Password reset — don't exchange for a profile session, just forward
    // the token to the reset-password page so the user can set a new password.
    if (type === "recovery") {
      localStorage.setItem("summa_reset_token", accessToken);
      setLocation("/reset-password");
      return;
    }

    // All other types (signup confirmation, magiclink, OAuth) — exchange token
    fetchApi<{ access_token: string; user: any }>("/auth/callback", {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    })
      .then((res) => {
        localStorage.setItem("summa_access_token", res.access_token);
        localStorage.removeItem("summa_pending_email");
        setUserFromCallback(res.user, res.access_token);
        toast.success("Email confirmed! Welcome to Summa AI.");

        const role = res.user?.role;
        if (role === UserRole.ADMIN) {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      })
      .catch((err: any) => {
        const msg = err.message || "Callback verification failed";
        setError(msg);
        toast.error(msg);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F3EC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="text-2xl">⚠️</div>
          <h2 className="text-lg font-bold text-[#102B2B]">Verification failed</h2>
          <p className="text-sm text-[#6D7E78]">{error}</p>
          <a
            href="/sign-in"
            className="inline-block mt-2 px-5 py-2.5 bg-[#B8FF4D] text-[#003F3F] font-bold text-sm rounded-xl border border-[#005A57] hover:bg-[#c7ff62] transition-colors"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return <SummaPreloader />;
}
