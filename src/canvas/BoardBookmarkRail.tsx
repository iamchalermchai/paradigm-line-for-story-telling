import { useState, type ReactNode } from 'react'
import { StructureBandGuide } from '../components/StructureBandGuide'
import {
  getStructureTemplate,
  STRUCTURE_TEMPLATES,
} from '../domain/structure'
import { EDGE_LABELS, type EdgeType } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { useUiStore, type ViewMode } from '../store/uiStore'
import { EDGE_STYLE } from './edges/StoryEdge'

type RailTab = ViewMode | 'structure' | 'edges' | 'axis'

const VIEW_TABS: {
  id: ViewMode
  short: string
  title: string
  blurb: string
}[] = [
  {
    id: 'chronological',
    short: 'เวลา',
    title: 'เวลาในเรื่อง',
    blurb: 'เหตุการณ์เรียงบนไทม์ไลน์ — ลากการ์ดซ้าย–ขวาเพื่อย้ายช่วง',
  },
  {
    id: 'telling',
    short: 'เล่า',
    title: 'ลำดับเล่า',
    blurb: 'เส้นเล่า (A→B→C…) คือเส้นทางที่คนอ่านได้รับเรื่อง',
  },
]

/**
 * Left-edge bookmark tabs (page markers): view, structure, edge type, axis.
 * Folded from chrome prototype A.
 */
export function BoardBookmarkRail() {
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)
  const [openTab, setOpenTab] = useState<RailTab | null>(null)

  function toggle(tab: RailTab) {
    if (tab === 'chronological' || tab === 'telling') setViewMode(tab)
    setOpenTab((cur) => (cur === tab ? null : tab))
  }

  const viewMeta = VIEW_TABS.find((t) => t.id === openTab)
  const large = openTab === 'structure' || openTab === 'edges'

  return (
    <div
      className="pointer-events-none absolute top-3 bottom-3 left-0 z-20 flex items-center"
      role="navigation"
      aria-label="เครื่องมือกระดาน"
    >
      <div className="pointer-events-auto flex flex-col gap-1 py-1">
        {VIEW_TABS.map((tab) => (
          <BookmarkTab
            key={tab.id}
            label={tab.short}
            title={tab.title}
            active={viewMode === tab.id}
            open={openTab === tab.id}
            onClick={() => toggle(tab.id)}
          />
        ))}
        <BookmarkTab
          label="โครง"
          title="โครงสร้าง"
          active={openTab === 'structure'}
          open={openTab === 'structure'}
          accent="rust"
          onClick={() => toggle('structure')}
        />
        <BookmarkTab
          label="ชนิด"
          title="ชนิดเส้น"
          active={openTab === 'edges'}
          open={openTab === 'edges'}
          accent="rust"
          onClick={() => toggle('edges')}
        />
        <BookmarkTab
          label="เส้น"
          title="คู่มือแกนเส้น"
          active={openTab === 'axis'}
          open={openTab === 'axis'}
          accent="teal"
          onClick={() => toggle('axis')}
        />
      </div>

      {openTab && (
        <Leaf size={large ? 'lg' : 'md'}>
          {openTab === 'structure' && <StructureLeafBody />}
          {openTab === 'edges' && <EdgesLeafBody />}
          {openTab === 'axis' && <AxisLeafBody />}
          {viewMeta && (
            <div>
              <h3 className="font-display text-sm font-bold text-ink">
                {viewMeta.title}
              </h3>
              <p className="mt-1.5 text-[11px] leading-snug text-ink/65">
                {viewMeta.blurb}
              </p>
              <button
                type="button"
                className="mt-2 text-[11px] font-semibold text-[#2b7a8c] hover:text-ink"
                onClick={() => setOpenTab('axis')}
              >
                ดูความหมายเหนือ/ใต้เส้น →
              </button>
            </div>
          )}
          <button
            type="button"
            className="mt-3 text-[10px] text-ink/40 hover:text-ink/70"
            onClick={() => setOpenTab(null)}
            aria-label="พับแท็บ"
          >
            พับเข้า ←
          </button>
        </Leaf>
      )}
    </div>
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
        animation: 'bookmark-leaf 180ms ease-out',
      }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">{children}</div>
    </div>
  )
}

function BookmarkTab({
  label,
  title,
  active,
  open,
  accent = 'ink',
  onClick,
}: {
  label: string
  title: string
  active: boolean
  open: boolean
  accent?: 'ink' | 'teal' | 'rust'
  onClick: () => void
}) {
  const lit = active || open
  const fill = lit
    ? accent === 'teal'
      ? '#2b7a8c'
      : accent === 'rust'
        ? 'var(--color-rust)'
        : 'var(--color-ink)'
    : 'var(--color-cream)'
  const ink = lit ? 'var(--color-cream)' : 'var(--color-ink)'

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      aria-expanded={open}
      onClick={onClick}
      className="font-display flex h-[68px] w-[26px] items-center justify-center rounded-r-md text-[11px] font-bold tracking-wide shadow-sm transition-[width] duration-150 hover:w-[30px] focus-visible:w-[30px]"
      style={{
        background: fill,
        color: ink,
        border: '1px solid rgba(20,22,25,0.2)',
        borderLeft: 'none',
        boxShadow: open
          ? '2px 0 0 rgba(205,80,66,0.55)'
          : '1px 1px 0 rgba(20,22,25,0.08)',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}
    >
      {label}
    </button>
  )
}

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
                background:
                  i % 2 === 0 ? 'rgba(20,22,25,0.06)' : 'rgba(205,80,66,0.1)',
                borderLeft:
                  i === 0 ? undefined : '1px solid rgba(20,22,25,0.18)',
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
      <div
        className="space-y-1.5 border-t pt-2"
        style={{ borderColor: 'rgba(20,22,25,0.12)' }}
      >
        <p className="text-[11px] font-semibold text-ink">
          แต่ละช่วง · งาน / ควรใส่ / เป้า
        </p>
        <StructureBandGuide template={template} compact />
      </div>
      <p className="text-[10px] text-ink/40">
        สลับโครงจะวางหมุดชุดใหม่บนเส้น (เลิกทำได้) · แกนเส้นดูที่แท็บเส้น
      </p>
    </div>
  )
}

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

function AxisLeafBody() {
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
      <div className="mt-2.5 space-y-2">
        <div>
          <div className="font-display text-[13px] font-bold text-ink">
            ↑ เหนือเส้น
          </div>
          <p className="text-[11px] leading-snug text-ink/60">{t.axis.aboveHint}</p>
        </div>
        <div className="h-0 border-t-2 border-ink" aria-hidden />
        <div>
          <div className="font-display text-[13px] font-bold text-ink">
            ↓ ใต้เส้น
          </div>
          <p className="text-[11px] leading-snug text-ink/60">{t.axis.belowHint}</p>
        </div>
      </div>
    </div>
  )
}

