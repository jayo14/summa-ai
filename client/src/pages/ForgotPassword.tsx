import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Mail, Send, Sparkles } from "lucide-react";
import { SummaLogo } from "@/components/SummaLogo";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] p-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <SummaLogo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Forgot Password
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isSent
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you a password reset link"}
          </p>
        </div>

        {isSent ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl text-sm text-purple-800 dark:text-purple-200">
              Password reset instructions have been sent to <strong>{email}</strong>.
            </div>

            <Link
              href="/sign-in"
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-800"
            >
              <ArrowLeft className="size-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
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

            <div className="mt-6 text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-slate-100"
              >
                <ArrowLeft className="size-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
