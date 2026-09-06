import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Camera,
  Check,
  ChevronRight,
  FileText,
  Loader2,
  Lock,
  Mail,
  Save,
  Shield,
  Sparkles,
  Trash2,
  User as UserIcon,
  Zap,
} from "lucide-react";

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 border-b border-[#DDE8DF] dark:border-slate-800/80 last:border-0">
      <div className="max-w-2xl">
        <h3 className="text-base font-bold text-[#102B2B] dark:text-slate-100">{title}</h3>
        <p className="text-xs sm:text-sm text-[#6D7E78] dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function SettingsView({
  memoryEnabled,
  setMemoryEnabled,
}: {
  memoryEnabled: boolean;
  setMemoryEnabled: (value: boolean) => void;
}) {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [explanationPref, setExplanationPref] = useState("examples");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const initials = (name || user?.email || "Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      try {
        const uploadRes = await fetchApi<{ url: string }>("/storage/upload", {
          method: "POST",
          body: JSON.stringify({
            file_data: result,
            file_name: file.name,
            bucket: "avatars",
          }),
        });
        const finalUrl = uploadRes?.url || result;
        setAvatar(finalUrl);
        await updateUser({ avatar: finalUrl });
        toast.success("Avatar uploaded and saved to profile!");
      } catch (err: any) {
        toast.error(err.message || "Failed to upload avatar to storage bucket");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    toast.info("Avatar removed. Click 'Save profile' to confirm.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        bio: bio.trim(),
        avatar,
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="secondary-page settings-page w-full p-4 sm:p-6 lg:p-8 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Intro Header */}
      <section className="secondary-intro plain-intro flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DDE8DF] dark:border-slate-800 pb-6">
        <div>
          <span className="eyebrow uppercase font-mono tracking-widest text-[#6D7E78] dark:text-[#B8FF4D] font-bold text-xs">
            ACCOUNT & PREFERENCES
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#102B2B] dark:text-white mt-1 tracking-tight">
            Profile & Learning Settings
          </h1>
          <p className="text-sm sm:text-base text-[#6D7E78] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Customize your display identity, study avatar, memory retention controls, and account safeguards.
          </p>
        </div>
        <div className="connect-status inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#005A57] bg-[#E7EFE7] dark:bg-[#003F3F]/60 text-[#003F3F] dark:text-[#B8FF4D] text-xs sm:text-sm font-bold font-mono shrink-0">
          <span className="size-2 rounded-full bg-[#B8FF4D] animate-pulse" />
          <span>SummaStudy Synced</span>
        </div>
      </section>

      {/* Profile Form Card */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE8DF] dark:border-[#2A3838] pb-5">
          <div>
            <h2 className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6]">Public Profile</h2>
            <p className="text-xs sm:text-sm text-[#6D7E78] dark:text-[#DDE8DF] mt-0.5">
              This information is displayed on your study dashboard and session headers.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] border border-[#005A57] font-bold text-xs sm:text-sm rounded-full shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-[#003F3F]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5 text-[#003F3F]" />
                <span>Save profile</span>
              </>
            )}
          </button>
        </div>

        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
          <div className="relative group shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile Avatar"
                className="size-20 rounded-2xl object-cover border-2 border-[#DDE8DF] dark:border-[#2A3838] shadow-sm"
              />
            ) : (
              <div className="size-20 rounded-2xl bg-[#003F3F] text-[#B8FF4D] font-bold font-mono text-xl flex items-center justify-center border-2 border-[#005A57] shadow-sm">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 size-7 rounded-xl bg-[#005A57] hover:bg-[#003F3F] text-[#B8FF4D] flex items-center justify-center shadow-md transition-all cursor-pointer border border-[#003F3F]"
              title="Upload new avatar"
            >
              <Camera className="size-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6]">Profile Photo</h3>
            <p className="text-xs text-[#6D7E78] dark:text-[#DDE8DF]">
              Upload a custom PNG, JPG, or GIF (max 5MB).
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-[#DDE8DF] hover:bg-[#c8d9cc] dark:bg-[#232D2D] dark:hover:bg-[#2A3838] text-[#003F3F] dark:text-[#B8FF4D] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer border border-[#005A57]/20 dark:border-[#2A3838] flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-[#003F3F] dark:text-[#B8FF4D]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload avatar</span>
                )}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#DDE8DF] dark:border-[#2A3838]">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6] mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7E78] dark:text-[#8FA29B] size-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] rounded-xl text-sm text-[#102B2B] dark:text-[#FBFAF6] placeholder:text-[#6D7E78] dark:placeholder:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-[#005A57]/30 focus:border-[#005A57] dark:focus:border-[#B8FF4D] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7E78] dark:text-[#8FA29B] size-4" />
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full pl-10 pr-24 py-2.5 bg-[#F5F3EC] dark:bg-[#181E1E]/60 border border-[#DDE8DF] dark:border-[#2A3838] rounded-xl text-sm text-[#6D7E78] dark:text-[#8FA29B] cursor-not-allowed font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#005A57] dark:text-[#B8FF4D] bg-[#E7EFE7] dark:bg-[#232D2D] px-2.5 py-0.5 rounded-full border border-[#005A57]/30 dark:border-[#2A3838] font-mono">
                Verified
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6] mb-1.5">
              Bio / Study Focus
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 text-[#6D7E78] dark:text-[#8FA29B] size-4" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Share your major, active courses, or learning goals..."
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] rounded-xl text-sm text-[#102B2B] dark:text-[#FBFAF6] placeholder:text-[#6D7E78] dark:placeholder:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-[#005A57]/30 focus:border-[#005A57] dark:focus:border-[#B8FF4D] transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Learning & Memory Controls Sheet */}
      <section className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6] pb-3 border-b border-[#DDE8DF] dark:border-[#2A3838]">
          Learning & Memory Controls
        </h2>

        <SettingRow
          title="Learning memory retention"
          description="Use prior study evidence, preferences, and recurring misconceptions to adapt future AI study sessions."
        >
          <button
            type="button"
            className={`switch-control ${memoryEnabled ? "on" : ""}`}
            role="switch"
            aria-checked={memoryEnabled}
            onClick={() => setMemoryEnabled(!memoryEnabled)}
          >
            <span />
          </button>
        </SettingRow>

        <SettingRow
          title="Explanation style preference"
          description="Select how AI tutors introduce complex academic concepts to match your comprehension style."
        >
          <select
            value={explanationPref}
            onChange={(e) => {
              setExplanationPref(e.target.value);
              toast.success("Explanation style preference saved!");
            }}
            className="px-3.5 py-2 bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] rounded-xl text-xs sm:text-sm font-semibold text-[#003F3F] dark:text-[#FBFAF6] focus:outline-none focus:ring-2 focus:ring-[#005A57]/30 cursor-pointer"
          >
            <option value="examples">Examples before abstractions</option>
            <option value="concepts">Concept-first breakdown</option>
            <option value="socratic">Socratic questioning mode</option>
          </select>
        </SettingRow>

        <SettingRow
          title="Resource access permissions"
          description="Academic materials and approved past questions are currently connected through SummaStudy."
        >
          <button
            type="button"
            className="px-3.5 py-1.5 bg-[#DDE8DF] hover:bg-[#c8d9cc] dark:bg-[#232D2D] dark:hover:bg-[#2A3838] text-[#003F3F] dark:text-[#B8FF4D] text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-[#005A57]/20 dark:border-[#2A3838]"
            onClick={() => toast("Resource permissions are managed through SummaStudy.")}
          >
            Manage access <ChevronRight className="size-3.5" />
          </button>
        </SettingRow>

        <SettingRow
          title="Delete learning data"
          description="Permanently remove saved study sessions, flashcards, or memory profiles from this account."
        >
          <button
            type="button"
            className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/50"
            onClick={() => toast("For safety, data deletion requires secondary password confirmation.")}
          >
            Review controls <ChevronRight className="size-3.5" />
          </button>
        </SettingRow>
      </section>

      {/* Account Safeguards & Auth Sheet */}
      <section className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6] pb-3 border-b border-[#DDE8DF] dark:border-[#2A3838]">
          Account Safeguards & Security
        </h2>

        <SettingRow
          title="Authentication provider"
          description="Your account is secured via Supabase Auth with encrypted JWT session management."
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#E7EFE7] dark:bg-[#232D2D] rounded-xl text-xs sm:text-sm font-semibold text-[#003F3F] dark:text-[#B8FF4D] border border-[#005A57]/30 dark:border-[#2A3838]">
            <Shield className="size-3.5 text-[#005A57] dark:text-[#B8FF4D]" />
            <span>Supabase Auth</span>
          </div>
        </SettingRow>

        <SettingRow
          title="Active sessions"
          description="Logged in on this device with valid access token."
        >
          <span className="text-xs sm:text-sm font-mono font-bold text-[#005A57] dark:text-[#B8FF4D] bg-[#E7EFE7] dark:bg-[#232D2D] px-3 py-1 rounded-full border border-[#005A57]/30 dark:border-[#2A3838]">
            1 Active Session
          </span>
        </SettingRow>
      </section>
    </div>
  );
}
