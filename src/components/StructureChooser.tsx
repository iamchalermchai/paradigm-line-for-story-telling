import { useState } from 'react'
import {
  DEFAULT_STRUCTURE_ID,
  STRUCTURE_TEMPLATES,
  type StructureTemplate,
} from '../domain/structure'
import { useProjectStore } from '../store/projectStore'
import { Modal } from './Modal'

const DISMISS_KEY = 'plotline-board:structure-chooser-dismissed'

function wasDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function dismiss(): void {
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // sessionStorage may be unavailable; local state still closes the modal.
  }
}

/**
 * First-run chooser for an empty board. Offers every structure once per session;
 * dismissed via pick or skip. Never writes into project JSON — returning users
 * with saved scenes are never interrupted.
 */
export function StructureChooser() {
  const scenes = useProjectStore((s) => s.project.scenes)
  const setStructureTemplate = useProjectStore((s) => s.setStructureTemplate)
  const [open, setOpen] = useState(() => !wasDismissed())

  const empty = scenes.length === 0
  if (!empty || !open) return null

  function pick(id: string) {
    setStructureTemplate(id)
    dismiss()
    setOpen(false)
  }

  function skip() {
    // Ensure the default structure's markers are on the line (empty projects
    // start with beats: []).
    setStructureTemplate(DEFAULT_STRUCTURE_ID)
    dismiss()
    setOpen(false)
  }

  return (
    <Modal title="เลือกโครงเรื่อง" onClose={skip} wide>
      <p className="mb-4 text-sm leading-relaxed text-ink/70">
        โครงที่เลือกจะวางหมุด Beat ลงบนเส้นและแบ่งช่วงกระดานให้ — เปลี่ยนทีหลังได้ที่แผง
        &ldquo;โครงสร้าง&rdquo; มุมซ้ายบน
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {STRUCTURE_TEMPLATES.map((t) => (
          <ChooserCard key={t.id} template={t} onPick={() => pick(t.id)} />
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="rounded px-3 py-1.5 text-sm text-ink/60 hover:bg-sand/30 hover:text-ink"
          onClick={skip}
        >
          ข้าม ใช้ {STRUCTURE_TEMPLATES.find((t) => t.id === DEFAULT_STRUCTURE_ID)?.name ?? '4 Phase'}{' '}
          ไปก่อน
        </button>
      </div>
    </Modal>
  )
}

function ChooserCard({
  template,
  onPick,
}: {
  template: StructureTemplate
  onPick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="rounded-md bg-white/80 px-3 py-2.5 text-left transition-colors hover:bg-white"
      style={{ border: '1px solid rgba(20,22,25,0.14)' }}
    >
      <h3 className="font-display text-base font-bold text-ink">{template.name}</h3>
      <div className="mt-1.5 mb-2 flex h-2 overflow-hidden rounded-sm bg-ink/5" aria-hidden>
        {template.bands.map((band, i) => {
          const end = template.bands[i + 1]?.start ?? 1
          return (
            <span
              key={band.label}
              style={{
                flexGrow: end - band.start,
                flexBasis: 0,
                borderLeft: i === 0 ? undefined : '1px solid rgba(20,22,25,0.22)',
                background:
                  i % 2 === 0 ? 'rgba(20,22,25,0.08)' : 'rgba(205,80,66,0.12)',
              }}
            />
          )
        })}
      </div>
      <p className="text-[12px] leading-snug text-ink/55">{template.description}</p>
      <p className="mt-1.5 text-[12px] leading-snug text-ink/75">
        <span className="font-semibold text-ink">เริ่มที่นี่ · </span>
        {template.startHere}
      </p>
    </button>
  )
}
