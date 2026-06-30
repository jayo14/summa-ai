'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Summa AI logo — a hexagonal badge (referencing the proficiency hexagon
 * from the product) with a graduation cap inside. Uses currentColor so it
 * inherits text color, or pass a className with text-primary to brand it.
 */
export interface SummaLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export function SummaLogo({ size = 28, className, ...props }: SummaLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-primary', className)}
      aria-hidden="true"
      {...props}
    >
      {/* Hexagon outline */}
      <path
        d="M16 2.5 L27.5 9 L27.5 23 L16 29.5 L4.5 23 L4.5 9 Z"
        fill="currentColor"
        fillOpacity="0.10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Graduation cap */}
      <g fill="currentColor">
        {/* Cap top (mortarboard) */}
        <path d="M8 13.5 L16 10.5 L24 13.5 L16 16.5 Z" />
        {/* Cap base */}
        <path d="M11 15.5 L11 19 C11 20.5 13.5 21.5 16 21.5 C18.5 21.5 21 20.5 21 19 L21 15.5 L16 17.5 Z" fillOpacity="0.8" />
        {/* Tassel */}
        <path d="M24 13.5 L24 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="24" cy="17.8" r="1" />
      </g>
    </svg>
  )
}

export default SummaLogo
