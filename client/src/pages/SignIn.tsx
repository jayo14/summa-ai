import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSigned, setKeepSigned] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      setLocation("/");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout topRightLink={{ href: "/sign-up", label: "Create account" }}>
      <div className="mb-6">
        <span className="block text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">
          WELCOME BACK
        </span>
        <h1 className="text-3xl lg:text-[32px] font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          Pick up the learning day where you left it.
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Sign in to your Summa AI workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

        <div className="flex items-center justify-between pt-1 pb-1">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepSigned}
              onChange={(e) => setKeepSigned(e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Keep me signed in</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        {/* Security Info Callout Box */}
        <div className="bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-4 flex gap-3 items-start text-xs text-slate-600 dark:text-slate-300 mt-6 leading-relaxed">
          <Sparkles className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p>
            This is a secure authentication experience. Account creation, email delivery, OTP validation, and password storage use encrypted backend services.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
