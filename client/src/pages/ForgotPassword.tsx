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
        <span className="block text-[10px] font-bold tracking-widest text-[#005A57] uppercase mb-1.5 font-mono">
          RECOVER ACCESS
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B] tracking-tight leading-snug">
          Recover your workspace
        </h2>
        <p className="text-xs text-[#6D7E78] mt-1.5">
          {isSent
            ? "Check your email inbox for instructions."
            : "Enter your email address to receive password reset instructions."}
        </p>
      </div>

      {isSent ? (
        <div className="space-y-6">
          <div className="p-4 bg-[#DDE8DF]/80 border border-[#DDE8DF] rounded-2xl text-xs text-[#003F3F] leading-relaxed">
            Password reset instructions have been sent to <strong>{email}</strong>.
          </div>

          <Link
            href="/sign-in"
            className="w-full py-3 px-4 bg-[#003F3F] hover:bg-[#005A57] text-[#F5F3EC] text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="size-4 text-[#F5F3EC]" />
            Back to Sign In
          </Link>
        </div>
      ) : (
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Sparkles className="size-4 animate-spin text-[#003F3F]" />
            ) : (
              <>
                Send Reset Link
                <Send className="size-4 text-[#003F3F]" />
              </>
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
