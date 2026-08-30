import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await resetPassword(password);
      setIsSuccess(true);
      toast.success(msg || "Password reset successful!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      topRightLink={{ href: "/sign-in", label: "Sign in" }}
      heroHeadline="Strong security keeps your learning data safe."
      heroDescription="Update your account credentials to maintain secure access to your AI memory workspace."
    >
      <div className="mb-6">
        <span className="block text-[10px] font-bold tracking-widest text-[#005A57] uppercase mb-1.5 font-mono">
          UPDATE PASSWORD
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B] tracking-tight leading-snug">
          Set a new password
        </h2>
        <p className="text-xs text-[#6D7E78] mt-1.5">
          {isSuccess
            ? "Your password has been updated successfully."
            : "Enter your new password below."}
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-6">
          <div className="p-4 bg-[#DDE8DF]/80 border border-[#DDE8DF] rounded-2xl text-xs text-[#003F3F] flex items-center gap-2.5">
            <CheckCircle className="size-5 text-[#005A57] flex-shrink-0" />
            <span>Password successfully reset! You can now sign in.</span>
          </div>

          <button
            onClick={() => setLocation("/sign-in")}
            className="w-full py-3 px-4 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Sign in with new password
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#102B2B] mb-1.5">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7E78] size-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FBFAF6] border border-[#DDE8DF] rounded-2xl text-sm text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6D7E78] hover:text-[#102B2B] transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <Sparkles className="size-4 animate-spin text-[#003F3F]" />
            ) : (
              "Update password"
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-xs text-[#6D7E78] font-bold hover:text-[#102B2B] transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
