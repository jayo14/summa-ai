import React from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

export function NotificationsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const notifications = [
    { title: "Payment Received", desc: "LASUSTECH renewed Enterprise Plan (₦250,000)", time: "15m ago", type: "payment" },
    { title: "New Institution Onboarded", desc: "Babcock University requested 500 student seats", time: "1h ago", type: "institution" },
    { title: "AI Model Latency Spike", desc: "Gemini 2.5 API latency returned to nominal <350ms", time: "3h ago", type: "system" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-ink dark:bg-[#121616]/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          <div className="p-5 border-b border-mist-green dark:border-[#2A3838] flex items-center justify-between bg-cream-light dark:bg-[#121616]">
            <div className="flex items-center gap-2 font-bold text-sm text-ink dark:text-cream-soft">
              <Bell size={16} className="text-teal-dark dark:text-accent-lime" />
              <span>Admin Notifications</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {notifications.map((n, idx) => (
              <div key={idx} className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-ink dark:text-cream-soft">{n.title}</span>
                  <span className="text-[10px] text-grey-green dark:text-[#8FA29B] font-mono">{n.time}</span>
                </div>
                <p className="text-grey-green dark:text-[#8FA29B] text-[11px] leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-mist-green dark:border-[#2A3838] bg-cream-light dark:bg-[#121616]">
          <button onClick={() => { toast.success("Marked all as read"); onClose(); }} className="w-full py-2 rounded-xl bg-cream-light dark:bg-[#232D2D] hover:bg-mist-green/50 dark:hover:bg-[#2A3838] text-ink dark:text-cream-soft font-semibold text-xs transition">
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
}
