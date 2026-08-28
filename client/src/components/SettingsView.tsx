import React, { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  Trash2,
  User as UserIcon,
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
    <div className="setting-row flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200/60 dark:border-slate-800 last:border-0">
      <div className="max-w-xl">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
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

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
      toast.success("Avatar preview updated. Click 'Save profile' to confirm.");
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
    <div className="secondary-page settings-page max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
      {/* Intro Header */}
      <section className="secondary-intro plain-intro">
        <div>
          <span className="eyebrow">ACCOUNT & PREFERENCES</span>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Profile & Learning Settings
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize your display profile, study avatar, and memory retention controls.
          </p>
        </div>
      </section>

      {/* Profile Form Card */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Public Profile</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              This information will be displayed on your study dashboard and session headers.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Save profile</span>
              </>
            )}
          </button>
        </div>

        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
          <div className="relative group">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile Avatar"
                className="size-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div className="size-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 size-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-all"
              title="Upload new avatar"
            >
              <Camera className="size-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Profile Photo</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Upload a custom PNG, JPG, or GIF (max 5MB).
            </p>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Upload avatar
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3 py-1.5 text-rose-600 hover:text-rose-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="size-3" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full pl-10 pr-3 py-2 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Verified
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Bio / Study Focus
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 text-slate-400 size-4" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Share your major, courses, or learning goals..."
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Learning & Memory Controls Sheet */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
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
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
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
            className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
            onClick={() => toast("For safety, data deletion requires secondary password confirmation.")}
          >
            Review controls <ChevronRight className="size-3.5" />
          </button>
        </SettingRow>
      </section>
    </div>
  );
}
