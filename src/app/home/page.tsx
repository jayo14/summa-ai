'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LandingPage } from '@/components/landing-page'

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Summa AI — Adaptive Learning Companion",
  description: "Summa AI remembers what you know, what you missed, when your exams are due, and how you learn best. Start learning for free.",
}


export default function HomePage() {
  const router = useRouter()
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem('summa-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored ? stored === 'dark' : prefersDark
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('summa-theme', next ? 'dark' : 'light')
  }

  return (
    <LandingPage
      onGetStarted={() => router.push('/chat')}
      isDark={isDark}
      onToggleTheme={toggleTheme}
    />
  )
}
