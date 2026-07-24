import { useUiStore, type ViewMode } from '../store/uiStore'

const MODES: { key: ViewMode; label: string }[] = [
  { key: 'chronological', label: 'เวลาในเรื่อง' },
  { key: 'telling', label: 'ลำดับเล่า' },
]

/** Segmented toggle between chronological (paradigm) and telling-order views. */
export function ViewModeToggle() {
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)

  return (
    <div
      className="flex overflow-hidden rounded bg-white text-xs shadow"
      style={{ border: '1px solid rgba(20,22,25,0.18)' }}
      role="tablist"
      aria-label="มุมมองบอร์ด"
    >
      {MODES.map((m) => {
        const active = viewMode === m.key
        return (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={
              active
                ? 'bg-ink px-3 py-1.5 font-semibold text-cream'
                : 'px-3 py-1.5 text-ink-soft hover:bg-sand/30'
            }
            onClick={() => setViewMode(m.key)}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
