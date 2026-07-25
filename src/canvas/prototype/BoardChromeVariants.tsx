/**
 * PROTOTYPE — board chrome variants.
 * Question: should โครงสร้าง + ชนิดเส้น live on the left with the bookmarks?
 * Switch with ?variant=A|B|C (see README.md). Not production UI.
 */

import { useState, type ReactNode } from 'react'
import { Panel } from '@xyflow/react'
import { StructureBandGuide } from '../../components/StructureBandGuide'
import {
  getStructureTemplate,
  STRUCTURE_TEMPLATES,
} from '../../domain/structure'
import { EDGE_LABELS, type EdgeType } from '../../domain/types'
import { useProjectStore } from '../../store/projectStore'
import { useUiStore, type ViewMode } from '../../store/uiStore'
import { EDGE_STYLE } from '../edges/StoryEdge'
import { BoardBookmarkRail } from '../BoardBookmarkRail'
import { EdgeLegend } from '../EdgeLegend'
import { StructurePicker } from '../StructurePicker'

export const CHROME_VARIANTS = ['A', 'B', 'C'] as const
export type ChromeVariant = (typeof CHROME_VARIANTS)[number]

export const CHROME_LABELS: Record<ChromeVariant, string> = {
  A: 'Five bookmarks',
  B: 'Tool spine',
  C: 'Top ribbon',
}

/** Outside React Flow (absolute overlays). */
export function ChromeOutside({ variant }: { variant: ChromeVariant }) {
  if (variant === 'A') return <VariantA_FiveBookmarks />
  if (variant === 'B') return <VariantB_ToolSpine />
  return <VariantC_LeanRail />
}

/** Inside React Flow (Panel children). */
export function ChromeInside({ variant }: { variant: ChromeVariant }) {
  if (variant === 'A') return null
  if (variant === 'B') return null
  return (
    <Panel position="top-left">
      <div className="ml-9 mt-1">
        <VariantC_TopRibbon />
      </div>
    </Panel>
  )
}

// ─── shared bits ────────────────────────────────────────────────────────────

function AxisBody() {
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const t = getStructureTemplate(structureId)
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-ink/45">
        {t.name}
      </p>
      <h3 className="font-display mt-0.5 text-sm font-bold italic text-ink">
        {t.axis.lineTitle}
      </h3>
      <div className="mt-2 space-y-2 text-[11px]">
        <div>
          <div className="font-display text-[13px] font-bold">↑ เหนือเส้น</div>
          <p className="text-ink/60">{t.axis.aboveHint}</p>
        </div>
        <div className="h-0 border-t-2 border-ink" aria-hidden />
        <div>
          <div className="font-display text-[13px] font-bold">↓ ใต้เส้น</div>
          <p className="text-ink/60">{t.axis.belowHint}</p>
        </div>
      </div>
    </div>
  )
}

function Tongue({
  label,
  title,
  lit,
  open,
  onClick,
  tone = 'ink',
}: {
  label: string
  title: string
  lit: boolean
  open: boolean
  onClick: () => void
  tone?: 'ink' | 'teal' | 'rust'
}) {
  const bg =
    lit || open
      ? tone === 'teal'
        ? '#2b7a8c'
        : tone === 'rust'
          ? 'var(--color-rust)'
          : 'var(--color-ink)'
      : 'var(--color-cream)'
  const fg = lit || open ? 'var(--color-cream)' : 'var(--color-ink)'
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={lit}
      aria-expanded={open}
      onClick={onClick}
      className="font-display flex h-[72px] w-[26px] items-center justify-center rounded-r-md text-[11px] font-bold shadow-sm"
      style={{
        background: bg,
        color: fg,
        border: '1px solid rgba(20,22,25,0.2)',
        borderLeft: 'none',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}
    >
      {label}
    </button>
  )
}

function Leaf({
  children,
  size = 'md',
}: {
  children: ReactNode
  size?: 'md' | 'lg'
}) {
  return (
    <div
      className="pointer-events-auto ml-0.5 flex max-h-[min(78vh,680px)] flex-col overflow-hidden rounded-r-md bg-cream/97 shadow-md"
      style={{
        width: size === 'lg' ? 304 : 232,
        border: '1px solid rgba(20,22,25,0.16)',
        borderLeft: '3px solid var(--color-rust)',
      }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">{children}</div>
    </div>
  )
}

/** Flush structure panel for bookmark leaf — no nested card chrome. */
function StructureLeafBody() {
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const setStructureTemplate = useProjectStore((s) => s.setStructureTemplate)
  const template = getStructureTemplate(structureId)

  return (
    <div className="space-y-2.5 text-xs text-ink">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-sm font-bold">โครงสร้าง</h3>
        <span className="text-[10px] text-ink/40">{template.beats.length} หมุด</span>
      </div>
      <select
        className="w-full rounded bg-white px-2 py-1.5 text-xs text-ink focus:outline-none"
        style={{ border: '1px solid rgba(20,22,25,0.25)' }}
        value={structureId}
        onChange={(e) => setStructureTemplate(e.target.value)}
        aria-label="เลือกโครงสร้างเรื่อง"
      >
        {STRUCTURE_TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Column strip — same language as the board bands */}
      <div className="flex overflow-hidden rounded" aria-label="ช่วงของเรื่อง">
        {template.bands.map((band, i) => {
          const end = template.bands[i + 1]?.start ?? 1
          return (
            <span
              key={band.label}
              className="truncate px-1 py-1.5 text-center text-[9px] leading-tight text-ink/70"
              style={{
                flexGrow: end - band.start,
                flexBasis: 0,
                background: i % 2 === 0 ? 'rgba(20,22,25,0.06)' : 'rgba(205,80,66,0.1)',
                borderLeft: i === 0 ? undefined : '1px solid rgba(20,22,25,0.18)',
              }}
              title={band.job}
            >
              {band.label}
            </span>
          )
        })}
      </div>

      <p className="leading-snug text-ink/65">{template.description}</p>
      <p className="leading-snug text-ink/80">
        <span className="font-semibold text-ink">เริ่มที่นี่ · </span>
        {template.startHere}
      </p>
      <p className="text-[10px] leading-snug text-ink/50">
        <span className="font-semibold text-ink/70">{template.axis.lineTitle}</span>
        {' · '}↑ {template.axis.aboveHint}
        {' · '}↓ {template.axis.belowHint}
      </p>

      <div
        className="space-y-1.5 border-t pt-2"
        style={{ borderColor: 'rgba(20,22,25,0.12)' }}
      >
        <p className="text-[11px] font-semibold text-ink">แต่ละช่วง · งาน / ควรใส่ / เป้า</p>
        <StructureBandGuide template={template} compact />
      </div>

      <p className="text-[10px] text-ink/40">
        สลับโครงจะวางหมุดชุดใหม่บนเส้น (เลิกทำได้)
      </p>
    </div>
  )
}

/** Flush edge picker for bookmark leaf — no nested card. */
function EdgesLeafBody() {
  const newEdgeType = useUiStore((s) => s.newEdgeType)
  const setNewEdgeType = useUiStore((s) => s.setNewEdgeType)
  const edgeTypes: EdgeType[] = [
    'actual_path',
    'expected_want_path',
    'better_outcome_path',
    'failure_path',
    'character_arc',
  ]

  return (
    <div className="space-y-2 text-xs">
      <h3 className="font-display text-sm font-bold text-ink">ชนิดเส้น</h3>
      <p className="text-[10px] text-ink/50">
        เลือกก่อนลากเชื่อมการ์ด — ชนิดที่เลือกจะใช้กับเส้นใหม่
      </p>
      <ul className="space-y-0.5">
        {edgeTypes.map((type) => {
          const style = EDGE_STYLE[type]
          const active = type === newEdgeType
          return (
            <li key={type}>
              <button
                type="button"
                className={[
                  'flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left text-[11px]',
                  active
                    ? 'bg-ink font-semibold text-cream'
                    : 'text-ink-soft hover:bg-sand/25',
                ].join(' ')}
                aria-pressed={active}
                onClick={() => setNewEdgeType(type)}
              >
                <svg width="28" height="8" aria-hidden className="shrink-0">
                  <line
                    x1="0"
                    y1="4"
                    x2="28"
                    y2="4"
                    stroke={active ? 'var(--color-cream)' : style.stroke}
                    strokeWidth="2.5"
                    strokeDasharray={style.dashed ? '5 3' : undefined}
                  />
                </svg>
                <span className="flex-1">{EDGE_LABELS[type]}</span>
                {active && <span aria-hidden>✓</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ─── A: Five bookmarks — everything on the left as page markers ─────────────

type ATab = ViewMode | 'structure' | 'edges' | 'axis'

function VariantA_FiveBookmarks() {
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)
  const [open, setOpen] = useState<ATab | null>('structure')

  function toggle(tab: ATab) {
    if (tab === 'chronological' || tab === 'telling') setViewMode(tab)
    setOpen((cur) => (cur === tab ? null : tab))
  }

  return (
    <div
      className="pointer-events-none absolute top-3 bottom-3 left-0 z-20 flex items-center"
      data-prototype="A"
      aria-label="PROTOTYPE A — five bookmarks"
    >
      <div className="pointer-events-auto flex flex-col gap-1 py-1">
        <Tongue
          label="เวลา"
          title="เวลาในเรื่อง"
          lit={viewMode === 'chronological'}
          open={open === 'chronological'}
          onClick={() => toggle('chronological')}
        />
        <Tongue
          label="เล่า"
          title="ลำดับเล่า"
          lit={viewMode === 'telling'}
          open={open === 'telling'}
          onClick={() => toggle('telling')}
        />
        <Tongue
          label="โครง"
          title="โครงสร้าง"
          lit={open === 'structure'}
          open={open === 'structure'}
          tone="rust"
          onClick={() => toggle('structure')}
        />
        <Tongue
          label="ชนิด"
          title="ชนิดเส้น"
          lit={open === 'edges'}
          open={open === 'edges'}
          tone="rust"
          onClick={() => toggle('edges')}
        />
        <Tongue
          label="เส้น"
          title="คู่มือแกนเส้น"
          lit={open === 'axis'}
          open={open === 'axis'}
          tone="teal"
          onClick={() => toggle('axis')}
        />
      </div>
      {open && (
        <Leaf size={open === 'structure' || open === 'edges' ? 'lg' : 'md'}>
          {open === 'structure' && <StructureLeafBody />}
          {open === 'edges' && <EdgesLeafBody />}
          {open === 'axis' && <AxisBody />}
          {(open === 'chronological' || open === 'telling') && (
            <p className="text-[11px] leading-snug text-ink/65">
              {open === 'chronological'
                ? 'มุมมองเวลาในเรื่อง — เหตุการณ์เรียงบนไทม์ไลน์'
                : 'มุมมองลำดับเล่า — เส้น A→B→C คือเส้นทางที่คนอ่านได้ยิน'}
            </p>
          )}
          <button
            type="button"
            className="mt-3 text-[10px] text-ink/40 hover:text-ink/70"
            onClick={() => setOpen(null)}
          >
            พับเข้า ←
          </button>
        </Leaf>
      )}
    </div>
  )
}

// ─── B: Tool spine — always-open left column, not tab-reveal ────────────────

function VariantB_ToolSpine() {
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)

  return (
    <aside
      className="absolute top-0 left-0 z-20 flex h-full w-[248px] flex-col gap-2 overflow-y-auto border-r border-ink/15 bg-[#f3efe4]/95 px-2 py-3 shadow-md"
      data-prototype="B"
      aria-label="PROTOTYPE B — tool spine"
    >
      <p className="font-display px-1 text-[10px] font-bold tracking-wide text-ink/40">
        เครื่องมือกระดาน
      </p>
      <div
        className="flex overflow-hidden rounded"
        style={{ border: '1px solid rgba(20,22,25,0.18)' }}
        role="tablist"
      >
        {(
          [
            ['chronological', 'เวลาในเรื่อง'],
            ['telling', 'ลำดับเล่า'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={viewMode === key}
            className={
              viewMode === key
                ? 'flex-1 bg-ink px-2 py-1.5 text-[11px] font-semibold text-cream'
                : 'flex-1 px-2 py-1.5 text-[11px] text-ink/60 hover:bg-sand/30'
            }
            onClick={() => setViewMode(key as ViewMode)}
          >
            {label}
          </button>
        ))}
      </div>
      <StructurePicker />
      <EdgeLegend />
      <div
        className="rounded bg-white/80 px-3 py-2"
        style={{ border: '1px solid rgba(20,22,25,0.12)' }}
      >
        <AxisBody />
      </div>
      <p className="px-1 text-[9px] text-ink/35">
        state: spine always open · view={viewMode}
      </p>
    </aside>
  )
}

// ─── C: Lean rail (view+axis) + top ribbon for structure/edges ──────────────

function VariantC_LeanRail() {
  // Reuse production lean rail — thesis is "don't put structure/edges on left"
  return (
    <div data-prototype="C-rail">
      <BoardBookmarkRail />
    </div>
  )
}

function VariantC_TopRibbon() {
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const setStructureTemplate = useProjectStore((s) => s.setStructureTemplate)
  const template = getStructureTemplate(structureId)
  const newEdgeType = useUiStore((s) => s.newEdgeType)
  const setNewEdgeType = useUiStore((s) => s.setNewEdgeType)

  const edgeTypes: EdgeType[] = [
    'actual_path',
    'expected_want_path',
    'better_outcome_path',
    'failure_path',
    'character_arc',
  ]

  return (
    <div
      className="mt-2 flex max-w-[min(920px,92vw)] items-stretch gap-3 rounded-md bg-cream/95 px-3 py-2 shadow-md"
      style={{ border: '1px solid rgba(20,22,25,0.16)' }}
      data-prototype="C-ribbon"
      aria-label="PROTOTYPE C — top ribbon"
    >
      <label className="flex min-w-0 items-center gap-2 text-[11px]">
        <span className="font-display shrink-0 font-bold text-ink">โครง</span>
        <select
          className="max-w-[140px] rounded bg-white px-1.5 py-1 text-[11px] text-ink"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          value={structureId}
          onChange={(e) => setStructureTemplate(e.target.value)}
          aria-label="เลือกโครงสร้างเรื่อง"
        >
          {STRUCTURE_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <div className="w-px bg-ink/15" aria-hidden />
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        <span className="shrink-0 text-[10px] font-semibold text-ink/45">
          ชนิดเส้น
        </span>
        {edgeTypes.map((type) => {
          const style = EDGE_STYLE[type]
          const active = type === newEdgeType
          return (
            <button
              key={type}
              type="button"
              title={EDGE_LABELS[type]}
              aria-pressed={active}
              onClick={() => setNewEdgeType(type)}
              className={[
                'flex shrink-0 items-center gap-1 rounded px-1.5 py-1',
                active ? 'bg-ink text-cream' : 'bg-white text-ink/70 hover:bg-sand/30',
              ].join(' ')}
              style={{ border: '1px solid rgba(20,22,25,0.15)' }}
            >
              <svg width="22" height="6" aria-hidden>
                <line
                  x1="0"
                  y1="3"
                  x2="22"
                  y2="3"
                  stroke={active ? 'var(--color-cream)' : style.stroke}
                  strokeWidth="2"
                  strokeDasharray={style.dashed ? '4 2' : undefined}
                />
              </svg>
              <span className="max-w-[72px] truncate text-[10px]">
                {EDGE_LABELS[type]}
              </span>
            </button>
          )
        })}
      </div>
      <p className="hidden max-w-[160px] text-[10px] leading-snug text-ink/45 sm:block">
        {template.name}: แท็บซ้ายเหลือแค่เวลา/เล่า/เส้น
      </p>
    </div>
  )
}
