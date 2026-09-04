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
      const errMsg = err.message || "";
      if (errMsg.toLowerCase().includes("not verified") || errMsg.toLowerCase().includes("not confirmed")) {
        toast.info("Please verify your email before logging in.");
        localStorage.setItem("summa_pending_email", email);
        setLocation(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(errMsg || "Failed to sign in");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout topRightLink={{ href: "/sign-up", label: "Create account" }}>
      <div className="mb-6">
        <span className="block text-[10px] font-bold tracking-widest text-[#005A57] uppercase mb-1.5 font-mono">
          WELCOME BACK
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B] tracking-tight leading-snug">
          Pick up your learning session
        </h2>
        <p className="text-xs text-[#6D7E78] mt-1.5">
          Sign in to your Summa AI study workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#102B2B] mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7E78] size-4" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FBFAF6] border border-[#DDE8DF] rounded-2xl text-sm text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102B2B] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7E78] size-4" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

        <div className="flex items-center justify-between pt-1 pb-1">
          <label className="flex items-center gap-2 text-xs text-[#6D7E78] font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepSigned}
              onChange={(e) => setKeepSigned(e.target.checked)}
              className="size-4 rounded border-[#DDE8DF] text-[#005A57] focus:ring-[#005A57]"
            />
            <span>Keep me signed in</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs text-[#005A57] font-bold hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="button"
          onClick={() => toast.info("Google Sign-In integration initialized.")}
          className="w-full py-2.5 px-4 bg-[#FBFAF6] border border-[#DDE8DF] hover:bg-[#E7EFE7] text-[#102B2B] text-sm font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer mb-3"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#DDE8DF] w-full" />
          <span className="bg-[#F5F3EC] px-3 text-[10px] font-semibold text-[#6D7E78] uppercase tracking-widest relative z-10 whitespace-nowrap rounded-full border border-[#DDE8DF]">
            or email
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#003F3F]" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4 text-[#003F3F]" />
            </>
          )}
        </button>

        {/* Student-centric benefit callout box */}
        <div className="bg-[#DDE8DF]/60 border border-[#DDE8DF] rounded-2xl p-3.5 flex gap-3 items-start text-xs text-[#003F3F] mt-5 leading-relaxed">
          <Sparkles className="size-4 text-[#005A57] flex-shrink-0 mt-0.5" />
          <p>
            Welcome back! Your study notes, interactive quizzes, and AI flashcards are right where you left them.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
