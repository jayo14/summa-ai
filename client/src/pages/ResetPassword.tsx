import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
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
        <span className="block text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">
          UPDATE PASSWORD
        </span>
        <h1 className="text-3xl lg:text-[32px] font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          Set a new password for your account.
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {isSuccess
            ? "Your password has been updated successfully."
            : "Enter your new password below."}
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
            <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Password successfully reset! You can now sign in.</span>
          </div>

          <button
            onClick={() => setLocation("/sign-in")}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
          >
            Sign in with new password
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <Sparkles className="size-4 animate-spin" />
            ) : (
              "Update password"
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white"
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
