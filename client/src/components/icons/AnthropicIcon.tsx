import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export function AnthropicIcon({ className = "", size = 24 }: IconProps) {
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
        d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.258 0h3.767L16.906 20.48h-3.674l-1.632-4.317h-6.46l-1.59 4.317H0L6.57 3.52zm1.07 5.412l-2.182 5.764h4.344l-2.163-5.764z"
        fill="#D4A574"
      />
    </svg>
  );
}
