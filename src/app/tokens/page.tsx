'use client'

import * as React from 'react'
import { FocusRing } from '@/components/focus-ring'




const colors = [
  { name: 'Accent', var: '--summa-accent', value: '#0E7490', usage: 'Primary CTAs, active nav, ring fill, send control' },
  { name: 'Accent Hover', var: '--summa-accent-hover', value: '#0B5C73', usage: 'Hover / pressed states' },
  { name: 'Accent Foreground', var: '--summa-accent-foreground', value: '#FFFFFF', usage: 'Text on accent backgrounds' },
  { name: 'Surface', var: '--summa-surface', value: '#FFFFFF', usage: 'Primary UI surface' },
  { name: 'Surface Muted', var: '--summa-surface-muted', value: '#FAFAFA', usage: 'Secondary UI surface' },
  { name: 'Cream', var: '--summa-cream', value: '#FBF7EE', usage: 'RESERVED — SummaStudy library content only' },
  { name: 'Cream Foreground', var: '--summa-cream-foreground', value: '#1F2933', usage: 'Text on cream — 12:1 contrast' },
  { name: 'Library', var: '--summa-library', value: '#5C9E1F', usage: 'SummaStudy green — library pill/tag only' },
  { name: 'Library Foreground', var: '--summa-library-foreground', value: '#FFFFFF', usage: 'Text on library pill' },
  { name: 'Track', var: '--summa-track', value: 'oklch(0.93 0 0)', usage: 'Ring track (empty state)' },
  { name: 'Track Strong', var: '--summa-track-strong', value: 'oklch(0.88 0 0)', usage: 'Stronger ring track variant' },
]

const radii = [
  { name: 'xs', value: '4px' },
  { name: 'sm', value: '8px' },
  { name: 'md', value: '12px' },
  { name: 'lg', value: '16px' },
  { name: 'xl', value: '24px' },
  { name: '2xl', value: '28px' },
  { name: '3xl', value: '9999px' },
]

const typeScale = [
  { name: 'Caption', size: '0.75rem', lh: '1.3', weight: '500' },
  { name: 'Small', size: '0.875rem', lh: '1.4', weight: '400' },
  { name: 'Body', size: '1rem', lh: '1.5', weight: '400' },
  { name: 'H3', size: '1.25rem', lh: '1.3', weight: '600' },
  { name: 'H2', size: '1.5rem', lh: '1.25', weight: '600' },
  { name: 'H1', size: '2rem', lh: '1.2', weight: '700' },
  { name: 'Display', size: '3rem', lh: '1.1', weight: '700' },
]

function ColorSwatch({ name, var: varName, value, usage }: { name: string; var: string; value: string; usage: string }) {
  const isLight = ['#FFFFFF', '#FAFAFA', '#FBF7EE', 'oklch(0.93 0 0)', 'oklch(0.88 0 0)'].includes(value)
  const borderColor = isLight ? 'border-border' : 'border-transparent'

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div
        className={cn('mb-3 h-12 w-full rounded-lg border', borderColor)}
        style={{ backgroundColor: value }}
      />
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <code className="text-xs text-muted-foreground">{varName}</code>
        </div>
        <p className="text-xs text-muted-foreground">{usage}</p>
        <code className="block text-xs text-muted-foreground">{value}</code>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function TokensPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <header className="mb-12">
          <h1 className="text-display font-bold tracking-tight text-foreground">Design Tokens</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Summa AI token reference — colors, type, spacing, radius, and the Focus Ring component.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-summa-accent px-3 py-1 text-xs font-medium text-summa-accent-foreground">Accent: #0E7490</span>
            <span className="rounded-full bg-summa-cream px-3 py-1 text-xs font-medium text-summa-cream-foreground">Cream: #FBF7EE</span>
            <span className="rounded-full bg-summa-library px-3 py-1 text-xs font-medium text-summa-library-foreground">Library: #5C9E1F</span>
          </div>
        </header>

        {/* Colors */}
        <section className="mb-16">
          <h2 className="text-h2 font-semibold text-foreground mb-4">Color</h2>
          <p className="text-body text-muted-foreground mb-6">
            Accent-on-white contrast: <span className="font-medium text-foreground">4.62:1</span> (passes 4.5:1).<br />
            Cream-foreground on cream contrast: <span className="font-medium text-foreground">12:1</span> (passes 4.5:1).
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {colors.map((c) => (
                <ColorSwatch key={c.var} {...c} />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-h2 font-semibold text-foreground mb-4">Typography</h2>
          <p className="text-body text-muted-foreground mb-6">Figtree. Weight-driven hierarchy.</p>
          <div className="space-y-4">
            {typeScale.map((t) => (
              <div key={t.name} className="flex items-baseline gap-4 border-b border-border pb-3">
                <div className="w-24 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">{t.name}</span>
                </div>
                <div className="flex-1">
                  <span
                    style={{
                      fontSize: t.size,
                      lineHeight: t.lh,
                      fontWeight: t.weight,
                    }}
                    className="text-foreground"
                  >
                    Summa AI
                  </span>
                </div>
                <div className="w-48 text-right">
                  <code className="text-xs text-muted-foreground">{t.size} / {t.weight}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-16">
          <h2 className="text-h2 font-semibold text-foreground mb-4">Spacing</h2>
          <p className="text-body text-muted-foreground mb-6">4px base unit.</p>
          <div className="flex flex-wrap gap-3">
            {[4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64].map((px) => (
              <div key={px} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <div
                  className="h-2 rounded-full bg-summa-accent"
                  style={{ width: px }}
                />
                <code className="text-xs text-muted-foreground">{px}px</code>
              </div>
            ))}
          </div>
        </section>

        {/* Radius */}
        <section className="mb-16">
          <h2 className="text-h2 font-semibold text-foreground mb-4">Radius</h2>
          <p className="text-body text-muted-foreground mb-6">4 / 8 / 12 / 16 / 24 / 28 / 9999px.</p>
          <div className="flex flex-wrap gap-4">
            {radii.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="h-16 w-16 bg-summa-accent/10 border-2 border-summa-accent"
                  style={{ borderRadius: r.value }}
                />
                <div className="text-center">
                  <span className="block text-xs font-medium text-foreground">{r.name}</span>
                  <code className="text-xs text-muted-foreground">{r.value}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Focus Ring */}
        <section className="mb-16">
          <h2 className="text-h2 font-semibold text-foreground mb-2">Focus Ring</h2>
          <p className="text-body text-muted-foreground mb-8">
            One shape language for all measurement. Replaces linear progress bars everywhere.
            Stroke: accent. Track: light neutral. No blur, no gradients.
          </p>

          <div className="space-y-10">
            {(['sm', 'md', 'lg'] as FocusRingProps['size'][]).map((sz) => (
              <div key={sz}>
                <h3 className="text-h3 font-semibold text-foreground mb-4 capitalize">Size: {sz}</h3>
                <div className="flex flex-wrap items-end gap-8">
                  {(['active', 'complete', 'idle'] as FocusRingProps['state'][]).map((st) => {
                    const valueMap: Record<string, number> = {
                      active: sz === 'sm' ? 65 : sz === 'md' ? 42 : 78,
                      complete: 100,
                      idle: 0,
                    }
                    const labelMap: Record<string, string> = {
                      active: 'In progress',
                      complete: 'Complete',
                      idle: 'Not started',
                    }
                    return (
                      <div key={st} className="flex flex-col items-center gap-3">
                        <FocusRing
                          value={valueMap[st]}
                          size={sz}
                          state={st}
                          aria-label={`${labelMap[st]} — ${valueMap[st]}%`}
                        />
                        <div className="text-center">
                          <span className="block text-xs font-medium text-foreground capitalize">{st}</span>
                          <span className="block text-xs text-muted-foreground">{valueMap[st]}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Replacement map */}
          <div className="mt-12 rounded-xl border border-border bg-background p-6">
            <h3 className="text-h3 font-semibold text-foreground mb-4">Replacement map</h3>
            <p className="text-body text-muted-foreground mb-4">
              Every progress visualization in the app becomes this same ring at different sizes.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { from: 'Knowledge gap meters', to: 'sm | active' },
                { from: 'Quiz progress', to: 'md | active' },
                { from: 'Streak counter', to: 'sm | active' },
                { from: 'Session timer', to: 'sm | active' },
                { from: 'Onboarding step indicator', to: 'md | complete' },
                { from: 'Proficiency hexagon per-skill', to: 'sm | active/idle' },
              ].map((item) => (
                <div key={item.from} className="flex items-center justify-between rounded-lg border border-border bg-summa-surface-muted px-4 py-3">
                  <span className="text-sm text-foreground">{item.from}</span>
                  <span className="text-xs font-medium text-summa-accent">{item.to}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-border pt-8">
          <p className="text-caption text-muted-foreground">
            Summa AI Design System · Built with Figtree · Tailwind CSS v4
          </p>
        </footer>
      </div>
    </div>
  )
}
