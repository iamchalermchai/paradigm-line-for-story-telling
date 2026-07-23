import { useEffect, useMemo, useState } from 'react'
import {
  ARC_RELATION_LABELS,
  BEAT_LABELS,
  PHASE_LABELS,
  STORY_PHASES,
} from '../domain/types'
import type {
  ArcRelation,
  StoryBeatType,
  StoryPhase,
  StoryScene,
} from '../domain/types'
import { validateScene } from '../domain/validation'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'

const ARC_RELATIONS: ArcRelation[] = [
  'neutral',
  'ghost',
  'lie',
  'lie_at_work',
  'want',
  'need',
]

const BEAT_TYPES: StoryBeatType[] = [
  'catalyst',
  'want',
  'progress',
  'warning',
  'midpoint',
  'low_point',
  'ghost',
  'aha',
  'choice',
  'climax',
  'ending',
]

export function SceneEditorDrawer() {
  const editingSceneId = useUiStore((s) => s.editingSceneId)
  const closeSceneEditor = useUiStore((s) => s.closeSceneEditor)
  const scenes = useProjectStore((s) => s.project.scenes)
  const updateScene = useProjectStore((s) => s.updateScene)
  const duplicateScene = useProjectStore((s) => s.duplicateScene)
  const deleteScene = useProjectStore((s) => s.deleteScene)

  const scene = scenes.find((s) => s.id === editingSceneId) ?? null
  const [draft, setDraft] = useState<StoryScene | null>(scene)

  // Reset the draft whenever a different scene is opened.
  useEffect(() => {
    setDraft(scene ? { ...scene } : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSceneId])

  const others = useMemo(
    () => scenes.filter((s) => s.id !== editingSceneId),
    [scenes, editingSceneId],
  )
  const warnings = useMemo(
    () => (draft ? validateScene(draft, others) : []),
    [draft, others],
  )

  if (!editingSceneId || !draft) return null

  function set<K extends keyof StoryScene>(key: K, value: StoryScene[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d))
  }

  function save() {
    if (!draft) return
    const { id, ...patch } = draft
    updateScene(id, patch)
    closeSceneEditor()
  }

  return (
    <aside
      className="flex w-96 shrink-0 flex-col bg-white shadow-xl"
      style={{ borderLeft: '1px solid rgba(20,22,25,0.18)' }}
      role="dialog"
      aria-label={`แก้ไขฉาก: ${draft.title}`}
    >
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(20,22,25,0.15)' }}
      >
        <h2 className="text-sm font-bold text-ink">แก้ไขฉาก</h2>
        <button
          type="button"
          className="rounded p-1 text-ink/40 hover:bg-sand/30 hover:text-ink"
          aria-label="ปิด"
          onClick={closeSceneEditor}
        >
          ✕
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {/* Character + Action = Plot */}
        <div className="mb-4 rounded-lg bg-sand/30 p-3">
          <p className="text-center text-xs font-bold tracking-wide text-ink/70">
            Character + Action = Plot
          </p>
        </div>

        <Text label="ชื่อฉาก" value={draft.title} onChange={(v) => set('title', v)} />
        <Text
          label="สถานที่"
          value={draft.location}
          onChange={(v) => set('location', v)}
        />
        <Text
          label="ตัวละคร (คั่นด้วยจุลภาค)"
          value={draft.characters.join(', ')}
          onChange={(v) =>
            set(
              'characters',
              v
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
        <Text
          label="ตัวละครผู้ลงมือ (POV)"
          value={draft.povCharacter ?? ''}
          onChange={(v) => set('povCharacter', v || undefined)}
        />
        <Area
          label="ตัวละครต้องการอะไร (เป้าหมายในฉาก)"
          value={draft.characterGoal}
          onChange={(v) => set('characterGoal', v)}
        />
        <Area
          label="ตัวละครทำอะไร (การกระทำ)"
          value={draft.action}
          onChange={(v) => set('action', v)}
        />
        <Area
          label="อะไรขัดขวาง (อุปสรรค)"
          value={draft.obstacle}
          onChange={(v) => set('obstacle', v)}
        />
        <Area
          label="ผลลัพธ์คืออะไร"
          value={draft.outcome}
          onChange={(v) => set('outcome', v)}
        />
        <Area
          label="หลังฉากนี้มีอะไรเปลี่ยน"
          value={draft.changeAfterScene}
          onChange={(v) => set('changeAfterScene', v)}
        />

        <div className="grid grid-cols-2 gap-2">
          <Select
            label="ช่วงของเรื่อง"
            value={draft.phase}
            options={STORY_PHASES.map((p) => [p, PHASE_LABELS[p]])}
            onChange={(v) => set('phase', v as StoryPhase)}
          />
          <Select
            label="Story Beat"
            value={draft.beat ?? ''}
            options={[
              ['', '— ไม่มี —'],
              ...BEAT_TYPES.map((b) => [b, BEAT_LABELS[b]] as [string, string]),
            ]}
            onChange={(v) => set('beat', (v || undefined) as StoryBeatType | undefined)}
          />
        </div>
        <Select
          label="เกี่ยวข้องกับ Ghost / Lie / Want / Need อย่างไร"
          value={draft.arcRelation}
          options={ARC_RELATIONS.map((r) => [r, ARC_RELATION_LABELS[r]])}
          onChange={(v) => set('arcRelation', v as ArcRelation)}
        />
        <Area
          label="โน้ต"
          value={draft.notes}
          onChange={(v) => set('notes', v)}
        />

        <label className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={draft.locked}
            onChange={(e) => set('locked', e.target.checked)}
          />
          ล็อกตำแหน่ง (ไม่ให้ Auto Layout ย้าย)
        </label>

        {warnings.length > 0 && (
          <ul
            className="mt-4 space-y-1 rounded-md bg-sand/25 p-3"
            style={{ border: '1px solid var(--color-sand-dark)' }}
          >
            {warnings.map((w) => (
              <li key={w.code} className="flex gap-2 text-xs text-ink">
                <span aria-hidden style={{ color: 'var(--color-rust)' }}>
                  ▲
                </span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer
        className="flex flex-wrap gap-2 px-4 py-3"
        style={{ borderTop: '1px solid rgba(20,22,25,0.15)' }}
      >
        <button
          type="button"
          className="rounded bg-ink px-3 py-1.5 text-xs font-semibold text-cream hover:bg-ink/85"
          onClick={save}
        >
          บันทึก
        </button>
        <button
          type="button"
          className="rounded px-3 py-1.5 text-xs text-ink-soft hover:bg-sand/20"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          onClick={closeSceneEditor}
        >
          ยกเลิก
        </button>
        <button
          type="button"
          className="rounded px-3 py-1.5 text-xs text-ink-soft hover:bg-sand/20"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          onClick={() => {
            const copy = duplicateScene(draft.id)
            if (copy) useUiStore.getState().openSceneEditor(copy.id)
          }}
        >
          ทำสำเนา
        </button>
        <button
          type="button"
          className="ml-auto rounded px-3 py-1.5 text-xs text-rust hover:bg-rust/10"
          style={{ border: '1px solid var(--color-rust)' }}
          onClick={() => {
            deleteScene(draft.id)
            closeSceneEditor()
          }}
        >
          ลบฉาก
        </button>
      </footer>
    </aside>
  )
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[11px] font-medium text-ink/60">
        {label}
      </span>
      <input
        className="w-full rounded px-2 py-1.5 text-xs text-ink focus:outline-none"
        style={{ border: '1px solid rgba(20,22,25,0.25)' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[11px] font-medium text-ink/60">
        {label}
      </span>
      <textarea
        className="w-full resize-y rounded px-2 py-1.5 text-xs text-ink focus:outline-none"
        style={{ border: '1px solid rgba(20,22,25,0.25)' }}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: [string, string][]
  onChange: (v: string) => void
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[11px] font-medium text-ink/60">
        {label}
      </span>
      <select
        className="w-full rounded px-2 py-1.5 text-xs text-ink focus:outline-none"
        style={{ border: '1px solid rgba(20,22,25,0.25)' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}
