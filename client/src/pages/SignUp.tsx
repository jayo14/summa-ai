import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Sparkles, User as UserIcon } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, password, name);
      toast.success("Account created successfully!");
      setLocation("/");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      topRightLink={{ href: "/sign-in", label: "Sign in" }}
      heroHeadline="AI-native learning, recall, and study tools in one place."
      heroDescription="Join thousands of students accelerating their study workflow with structured AI cards and real-time context."
    >
      <div className="mb-5">
        <span className="block text-[10px] font-bold tracking-widest text-[#005A57] uppercase mb-1.5 font-mono">
          CREATE YOUR ACCOUNT
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B] tracking-tight leading-snug">
          Start your learning journey
        </h2>
        <p className="text-xs text-[#6D7E78] mt-1.5">
          Join your personalized AI study workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <button
          type="button"
          onClick={() => toast.info("Google Sign-In integration initialized.")}
          className="w-full py-2.5 px-4 bg-[#FBFAF6] border border-[#DDE8DF] hover:bg-[#E7EFE7] text-[#102B2B] text-sm font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer mb-2"
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
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#DDE8DF] w-full" />
          <span className="bg-[#F5F3EC] px-3 text-[10px] font-semibold text-[#6D7E78] uppercase tracking-widest relative z-10 whitespace-nowrap rounded-full border border-[#DDE8DF]">
            or email
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102B2B] mb-1">
            Full name
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7E78] size-4" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FBFAF6] border border-[#DDE8DF] rounded-2xl text-sm text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102B2B] mb-1">
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
          <label className="block text-xs font-semibold text-[#102B2B] mb-1">
            Password
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

        <div className="pt-1">
          <label className="flex items-center gap-2 text-xs text-[#6D7E78] font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="size-4 rounded border-[#DDE8DF] text-[#005A57] focus:ring-[#005A57]"
            />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-3 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#003F3F]" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="size-4 text-[#003F3F]" />
            </>
          )}
        </button>

        {/* Student-centric benefit callout box */}
        <div className="bg-[#DDE8DF]/60 border border-[#DDE8DF] rounded-2xl p-3.5 flex gap-3 items-start text-xs text-[#003F3F] mt-4 leading-relaxed">
          <Sparkles className="size-4 text-[#005A57] flex-shrink-0 mt-0.5" />
          <p>
            Get instant access to AI flashcards, active recall quizzes, and personalized course study plans!
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
