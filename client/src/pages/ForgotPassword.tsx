import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Mail, Send, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await forgotPassword(email);
      setIsSent(true);
      toast.success(msg || "Reset link sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      topRightLink={{ href: "/sign-in", label: "Sign in" }}
      heroHeadline="Account recovery and security protection."
      heroDescription="We send encrypted, time-sensitive verification links to confirm identity before resetting your password."
    >
      <div className="mb-6">
        <span className="block text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-1.5 font-mono">
          RECOVER ACCESS
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
          Recover your workspace
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          {isSent
            ? "Check your email inbox for instructions."
            : "Enter your email address to receive password reset instructions."}
        </p>
      </div>

      {isSent ? (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50/80 dark:bg-indigo-900/30 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            Password reset instructions have been sent to <strong>{email}</strong>.
          </div>

          <Link
            href="/sign-in"
            className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/90 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Sparkles className="size-4 animate-spin" />
            ) : (
              <>
                Send Reset Link
                <Send className="size-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
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
