/**
 * PROTOTYPE — planning panel layouts in the left Backstory column.
 *
 * Question: how should climax board-evidence, per-character Ghost/Lie/Want/Need,
 * and a planning checklist sit next to the existing project Backstory spine —
 * without turning the left panel into a second dashboard?
 *
 * Switch with ?panel=A|B|C (and the floating bar when DEV).
 */

import { useState } from 'react'
import { boardCoverage } from '../../domain/boardCoverage'
import { climaxEvidence } from '../../domain/climaxEvidence'
import { getStructureTemplate } from '../../domain/structure'
import {
  EDGE_LABELS,
  NEED_OUTCOME_LABELS,
  WANT_OUTCOME_LABELS,
  type Character,
  type NeedOutcome,
  type WantOutcome,
} from '../../domain/types'
import { useProjectStore } from '../../store/projectStore'
import { useUiStore } from '../../store/uiStore'
import { CharacterPanel } from '../CharacterPanel'
import { ClimaxOutcomePanel } from '../ClimaxOutcomePanel'

export const PANEL_VARIANTS = ['A', 'B', 'C'] as const
export type PanelVariant = (typeof PANEL_VARIANTS)[number]

export const PANEL_LABELS: Record<PanelVariant, string> = {
  A: 'Evidence under climax',
  B: 'Character-first arcs',
  C: 'Checklist dock',
}

/** Replace Character + Climax blocks in Backstory tab while prototyping. */
export function PlanningPanelsOutside({ variant }: { variant: PanelVariant }) {
  if (variant === 'A') return <VariantA_EvidenceUnderClimax />
  if (variant === 'B') return <VariantB_CharacterFirst />
  return <VariantC_ChecklistDock />
}

// ─── A: keep roster simple; put evidence under climax dropdowns ─────────────

function VariantA_EvidenceUnderClimax() {
  return (
    <>
      <div style={{ borderTop: '1px solid rgba(20,22,25,0.12)' }}>
        <CharacterPanel />
      </div>
      <div style={{ borderTop: '1px solid rgba(20,22,25,0.12)' }}>
        <ClimaxWithEvidence />
      </div>
      <ProtoState label="A" note="roster simple · evidence under climax" />
    </>
  )
}

function ClimaxWithEvidence() {
  const project = useProjectStore((s) => s.project)
  const setClimaxOutcome = useProjectStore((s) => s.setClimaxOutcome)
  const openSceneEditor = useUiStore((s) => s.openSceneEditor)
  const outcome = project.climaxOutcome
  const ev = climaxEvidence(project)

  return (
    <div className="px-4 py-3" data-prototype="panel-A">
      <h2 className="font-display mb-2 text-base font-bold text-ink">
        ผลลัพธ์ตอนจบ
      </h2>
      <OutcomeSelects
        want={outcome.want}
        need={outcome.need}
        onWant={(w) => setClimaxOutcome({ want: w })}
        onNeed={(n) => setClimaxOutcome({ need: n })}
      />
      <div
        className="mt-3 rounded-md px-2.5 py-2 text-[11px]"
        style={{
          border: '1px solid rgba(20,22,25,0.12)',
          background: 'rgba(255,255,255,0.65)',
        }}
      >
        <p className="mb-1 font-semibold">หลักฐานบนกระดาน</p>
        {!ev.hasClimaxScene ? (
          <p className="text-ink/55">
            ยังไม่มีฉากบีต climax/finale/resurrection/ordeal
          </p>
        ) : (
          <ul className="space-y-1 text-ink/75">
            <li>
              ฉาก:{' '}
              {ev.climaxScenes.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ', '}
                  <button
                    type="button"
                    className="font-semibold text-[#2b7a8c] hover:underline"
                    onClick={() => openSceneEditor(s.id)}
                  >
                    {s.title}
                  </button>
                </span>
              ))}
            </li>
            <li>
              Want→ ×{ev.wantIntoClimax.length} · Need→ ×
              {ev.needIntoClimax.length} · Fail→ ×{ev.failIntoClimax.length}
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── B: character cards own Ghost/Lie/Want/Need; climax stays compact ───────

function VariantB_CharacterFirst() {
  return (
    <>
      <div style={{ borderTop: '1px solid rgba(20,22,25,0.12)' }}>
        <CharacterArcRoster />
      </div>
      <div style={{ borderTop: '1px solid rgba(20,22,25,0.12)' }}>
        <ClimaxOutcomePanel />
      </div>
      <ProtoState label="B" note="per-character arcs expand · climax unchanged" />
    </>
  )
}

const ARC_FIELDS: {
  key: keyof Pick<Character, 'ghost' | 'lie' | 'lieAtWork' | 'want' | 'need'>
  label: string
}[] = [
  { key: 'ghost', label: 'Ghost' },
  { key: 'lie', label: 'Lie' },
  { key: 'lieAtWork', label: 'Lie at Work' },
  { key: 'want', label: 'Want' },
  { key: 'need', label: 'Need' },
]

function CharacterArcRoster() {
  const characters = useProjectStore((s) => s.project.characters)
  const addCharacter = useProjectStore((s) => s.addCharacter)
  const updateCharacter = useProjectStore((s) => s.updateCharacter)
  const deleteCharacter = useProjectStore((s) => s.deleteCharacter)
  const [openId, setOpenId] = useState<string | null>(
    () => characters[0]?.id ?? null,
  )

  return (
    <div className="px-4 py-3" data-prototype="panel-B">
      <h2 className="font-display mb-1 text-base font-bold text-ink">ตัวละคร</h2>
      <p className="mb-2 text-[11px] text-ink/45">
        Backstory ด้านบน = แกนเรื่อง · ขยายการ์ด = แกนของคนนั้น
      </p>
      <ul className="space-y-2">
        {characters.map((c) => {
          const open = openId === c.id
          const filled = ARC_FIELDS.filter((f) => c[f.key]?.trim()).length
          return (
            <li
              key={c.id}
              className="rounded-md px-2 py-1.5"
              style={{
                border: '1px solid rgba(20,22,25,0.12)',
                background: open ? 'rgba(248,246,240,0.9)' : 'rgba(255,255,255,0.55)',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: c.color }}
                  aria-hidden
                />
                <input
                  value={c.name}
                  onChange={(e) => updateCharacter(c.id, { name: e.target.value })}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink focus:outline-none"
                />
                <button
                  type="button"
                  className="text-[11px] font-semibold text-[#2b7a8c]"
                  onClick={() => setOpenId(open ? null : c.id)}
                >
                  {open ? 'ย่อ' : filled ? `แกน ${filled}` : 'แกน'}
                </button>
                <button
                  type="button"
                  className="text-xs text-rust"
                  onClick={() => deleteCharacter(c.id)}
                >
                  ลบ
                </button>
              </div>
              {open && (
                <div className="mt-2 space-y-1 border-t pt-2" style={{ borderColor: 'rgba(20,22,25,0.1)' }}>
                  {ARC_FIELDS.map((f) => (
                    <label key={f.key} className="block text-[10px] text-ink/50">
                      {f.label}
                      <textarea
                        rows={2}
                        value={c[f.key] ?? ''}
                        onChange={(e) =>
                          updateCharacter(c.id, { [f.key]: e.target.value })
                        }
                        className="mt-0.5 w-full rounded bg-white px-1.5 py-1 text-[12px] text-ink"
                        style={{ border: '1px solid rgba(20,22,25,0.15)' }}
                      />
                    </label>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        className="mt-2 w-full rounded py-1.5 text-sm text-ink/60"
        style={{ border: '1px dashed rgba(20,22,25,0.25)' }}
        onClick={() => {
          const c = addCharacter()
          setOpenId(c.id)
        }}
      >
        + เพิ่มตัวละคร
      </button>
    </div>
  )
}

// ─── C: compact climax+roster + sticky checklist of empty beats/bands ───────

function VariantC_ChecklistDock() {
  const project = useProjectStore((s) => s.project)
  const template = getStructureTemplate(project.structureTemplateId)
  const coverage = boardCoverage(project.scenes, template)
  const ev = climaxEvidence(project)

  return (
    <>
      <div style={{ borderTop: '1px solid rgba(20,22,25,0.12)' }}>
        <CharacterPanel />
      </div>
      <div style={{ borderTop: '1px solid rgba(20,22,25,0.12)' }}>
        <ClimaxOutcomePanel />
      </div>
      <div
        className="px-4 py-3"
        style={{ borderTop: '1px solid rgba(20,22,25,0.12)' }}
        data-prototype="panel-C"
      >
        <h2 className="font-display mb-2 text-base font-bold text-ink">ตรวจแผน</h2>
        <p className="mb-2 text-[11px] text-ink/50">
          {template.name} · ฉาก {project.scenes.length} · คำเตือน{' '}
          {coverage.scenesWithWarnings}
        </p>
        <p className="text-[11px] font-semibold">
          บีตว่าง {coverage.emptyBeats.length}
        </p>
        <ul className="mb-2 flex flex-wrap gap-1">
          {coverage.emptyBeats.slice(0, 8).map((b) => (
            <li
              key={b.key}
              className="rounded bg-sand/30 px-1.5 py-0.5 text-[10px]"
            >
              {b.label}
            </li>
          ))}
          {coverage.emptyBeats.length > 8 && (
            <li className="text-[10px] text-ink/40">
              +{coverage.emptyBeats.length - 8}
            </li>
          )}
        </ul>
        <p className="text-[11px] font-semibold">
          ช่วงว่าง {coverage.emptyBandIndexes.length}
        </p>
        <ul className="mb-2 text-[11px] text-ink/65">
          {coverage.emptyBandIndexes.map((i) => (
            <li key={i}>· {template.bands[i].label}</li>
          ))}
          {coverage.emptyBandIndexes.length === 0 && (
            <li className="text-mint-deep">ครบทุกช่วง</li>
          )}
        </ul>
        <p className="text-[11px] text-ink/60">
          หลักฐาน climax:{' '}
          {ev.hasClimaxScene
            ? `${ev.climaxScenes.length} ฉาก · เส้น ${EDGE_LABELS.expected_want_path.slice(0, 4)}… ×${ev.wantIntoClimax.length + ev.needIntoClimax.length + ev.failIntoClimax.length}`
            : 'ยังไม่มี'}
        </p>
      </div>
      <ProtoState label="C" note="checklist dock under climax" />
    </>
  )
}

// ─── shared ─────────────────────────────────────────────────────────────────

function OutcomeSelects({
  want,
  need,
  onWant,
  onNeed,
}: {
  want: WantOutcome
  need: NeedOutcome
  onWant: (w: WantOutcome) => void
  onNeed: (n: NeedOutcome) => void
}) {
  return (
    <>
      <label className="mb-2 block text-[13px] text-ink/60">
        Want (Climax)
        <select
          className="mt-1 w-full rounded bg-white px-2 py-1 text-sm"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          value={want}
          onChange={(e) => onWant(e.target.value as WantOutcome)}
        >
          {(Object.keys(WANT_OUTCOME_LABELS) as WantOutcome[]).map((w) => (
            <option key={w} value={w}>
              {WANT_OUTCOME_LABELS[w]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[13px] text-ink/60">
        Need (Character Arc)
        <select
          className="mt-1 w-full rounded bg-white px-2 py-1 text-sm"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          value={need}
          onChange={(e) => onNeed(e.target.value as NeedOutcome)}
        >
          {(Object.keys(NEED_OUTCOME_LABELS) as NeedOutcome[]).map((n) => (
            <option key={n} value={n}>
              {NEED_OUTCOME_LABELS[n]}
            </option>
          ))}
        </select>
      </label>
    </>
  )
}

function ProtoState({ label, note }: { label: string; note: string }) {
  return (
    <p className="px-4 pb-2 text-[9px] text-ink/30">
      PROTOTYPE panel={label} · {note}
    </p>
  )
}
