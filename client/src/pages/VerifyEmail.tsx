import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function VerifyEmail() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const { user, verifyOtp, resendOtp } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get stored email or user's email from auth state
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      const stored = localStorage.getItem("summa_pending_email");
      if (stored) setEmail(stored);
    }
  }, [user]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length < 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    if (!email) {
      toast.error("Email address missing. Please return to sign in.");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtp(email, code.trim());
      toast.success("Email verified successfully! Welcome to Summa AI.");
      localStorage.removeItem("summa_pending_email");
      setLocation("/");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired verification code");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setIsResending(true);
    try {
      const msg = await resendOtp(email);
      toast.success(msg || "Verification code sent to your email!");
      setResendCooldown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      topRightLink={{ href: "/sign-in", label: "Back to Sign In" }}
      heroHeadline="Verify your email to activate your account."
      heroDescription="Check your inbox for a 6-digit verification code to access your Summa AI learning workspace."
    >
      <div className="mb-6">
        <span className="block text-[10px] font-bold tracking-widest text-[#005A57] uppercase mb-1.5 font-mono">
          EMAIL VERIFICATION
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B] tracking-tight leading-snug">
          Verify your email address
        </h2>
        <p className="text-xs text-[#6D7E78] mt-1.5">
          We sent a verification code to{" "}
          <span className="font-semibold text-[#102B2B]">{email || "your email"}</span>.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#102B2B] mb-1.5">
            Verification Code
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7E78] size-4" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
              maxLength={8}
              placeholder="Enter code (e.g. 123456)"
              className="w-full pl-10 pr-4 py-3 bg-[#FBFAF6] border border-[#DDE8DF] rounded-2xl text-base tracking-wider font-mono text-[#102B2B] placeholder:text-[#6D7E78] placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
              required
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full py-3 px-4 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#003F3F]" />
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              Verify & Continue
              <ArrowRight className="size-4 text-[#003F3F]" />
            </>
          )}
        </button>

        <div className="pt-3 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#6D7E78]">
          <span>Didn't receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="font-bold text-[#005A57] hover:underline disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {isResending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
          </button>
        </div>

        <div className="bg-[#DDE8DF]/60 border border-[#DDE8DF] rounded-2xl p-3.5 flex gap-3 items-start text-xs text-[#003F3F] mt-5 leading-relaxed">
          <CheckCircle2 className="size-4 text-[#005A57] flex-shrink-0 mt-0.5" />
          <p>
            Once verified, your account will be fully activated and you can start creating course workflows and AI note cards!
          </p>
        </div>

        {/* Development mode indicator */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-[#6D7E78]">
            <span className="font-mono text-[10px] bg-[#E7EFE7] px-1.5 py-0.5 rounded border border-[#DDE8DF] text-[#005A57]">DEV MODE</span> You can enter any 6-digit code (e.g. <code className="font-mono font-bold text-[#005A57]">123456</code>) to verify instantly!
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
