import { useState, type ReactNode } from 'react'
import { LayerDiagram } from '../components/LayerDiagram'
import {
  LAYER_COLORS,
  LAYER_HINTS,
  LAYER_LABELS,
  STORY_LAYERS,
  suggestStoryLayer,
} from '../domain/layers'
import {
  hasStructureDiagram,
  StructureTeachingDiagram,
  structureDiagramMeta,
} from '../components/StructureTeachingDiagram'
import { StructureBandGuide } from '../components/StructureBandGuide'
import {
  getStructureTemplate,
  STRUCTURE_TEMPLATES,
} from '../domain/structure'
import { EDGE_LABELS, type EdgeType } from '../domain/types'
import type { Backstory, Character, StoryLayer, StoryScene } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { useUiStore, type ViewMode } from '../store/uiStore'
import { EDGE_STYLE } from './edges/StoryEdge'

export type RailTab = ViewMode | 'structure' | 'edges' | 'axis' | 'diagram' | 'layers'

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
 * Left-edge bookmark tabs (page markers): view, structure, edge type, axis,
 * and Paradigm teaching diagram (ดูภาพ).
 */
export function BoardBookmarkRail({
  initialOpenTab = null,
}: {
  initialOpenTab?: RailTab | null
} = {}) {
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)
  const scenes = useProjectStore((s) => s.project.scenes)
  const backstory = useProjectStore((s) => s.project.backstory)
  const characters = useProjectStore((s) => s.project.characters)
  const applyLayerSuggestions = useProjectStore((s) => s.applyLayerSuggestions)
  const [openTab, setOpenTab] = useState<RailTab | null>(initialOpenTab)

  function toggle(tab: RailTab) {
    if (tab === 'chronological' || tab === 'telling') setViewMode(tab)
    setOpenTab((cur) => (cur === tab ? null : tab))
  }

  const viewMeta = VIEW_TABS.find((t) => t.id === openTab)
  const large =
    openTab === 'structure' ||
    openTab === 'edges' ||
    openTab === 'diagram' ||
    openTab === 'layers'

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
        <BookmarkTab
          label="ดูภาพ"
          title="แผนภาพสอน"
          active={openTab === 'diagram'}
          open={openTab === 'diagram'}
          accent="teal"
          onClick={() => toggle('diagram')}
        />
        <BookmarkTab
          label="มิติ"
          title="มิติของเรื่องเล่า · META / CHARACTER / MEMORY / GHOST"
          active={openTab === 'layers'}
          open={openTab === 'layers'}
          accent="teal"
          onClick={() => toggle('layers')}
        />
      </div>

      {openTab && (
        <Leaf size={openTab === 'diagram' ? 'xl' : large ? 'lg' : 'md'}>
          {openTab === 'structure' && <StructureLeafBody />}
          {openTab === 'edges' && <EdgesLeafBody />}
          {openTab === 'axis' && <AxisLeafBody />}
          {openTab === 'diagram' && <DiagramLeafBody />}
          {openTab === 'layers' && (
            <LayersLeafBody
              scenes={scenes}
              backstory={backstory}
              characters={characters}
              onApplySuggestions={applyLayerSuggestions}
            />
          )}
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
  size?: 'md' | 'lg' | 'xl'
}) {
  const width = size === 'xl' ? 372 : size === 'lg' ? 304 : 232
  return (
    <div
      className="pointer-events-auto ml-0.5 flex max-h-[min(78vh,680px)] flex-col overflow-hidden rounded-r-md bg-cream/97 shadow-md"
      style={{
        width,
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
      <p
        className="rounded px-2 py-2 text-[10px] leading-snug text-ink/60"
        style={{
          border: '1px solid rgba(20,22,25,0.12)',
          background: 'rgba(43,122,140,0.06)',
        }}
      >
        เรื่องเล่นข้ามความจริง/ความทรงจำ? ใช้แท็บ{' '}
        <strong className="text-ink">มิติ</strong> (ถัดจาก ดูภาพ)
      </p>
      <div
        className={
          template.bands.length <= 3
            ? 'grid grid-cols-3 gap-px overflow-hidden rounded'
            : 'grid grid-cols-2 gap-px overflow-hidden rounded'
        }
        aria-label="ช่วงของเรื่อง"
      >
        {template.bands.map((band, i) => (
          <span
            key={band.label}
            className="px-1.5 py-1.5 text-center text-[10px] font-semibold leading-snug text-ink/75"
            style={{
              background:
                i % 2 === 0 ? 'rgba(20,22,25,0.06)' : 'rgba(205,80,66,0.1)',
            }}
            title={`${band.label} — ${band.job}`}
          >
            {band.label}
          </span>
        ))}
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
        <p className="text-[11px] font-semibold leading-snug text-ink">
          แต่ละช่วง — งาน · ควรใส่ · เป้าจบช่วง
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

/** Teaching diagram for the active structure template. */
function DiagramLeafBody() {
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const t = getStructureTemplate(structureId)
  const meta = structureDiagramMeta(structureId)
  const [expanded, setExpanded] = useState(false)

  if (!hasStructureDiagram(structureId)) {
    return (
      <div className="space-y-2 text-xs text-ink">
        <h3 className="font-display text-sm font-bold">แผนภาพสอน</h3>
        <p className="leading-snug text-ink/65">{meta.blurb}</p>
        <p className="leading-snug text-ink/50">
          โครง <span className="font-semibold text-ink/70">{t.name}</span> —
          อ่านความหมายเหนือ/ใต้เส้นที่แท็บ <span className="font-semibold">เส้น</span>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 text-xs text-ink">
      <h3 className="font-display text-sm font-bold">{meta.title}</h3>
      <p className="text-[11px] leading-snug text-ink/60">{meta.blurb}</p>
      <StructureTeachingDiagram templateId={structureId} compact />
      <button
        type="button"
        className="w-full rounded px-2 py-1.5 text-[11px] font-semibold text-ink hover:bg-sand/25"
        style={{ border: '1px solid rgba(20,22,25,0.2)' }}
        onClick={() => setExpanded(true)}
      >
        ขยายแผนภาพ
      </button>
      {expanded && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/35 p-4"
          role="dialog"
          aria-modal
          aria-label={meta.aria}
          onClick={() => setExpanded(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-md bg-cream p-4 shadow-lg"
            style={{ border: '2px solid rgba(20,22,25,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="font-display text-base font-bold text-ink">
                {meta.title}
              </h2>
              <button
                type="button"
                className="text-[11px] text-ink/50 hover:text-ink"
                onClick={() => setExpanded(false)}
              >
                ปิด
              </button>
            </div>
            <p className="mb-3 text-[12px] leading-snug text-ink/60">{meta.blurb}</p>
            <StructureTeachingDiagram templateId={structureId} />
          </div>
        </div>
      )}
    </div>
  )
}

function LayersLeafBody({
  scenes,
  backstory,
  characters,
  onApplySuggestions,
}: {
  scenes: StoryScene[]
  backstory: Backstory
  characters: Character[]
  onApplySuggestions: (patches: { id: string; storyLayer: StoryLayer }[]) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState<Record<StoryLayer, boolean>>({
    meta: true,
    character: true,
    memory: true,
    ghost: true,
  })
  const [showSuggest, setShowSuggest] = useState(false)

  const suggestions = scenes.map((s) => ({
    scene: s,
    ...suggestStoryLayer(s, backstory, characters),
  }))

  const toApply = suggestions.filter((s) => s.layer !== s.scene.storyLayer)
  const taggedCount = scenes.filter((s) => s.storyLayer !== 'character').length

  return (
    <div className="space-y-2.5 text-xs text-ink">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-sm font-bold">มิติของเรื่องเล่า</h3>
        {taggedCount > 0 && (
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-bold text-cream"
            style={{ background: '#2b7a8c' }}
          >
            {taggedCount} ฉาก
          </span>
        )}
      </div>
      <p className="text-[10px] leading-snug text-ink/55">
        Paradigm ขับตำแหน่งบนกระดาน · ตั้งแท็กเส้น + มิติในแก้ไขฉาก · กดภาพเพื่อขยาย
      </p>
      {taggedCount === 0 && scenes.length > 0 && (
        <p
          className="rounded px-2 py-1.5 text-[10px] leading-snug text-ink/60"
          style={{
            border: '1px solid rgba(20,22,25,0.12)',
            background: 'rgba(20,22,25,0.03)',
          }}
        >
          ทุกฉากอยู่มิติ CHARACTER — ตั้งแท็กเส้นในแก้ไขฉาก แล้วกดแนะนำมิติ
        </p>
      )}

      <LayerDiagram
        scenes={scenes}
        size="mini"
        visible={visible}
        onExpand={() => setExpanded(true)}
      />
      <button
        type="button"
        className="w-full rounded px-2 py-1 text-[10px] font-semibold text-ink hover:bg-sand/25"
        style={{ border: '1px solid rgba(20,22,25,0.2)' }}
        onClick={() => setExpanded(true)}
      >
        ขยายภาพมิติ
      </button>

      <div className="space-y-1">
        {STORY_LAYERS.map((layer) => (
          <p
            key={layer}
            className="text-[10px] leading-snug text-ink/55"
            style={{ opacity: visible[layer] ? 1 : 0.35 }}
          >
            <span
              className="font-display font-bold"
              style={{ color: LAYER_COLORS[layer] }}
            >
              {LAYER_LABELS[layer]}
            </span>
            {' · '}
            {LAYER_HINTS[layer]} · ×
            {scenes.filter((s) => s.storyLayer === layer).length}
          </p>
        ))}
      </div>

      <div
        className="space-y-1.5 border-t pt-2"
        style={{ borderColor: 'rgba(20,22,25,0.12)' }}
      >
        <p className="text-[11px] font-semibold text-ink">กรองมอง</p>
        <div className="flex flex-wrap gap-1.5">
          {STORY_LAYERS.map((layer) => (
            <label
              key={layer}
              className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold"
              style={{
                background: visible[layer]
                  ? `${LAYER_COLORS[layer]}18`
                  : 'rgba(20,22,25,0.06)',
                color: visible[layer] ? LAYER_COLORS[layer] : 'var(--color-ink-soft)',
                border: `1px solid ${visible[layer] ? LAYER_COLORS[layer] : 'rgba(20,22,25,0.15)'}`,
              }}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={visible[layer]}
                onChange={() =>
                  setVisible((v) => ({ ...v, [layer]: !v[layer] }))
                }
              />
              {LAYER_LABELS[layer]}
            </label>
          ))}
        </div>
      </div>

      <div
        className="space-y-2 border-t pt-2"
        style={{ borderColor: 'rgba(20,22,25,0.12)' }}
      >
        <button
          type="button"
          className="w-full rounded px-2 py-1.5 text-[11px] font-semibold text-cream"
          style={{ background: 'var(--color-ink)' }}
          onClick={() => setShowSuggest(true)}
        >
          แนะนำมิติ
        </button>
        {showSuggest && toApply.length > 0 && (
          <ul className="space-y-1">
            {toApply.map(({ scene, layer, reason }) => (
              <li
                key={scene.id}
                className="rounded px-2 py-1 text-[10px] leading-snug text-ink/75"
                style={{ background: 'rgba(205,80,66,0.06)' }}
              >
                {scene.title} → <strong>{LAYER_LABELS[layer]}</strong>
                <span className="text-ink/45"> ({reason})</span>
              </li>
            ))}
          </ul>
        )}
        {showSuggest && (
          <button
            type="button"
            className="w-full rounded px-2 py-1 text-[10px] font-semibold text-cream"
            style={{ background: 'var(--color-mint-deep)' }}
            onClick={() => {
              onApplySuggestions(
                toApply.map(({ scene, layer }) => ({
                  id: scene.id,
                  storyLayer: layer,
                })),
              )
              setShowSuggest(false)
            }}
          >
            ยืนยันทั้งหมด ({toApply.length})
          </button>
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal
          aria-label="ภาพมิติขยาย"
          onClick={() => setExpanded(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-md bg-cream p-4 shadow-lg"
            style={{ border: '2px solid rgba(20,22,25,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-ink">
                  ภาพมิติของเรื่องเล่า
                </h2>
                <p className="mt-0.5 text-[11px] text-ink/50">
                  เวลาไหลซ้าย→ขวา · ความลึกของการเล่าบน→ล่าง · ชื่อฉากอยู่ติดจุด
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded px-2 py-1 text-[11px] text-ink/50 hover:bg-sand/20 hover:text-ink"
                onClick={() => setExpanded(false)}
              >
                ปิด
              </button>
            </div>
            <LayerDiagram scenes={scenes} size="full" visible={visible} />
          </div>
        </div>
      )}
    </div>
  )
}

