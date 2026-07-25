import { useEffect, useMemo, useState } from 'react'
import {
  bandCenterFraction,
  bandIndexForX,
  beatLabel,
  BOARD_WIDTH,
  getStructureTemplate,
} from '../domain/structure'
import { ARC_RELATION_LABELS, STORY_PHASES } from '../domain/types'
import type { ArcRelation, StoryScene } from '../domain/types'
import {
  isLayeredMemory,
  LAYER_COLORS,
  LAYER_HINTS,
  LAYER_LABELS,
  LAYER_SNAP_Y,
  STORY_LAYERS,
  suggestStoryLayer,
} from '../domain/layers'
import { tellingChapters } from '../domain/telling'
import { validateScene } from '../domain/validation'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'

const FOUR_PHASE = getStructureTemplate('four-phase')

const ARC_RELATIONS: ArcRelation[] = [
  'neutral',
  'ghost',
  'lie',
  'lie_at_work',
  'want',
  'need',
]

export function SceneEditorDrawer() {
  const editingSceneId = useUiStore((s) => s.editingSceneId)
  const closeSceneEditor = useUiStore((s) => s.closeSceneEditor)
  const scenes = useProjectStore((s) => s.project.scenes)
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const chapterOrder = useProjectStore((s) => s.project.tellingChapterOrder)
  const roster = useProjectStore((s) => s.project.characters)
  const backstory = useProjectStore((s) => s.project.backstory)
  const updateScene = useProjectStore((s) => s.updateScene)
  const duplicateScene = useProjectStore((s) => s.duplicateScene)
  const deleteScene = useProjectStore((s) => s.deleteScene)

  const template = getStructureTemplate(structureId)
  const layered = isLayeredMemory(structureId)
  const chapters = tellingChapters(scenes, chapterOrder)

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
    () => (draft ? validateScene(draft, others, template) : []),
    [draft, others, template],
  )

  if (!editingSceneId || !draft) return null

  function set<K extends keyof StoryScene>(key: K, value: StoryScene[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d))
  }

  function toggleCharacter(name: string) {
    setDraft((d) => {
      if (!d) return d
      const has = d.characters.includes(name)
      return {
        ...d,
        characters: has
          ? d.characters.filter((c) => c !== name)
          : [...d.characters, name],
      }
    })
  }

  // Move the scene into the chosen band: recentre its x on that band and keep
  // the legacy 4-phase shadow in sync with the new x.
  function moveToBand(bandIndex: number) {
    setDraft((d) => {
      if (!d) return d
      const x = bandCenterFraction(bandIndex, template) * BOARD_WIDTH
      const phase = STORY_PHASES[bandIndexForX(x / BOARD_WIDTH, FOUR_PHASE)]
      return { ...d, position: { ...d.position, x }, phase }
    })
  }

  const currentBand = bandIndexForX(draft.position.x / BOARD_WIDTH, template)

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
        <h2 className="font-display text-lg font-bold text-ink">แก้ไขฉาก</h2>
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
          <p className="font-display text-center text-base font-bold tracking-wide text-ink/80">
            Character + Action = Plot
          </p>
        </div>

        <Text label="ชื่อฉาก" value={draft.title} onChange={(v) => set('title', v)} />
        <Text
          label="สถานที่"
          value={draft.location}
          onChange={(v) => set('location', v)}
        />
        <div className="mb-3">
          <span className="mb-1 block text-[11px] font-medium text-ink/60">
            ตัวละครในฉาก
          </span>
          {roster.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {roster.map((c) => {
                const on = draft.characters.includes(c.name)
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleCharacter(c.name)}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                    style={{
                      border: `1px solid ${on ? c.color : 'rgba(20,22,25,0.2)'}`,
                      background: on ? `${c.color}22` : 'transparent',
                      color: 'var(--color-ink)',
                    }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: c.color }}
                      aria-hidden
                    />
                    {c.name}
                  </button>
                )
              })}
            </div>
          )}
          <input
            className="w-full rounded px-2 py-1.5 text-xs text-ink focus:outline-none"
            style={{ border: '1px solid rgba(20,22,25,0.25)' }}
            value={draft.characters.join(', ')}
            aria-label="ตัวละคร (คั่นด้วยจุลภาค)"
            placeholder="หรือพิมพ์ชื่อเอง คั่นด้วยจุลภาค"
            onChange={(e) =>
              set(
                'characters',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </div>
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
        <div
          className="space-y-2 rounded px-2.5 py-2"
          style={{
            border: '1px solid rgba(20,22,25,0.16)',
            background: 'rgba(20,22,25,0.03)',
          }}
        >
          <p className="font-display text-[12px] font-bold text-ink">
            แรงต้านในฉาก
          </p>
          <p className="text-[10px] leading-snug text-ink/50">
            นอก = คน/สถานการณ์ที่ขัดขา · ใน = ความกลัวหรือ Lie ที่ถ่วงในฉากนี้
            (ไม่ใช่ Ghost/Want ทั้งเรื่อง — อันนั้นอยู่แท็บ Backstory)
          </p>
          <Area
            label="อะไรขัดขวางภายนอก"
            value={draft.obstacle}
            onChange={(v) => set('obstacle', v)}
          />
          <Area
            label="อะไรขัดข้างใน (internal conflict)"
            value={draft.internalConflict}
            onChange={(v) => set('internalConflict', v)}
          />
        </div>
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
            label={`ช่วงของเรื่อง (${template.name})`}
            value={String(currentBand)}
            options={template.bands.map((b, i) => [String(i), b.label])}
            onChange={(v) => moveToBand(Number(v))}
          />
          <Select
            label={`Story Beat (${template.name})`}
            value={draft.beat ?? ''}
            options={[
              ['', '— ไม่มี —'],
              ...template.beats.map((b) => [b.key, b.label] as [string, string]),
              // A tag kept from another structure stays selectable, so opening
              // the editor cannot silently drop it.
              ...(draft.beat && !template.beats.some((b) => b.key === draft.beat)
                ? [
                    [
                      draft.beat,
                      `${beatLabel(draft.beat)} (จากโครงสร้างอื่น)`,
                    ] as [string, string],
                  ]
                : []),
            ]}
            onChange={(v) => set('beat', v || undefined)}
          />
        </div>
        <Select
          label="แท็กเส้น Ghost / Lie / Want / Need (ฉากนี้แตะเส้นไหน)"
          value={draft.arcRelation}
          options={ARC_RELATIONS.map((r) => [r, ARC_RELATION_LABELS[r]])}
          onChange={(v) => set('arcRelation', v as ArcRelation)}
        />
        {layered && (
          <div
            className="space-y-2 rounded px-2.5 py-2"
            style={{
              border: '1px solid rgba(61,77,236,0.25)',
              background: 'rgba(61,77,236,0.05)',
            }}
          >
            <p className="font-display text-[12px] font-bold text-ink">
              เลนบนกระดาน (layered-memory)
            </p>
            <div className="flex flex-wrap gap-1">
              {STORY_LAYERS.map((layer) => (
                <button
                  key={layer}
                  type="button"
                  className="rounded px-2 py-1 text-[11px] font-semibold"
                  style={{
                    background:
                      draft.storyLayer === layer ? LAYER_COLORS[layer] : 'white',
                    color:
                      draft.storyLayer === layer ? '#f8f6f0' : 'var(--color-ink-soft)',
                    border: `1px solid ${
                      draft.storyLayer === layer
                        ? LAYER_COLORS[layer]
                        : 'rgba(20,22,25,0.25)'
                    }`,
                  }}
                  onClick={() => {
                    set('storyLayer', layer)
                    set('position', {
                      ...draft.position,
                      y: LAYER_SNAP_Y[layer],
                    })
                  }}
                >
                  {LAYER_LABELS[layer]}
                </button>
              ))}
            </div>
            <p className="text-[10px] leading-snug text-ink/50">
              {LAYER_HINTS[draft.storyLayer]} · CHARACTER = ค่าเริ่มต้น (การ์ดไม่โชว์ชิป)
            </p>
            <p className="text-[10px] text-ink/45">
              แนะนำ:{' '}
              {suggestStoryLayer(draft, backstory, roster).reason}
            </p>
          </div>
        )}
        <Select
          label="บทการเล่า (จัดลำดับด้วยการลากในแผงซ้าย โหมด “ลำดับเล่า”)"
          value={draft.tellingChapter ?? ''}
          options={[
            ['', '— ไม่กำหนด —'],
            ...chapters.map((c) => [c.key, `บท ${c.letter}`] as [string, string]),
          ]}
          onChange={(v) => set('tellingChapter', v || undefined)}
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
