import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export function GeminiIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 24C12 20.2 10.7 16.8 8.4 14.4C6 12 2.6 10.7 0 10.7C2.6 10.7 6 8 8.4 5.6C10.7 3.2 12 0 12 0C12 0 13.3 3.2 15.6 5.6C18 8 21.4 10.7 24 10.7C21.4 10.7 18 12 15.6 14.4C13.3 16.8 12 20.2 12 24Z"
        fill="url(#gemini-gradient)"
      />
      <defs>
        <linearGradient id="gemini-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1C7CF4" />
          <stop offset="1" stopColor="#1BA1E3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
