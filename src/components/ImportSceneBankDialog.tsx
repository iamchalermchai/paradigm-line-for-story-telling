import { useRef, useState } from 'react'
import { PHASE_WIDTH } from '../domain/seed'
import { getStructureTemplate, templateBeat } from '../domain/structure'
import {
  ABOVE_LINE_RELATIONS,
  ARC_RELATION_LABELS,
  PARADIGM_LINE_Y,
  PHASE_LABELS,
  STORY_PHASES,
} from '../domain/types'
import type { Backstory, Project } from '../domain/types'
import type { SceneSuggestion } from '../import/AIParserAdapter'
import { mapRawToBoard, readImportFile } from '../import/mapToBoard'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { Modal } from './Modal'

type Step = 'paste' | 'review-scenes' | 'review-project'

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
  const importProject = useProjectStore((s) => s.importProject)
  const currentBackstory = useProjectStore((s) => s.project.backstory)
  const structureId = useProjectStore((s) => s.project.structureTemplateId)

  const fileInput = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('paste')
  const [rawText, setRawText] = useState('')
  const [suggestions, setSuggestions] = useState<SceneSuggestion[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [backstory, setBackstory] = useState<Partial<Backstory>>({})
  const [warnings, setWarnings] = useState<string[]>([])
  const [sourceLabel, setSourceLabel] = useState('')
  const [pendingProject, setPendingProject] = useState<Project | null>(null)
  const [parsing, setParsing] = useState(false)

  if (!open) return null

  function resetAndClose() {
    setStep('paste')
    setRawText('')
    setSuggestions([])
    setSelected(new Set())
    setBackstory({})
    setWarnings([])
    setSourceLabel('')
    setPendingProject(null)
    closeDialog()
  }

  async function handleAnalyze(text: string = rawText) {
    setParsing(true)
    const result = await mapRawToBoard(text)
    if (result.kind === 'project') {
      setPendingProject(result.project)
      setWarnings(result.warnings)
      setSourceLabel('โปรเจกต์ Plotline (JSON)')
      setStep('review-project')
      setParsing(false)
      return
    }
    setSuggestions(result.scenes)
    setBackstory(result.backstory)
    setSelected(new Set(result.scenes.map((s) => s.id)))
    setWarnings(result.warnings)
    setSourceLabel(
      result.source === 'json' ? 'แมปจาก JSON' : 'แยกจากข้อความ',
    )
    setStep('review-scenes')
    setParsing(false)
  }

  async function handleFile(file: File) {
    try {
      const text = await readImportFile(file)
      setRawText(text)
      await handleAnalyze(text)
    } catch {
      setWarnings(['อ่านไฟล์ไม่สำเร็จ'])
    }
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

  function confirmScenes() {
    const template = getStructureTemplate(structureId)
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
        beat: templateBeat(template, s.beat) ? s.beat : undefined,
        arcRelation: s.arcRelation,
        position: {
          x: phaseIndex * PHASE_WIDTH + 60,
          y: above
            ? PARADIGM_LINE_Y - 300 - row * 130
            : PARADIGM_LINE_Y + 160 + row * 130,
        },
      })
    }

    const fill: Partial<Backstory> = {}
    for (const key of Object.keys(backstory) as (keyof Backstory)[]) {
      const value = backstory[key]
      if (value && !currentBackstory[key]) fill[key] = value
    }
    if (Object.keys(fill).length > 0) updateBackstory(fill)

    resetAndClose()
  }

  function confirmProject() {
    if (!pendingProject) return
    importProject(pendingProject)
    resetAndClose()
  }

  const selectedCount = suggestions.filter((s) => selected.has(s.id)).length
  const backstoryToFill = (Object.keys(backstory) as (keyof Backstory)[]).filter(
    (k) => backstory[k] && !currentBackstory[k],
  )

  return (
    <Modal title="นำเข้าสู่กระดาน" onClose={resetAndClose} wide>
      {step === 'paste' && (
        <div>
          <p className="mb-2 text-xs leading-snug text-ink/55">
            วางข้อความ หรือ JSON — ระบบจะพยายามแมปเป็นฉากบนกระดาน
            (โปรเจกต์ Plotline เต็มรูปแบบจะถามก่อนแทนที่ทั้งหมด)
          </p>
          <textarea
            className="h-56 w-full resize-y rounded p-3 text-sm text-ink focus:outline-none"
            style={{ border: '1px solid rgba(20,22,25,0.25)' }}
            placeholder={
              'วางข้อความเรื่อง / Scene Bank / JSON…\n\nตัวอย่าง JSON:\n[\n  { "title": "ฉากเปิด", "action": "…" },\n  { "title": "จุดพลิก", "summary": "…" }\n]'
            }
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            aria-label="ข้อความหรือ JSON ที่จะนำเข้า"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded px-3 py-1.5 text-sm text-ink hover:bg-sand/25"
              style={{ border: '1px solid rgba(20,22,25,0.25)' }}
              onClick={() => fileInput.current?.click()}
            >
              เลือกไฟล์…
            </button>
            <span className="text-[11px] text-ink/40">.json · .txt · .md</span>
            <div className="ml-auto flex gap-2">
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
                onClick={() => void handleAnalyze()}
                disabled={!rawText.trim() || parsing}
              >
                {parsing ? 'กำลังแมป…' : 'วิเคราะห์ / แมป'}
              </button>
            </div>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".json,.txt,.md,application/json,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />
        </div>
      )}

      {step === 'review-project' && pendingProject && (
        <div>
          <p className="mb-2 text-xs text-ink/60">
            พบโปรเจกต์ Plotline Board — การนำเข้าจะแทนที่งานปัจจุบันทั้งหมด
          </p>
          <div
            className="rounded p-3 text-sm text-ink"
            style={{ border: '1px solid rgba(20,22,25,0.18)', background: 'rgba(20,22,25,0.03)' }}
          >
            <div className="font-display font-bold">{pendingProject.title}</div>
            <div className="mt-1 text-xs text-ink/55">
              {pendingProject.scenes.length} ฉาก · {pendingProject.beats.length}{' '}
              หมุด · โครง {pendingProject.structureTemplateId}
            </div>
          </div>
          {warnings.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs text-rust">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="text-xs text-[color:var(--color-indigo)] hover:underline"
              onClick={() => setStep('paste')}
            >
              ← กลับ
            </button>
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
              className="rounded bg-rust px-3 py-1.5 text-sm font-semibold text-cream hover:opacity-90"
              onClick={confirmProject}
            >
              แทนที่โปรเจกต์
            </button>
          </div>
        </div>
      )}

      {step === 'review-scenes' && (
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink/55">
              {sourceLabel} · พบ {suggestions.length} ฉาก · เลือก {selectedCount}
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

          {warnings.length > 0 && (
            <ul
              className="mb-3 list-disc rounded px-5 py-2 text-xs text-ink/70"
              style={{ background: 'rgba(228,156,78,0.12)' }}
            >
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}

          {backstoryToFill.length > 0 && (
            <div
              className="mb-3 rounded p-2 text-xs text-ink"
              style={{
                border: '1px solid var(--color-mint-deep)',
                background: 'rgba(47,156,108,0.08)',
              }}
            >
              จะเติม Backstory ที่ยังว่างให้:{' '}
              {backstoryToFill.map((k) => BACKSTORY_LABELS[k]).join(', ')}
            </div>
          )}

          {suggestions.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/50">
              ยังไม่มีฉากที่แมปได้ — กลับไปแก้ข้อความหรือลองรูปแบบอื่น
            </p>
          ) : (
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
                  {s.action && (
                    <p className="mt-1 line-clamp-2 pl-6 text-[11px] text-ink/50">
                      {s.action}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

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
              onClick={confirmScenes}
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
