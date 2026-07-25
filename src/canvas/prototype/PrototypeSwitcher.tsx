import { useEffect } from 'react'

/**
 * PROTOTYPE ONLY — floating bar to cycle ?variant= on the board chrome studies.
 * Gated by the caller to import.meta.env.DEV.
 */
export function PrototypeSwitcher({
  variants,
  current,
  labels,
  onChange,
}: {
  variants: string[]
  current: string
  labels: Record<string, string>
  onChange: (key: string) => void
}) {
  const idx = Math.max(0, variants.indexOf(current))

  function step(delta: number) {
    const next = variants[(idx + delta + variants.length) % variants.length]
    onChange(next)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      ) {
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        step(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        step(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold text-cream shadow-lg"
      style={{ background: '#141619', border: '2px solid #e49c4e' }}
      role="group"
      aria-label="PROTOTYPE variant switcher"
    >
      <button
        type="button"
        className="rounded-full px-2 py-1 hover:bg-white/15"
        aria-label="previous variant"
        onClick={() => step(-1)}
      >
        ←
      </button>
      <span className="min-w-[200px] text-center tabular-nums">
        {current} — {labels[current] ?? 'untitled'}
      </span>
      <button
        type="button"
        className="rounded-full px-2 py-1 hover:bg-white/15"
        aria-label="next variant"
        onClick={() => step(1)}
      >
        →
      </button>
    </div>
  )
}
