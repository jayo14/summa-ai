/**
 * /callback — handles Supabase email confirmation and OAuth redirects.
 *
 * Supabase appends these query params to the redirect URL:
 *   - Email confirmation:  ?code=...&type=signup
 *   - Password reset:      ?code=...&type=recovery
 *   - OAuth (Google etc):  ?code=...&type=magiclink
 *
 * This page exchanges the code via Supabase's PKCE flow,
 * fetches the user profile from FastAPI, and routes by role.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { fetchApi } from "@/lib/api";
import { SummaPreloader } from "@/components/SummaPreloader";
import { UserRole } from "@/types/roles";
import { toast } from "sonner";

export default function Callback() {
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    // Handle error in URL
    const errorDesc =
      params.get("error_description") || hashParams.get("error_description");
    if (errorDesc) {
      setError(errorDesc);
      toast.error(errorDesc);
      return;
    }

    const code = params.get("code") || hashParams.get("code");
    const type = params.get("type") || hashParams.get("type") || "signup";

    // Password recovery — redirect to reset page (Supabase handles session via code)
    if (type === "recovery" && code) {
      const supabase = getSupabaseClient();
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(() => {
          setLocation("/reset-password");
        })
        .catch((err: any) => {
          setError(err.message || "Recovery link is invalid or has expired.");
          toast.error(err.message || "Recovery link expired");
        });
      return;
    }

    // Email confirmation / OAuth — exchange code for session
    if (code) {
      const supabase = getSupabaseClient();
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(async () => {
          // Fetch application profile from FastAPI
          try {
            const rawUserData = await fetchApi<any>("/auth/me");
            const role = rawUserData?.user?.role || rawUserData?.role;
            toast.success("Email confirmed! Welcome to Summa AI.");

            if (role === UserRole.ADMIN) {
              setLocation("/admin");
            } else {
              setLocation("/");
            }
          } catch {
            // Profile fetch failed — still authenticated via Supabase
            toast.success("Email confirmed! Welcome to Summa AI.");
            setLocation("/");
          }
        })
        .catch((err: any) => {
          const msg = err.message || "Callback verification failed";
          setError(msg);
          toast.error(msg);
        });
      return;
    }

    // No code or error — invalid callback
    setError("No authorization code found in callback URL.");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F3EC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="text-2xl">&#9888;&#65039;</div>
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
