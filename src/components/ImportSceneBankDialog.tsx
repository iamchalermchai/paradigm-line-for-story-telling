import { useState } from 'react'
import { PHASE_WIDTH } from '../domain/seed'
import {
  ABOVE_LINE_RELATIONS,
  ARC_RELATION_LABELS,
  PARADIGM_LINE_Y,
  PHASE_LABELS,
  STORY_PHASES,
} from '../domain/types'
import type { Backstory } from '../domain/types'
import type { SceneSuggestion } from '../import/AIParserAdapter'
import { mockParser } from '../import/mockParser'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { Modal } from './Modal'

type Step = 'paste' | 'review'

const BACKSTORY_LABELS: Record<keyof Backstory, string> = {
  ghost: 'Ghost',
  lie: 'Lie',
  lieAtWork: 'Lie at Work',
  want: 'Want',
  need: 'Need',
}

export function ImportSceneBankDialog() {
  const open = useUiStore((s) => s.dialog === 'import-scene-bank')
  const closeDialog = useUiStore((s) => s.closeDialog)
  const addScene = useProjectStore((s) => s.addScene)
  const updateBackstory = useProjectStore((s) => s.updateBackstory)
  const currentBackstory = useProjectStore((s) => s.project.backstory)

  const [step, setStep] = useState<Step>('paste')
  const [rawText, setRawText] = useState('')
  const [suggestions, setSuggestions] = useState<SceneSuggestion[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [backstory, setBackstory] = useState<Partial<Backstory>>({})
  const [parsing, setParsing] = useState(false)

  if (!open) return null

  function resetAndClose() {
    setStep('paste')
    setRawText('')
    setSuggestions([])
    setSelected(new Set())
    setBackstory({})
    closeDialog()
  }

  async function handleParse() {
    setParsing(true)
    const result = await mockParser.parse(rawText)
    setSuggestions(result.scenes)
    setBackstory(result.backstory)
    setSelected(new Set(result.scenes.map((s) => s.id)))
    setStep('review')
    setParsing(false)
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function editTitle(id: string, title: string) {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s)),
    )
  }

  function remove(id: string) {
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function mergeSelected() {
    const chosen = suggestions.filter((s) => selected.has(s.id))
    if (chosen.length < 2) return
    const [first, ...rest] = chosen
    const merged: SceneSuggestion = {
      ...first,
      title: first.title,
      action: chosen.map((s) => s.action).join('\n'),
      sourceRange: [
        Math.min(...chosen.map((s) => s.sourceRange[0])),
        Math.max(...chosen.map((s) => s.sourceRange[1])),
      ],
    }
    const restIds = new Set(rest.map((s) => s.id))
    setSuggestions((prev) =>
      prev
        .filter((s) => !restIds.has(s.id))
        .map((s) => (s.id === first.id ? merged : s)),
    )
    setSelected((prev) => {
      const next = new Set(prev)
      restIds.forEach((id) => next.delete(id))
      return next
    })
  }

  function splitSuggestion(id: string) {
    setSuggestions((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx < 0) return prev
      const s = prev[idx]
      const lines = s.action.split('\n')
      if (lines.length < 2) return prev
      const mid = Math.ceil(lines.length / 2)
      const a = { ...s, action: lines.slice(0, mid).join('\n') }
      const b: SceneSuggestion = {
        ...s,
        id: `${s.id}-b`,
        title: `${s.title} (2)`,
        action: lines.slice(mid).join('\n'),
      }
      const next = [...prev]
      next.splice(idx, 1, a, b)
      return next
    })
  }

  function confirmImport() {
    // Phase-aware placement: stack new cards within their phase column.
    const rowByPhase = new Map<string, number>()
    for (const s of suggestions) {
      if (!selected.has(s.id)) continue
      const phaseIndex = STORY_PHASES.indexOf(s.phase)
      const row = rowByPhase.get(s.phase) ?? 0
      rowByPhase.set(s.phase, row + 1)
      const above = ABOVE_LINE_RELATIONS.includes(s.arcRelation)
      addScene({
        title: s.title,
        location: s.location,
        characters: s.characters,
        characterGoal: s.characterGoal,
        action: s.action,
        obstacle: s.obstacle,
        outcome: s.outcome,
        changeAfterScene: s.changeAfterScene,
        phase: s.phase,
        beat: s.beat,
        arcRelation: s.arcRelation,
        position: {
          x: phaseIndex * PHASE_WIDTH + 60,
          y: above
            ? PARADIGM_LINE_Y - 300 - row * 130
            : PARADIGM_LINE_Y + 160 + row * 130,
        },
      })
    }

    // Fill only empty backstory fields — never overwrite existing text.
    const fill: Partial<Backstory> = {}
    for (const key of Object.keys(backstory) as (keyof Backstory)[]) {
      const value = backstory[key]
      if (value && !currentBackstory[key]) fill[key] = value
    }
    if (Object.keys(fill).length > 0) updateBackstory(fill)

    resetAndClose()
  }

  const selectedCount = suggestions.filter((s) => selected.has(s.id)).length
  const backstoryToFill = (Object.keys(backstory) as (keyof Backstory)[]).filter(
    (k) => backstory[k] && !currentBackstory[k],
  )

  return (
    <Modal title="นำเข้า Scene Bank" onClose={resetAndClose} wide>
      {step === 'paste' ? (
        <div>
          <p className="mb-2 text-xs text-ink/55">
            วางข้อความเรื่องราว (ไทยหรืออังกฤษ) ระบบจะแยกเป็นฉากให้ตรวจสอบก่อนเพิ่มลงกระดาน
            — จะไม่เขียนทับข้อมูลเดิมของคุณ
          </p>
          <textarea
            className="h-64 w-full resize-y rounded p-3 text-sm text-ink focus:outline-none"
            style={{ border: '1px solid rgba(20,22,25,0.25)' }}
            placeholder="วาง Scene Bank ที่นี่…"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            aria-label="ข้อความ Scene Bank"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="rounded px-3 py-1.5 text-sm text-ink-soft hover:bg-sand/20"
              style={{ border: '1px solid rgba(20,22,25,0.25)' }}
              onClick={resetAndClose}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="rounded bg-ink px-3 py-1.5 text-sm font-semibold text-cream hover:bg-ink/85 disabled:opacity-50"
              onClick={handleParse}
              disabled={!rawText.trim() || parsing}
            >
              {parsing ? 'กำลังวิเคราะห์…' : 'วิเคราะห์'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink/55">
              พบ {suggestions.length} ฉาก · เลือก {selectedCount}
            </span>
            <button
              type="button"
              className="rounded px-2 py-1 text-xs text-ink-soft hover:bg-sand/20 disabled:opacity-40"
              style={{ border: '1px solid rgba(20,22,25,0.25)' }}
              onClick={mergeSelected}
              disabled={selectedCount < 2}
            >
              รวมฉากที่เลือก
            </button>
            <button
              type="button"
              className="ml-auto text-xs text-[color:var(--color-indigo)] hover:underline"
              onClick={() => setStep('paste')}
            >
              ← กลับไปแก้ข้อความ
            </button>
          </div>

          {backstoryToFill.length > 0 && (
            <div
              className="mb-3 rounded p-2 text-xs text-ink"
              style={{ border: '1px solid var(--color-mint-deep)', background: 'rgba(47,156,108,0.08)' }}
            >
              จะเติม Backstory ที่ยังว่างให้:{' '}
              {backstoryToFill.map((k) => BACKSTORY_LABELS[k]).join(', ')}
            </div>
          )}

          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="rounded p-2"
                style={{ border: '1px solid rgba(20,22,25,0.18)' }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    aria-label={`เลือก ${s.title}`}
                  />
                  <input
                    className="flex-1 rounded px-2 py-1 text-sm text-ink"
                    style={{ border: '1px solid rgba(20,22,25,0.18)' }}
                    value={s.title}
                    onChange={(e) => editTitle(s.id, e.target.value)}
                    aria-label="ชื่อฉาก"
                  />
                  <button
                    type="button"
                    className="rounded px-2 py-1 text-xs text-ink/45 hover:bg-sand/20"
                    onClick={() => splitSuggestion(s.id)}
                    title="แยกฉาก"
                  >
                    แยก
                  </button>
                  <button
                    type="button"
                    className="rounded px-2 py-1 text-xs text-rust hover:bg-rust/10"
                    onClick={() => remove(s.id)}
                  >
                    ลบ
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 pl-6 text-[11px] text-ink/55">
                  <span className="rounded bg-sand/30 px-1.5 py-0.5">
                    {PHASE_LABELS[s.phase]}
                  </span>
                  <span className="rounded bg-sand/30 px-1.5 py-0.5">
                    {ARC_RELATION_LABELS[s.arcRelation]}
                  </span>
                  <span>ความมั่นใจ {Math.round(s.confidence * 100)}%</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded px-3 py-1.5 text-sm text-ink-soft hover:bg-sand/20"
              style={{ border: '1px solid rgba(20,22,25,0.25)' }}
              onClick={resetAndClose}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="rounded px-3 py-1.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-mint-deep)' }}
              onClick={confirmImport}
              disabled={selectedCount === 0}
            >
              เพิ่ม {selectedCount} ฉากลงกระดาน
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
