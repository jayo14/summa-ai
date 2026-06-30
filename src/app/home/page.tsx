'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LandingPage } from '@/components/landing-page'

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
      onGetStarted={() => router.push('/')}
      isDark={isDark}
      onToggleTheme={toggleTheme}
    />
  )
}
