/**
 * PROTOTYPE — bookmark rail tab 「เลน」 for layered-memory structure.
 *
 * Question: can lane viewing + suggest live on the left bookmark rail?
 * Switch with ?layerRail=open. Not production UI.
 */

import { useMemo, useState } from 'react'
import { useSearchParam } from '../useSearchParam'
import {
  LAYER_COLORS,
  LAYER_HINTS,
  LAYER_LABELS,
  SAMPLE_SCENES,
  STORY_LAYERS,
  suggestLayer,
  type SampleScene,
  type StoryLayer,
} from '../storyLayer/suggestLayer'

const MOCK_TABS = [
  { short: 'เวลา', title: 'เวลาในเรื่อง' },
  { short: 'เล่า', title: 'ลำดับเล่า' },
  { short: 'โครง', title: 'โครงสร้าง' },
  { short: 'ชนิด', title: 'ชนิดเส้น' },
  { short: 'เส้น', title: 'คู่มือแกนเส้น' },
  { short: 'ดูภาพ', title: 'แผนภาพสอน' },
  { short: 'เลน', title: 'เลน META / CHARACTER / MEMORY / GHOST' },
] as const

export function LayerRailPrototypeHost() {
  if (!import.meta.env.DEV) return null
  const [raw, setRaw] = useSearchParam('layerRail', '')
  if (raw !== 'open') return null

  return (
    <>
      <div
        className="pointer-events-none absolute top-3 bottom-3 left-0 z-[75] flex items-center"
        data-prototype="layer-rail-host"
        role="navigation"
        aria-label="PROTOTYPE — แท็บเลน"
      >
        <MockLayerRail onClose={() => setRaw('')} />
      </div>
      <div
        className="pointer-events-none fixed bottom-16 left-1/2 z-[76] -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold text-cream shadow-lg"
        style={{ background: '#141619', border: '2px solid #e49c4e' }}
      >
        PROTOTYPE · แท็บ 「เลน」 · ปิด = ลบ ?layerRail= จาก URL
      </div>
    </>
  )
}

function MockLayerRail({ onClose }: { onClose: () => void }) {
  const [scenes, setScenes] = useState<SampleScene[]>(() =>
    SAMPLE_SCENES.map((s) => ({ ...s })),
  )
  const [suggestions, setSuggestions] = useState<
    Record<string, ReturnType<typeof suggestLayer>>
  >({})
  const [showSuggest, setShowSuggest] = useState(false)
  const [laneExpanded, setLaneExpanded] = useState(false)
  const [visible, setVisible] = useState<Record<StoryLayer, boolean>>({
    meta: true,
    character: true,
    memory: true,
    ghost: true,
  })

  const counts = useMemo(() => {
    const c: Record<StoryLayer | 'unset', number> = {
      meta: 0,
      character: 0,
      memory: 0,
      ghost: 0,
      unset: 0,
    }
    for (const s of scenes) {
      if (s.layer == null) c.unset++
      else c[s.layer]++
    }
    return c
  }, [scenes])

  const { confirmed: laneConfirmed, pending: lanePending } = useMemo(
    () => laneStats(scenes),
    [scenes],
  )

  function runSuggest() {
    const next: typeof suggestions = {}
    for (const s of scenes) {
      if (!s.userSet) next[s.id] = suggestLayer(s)
    }
    setSuggestions(next)
    setShowSuggest(true)
  }

  function acceptAll() {
    setScenes((prev) =>
      prev.map((s) => {
        if (s.userSet) return s
        const sug = suggestions[s.id]
        return sug ? { ...s, layer: sug.layer } : s
      }),
    )
  }

  function acceptOne(id: string) {
    const sug = suggestions[id]
    if (!sug) return
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, layer: sug.layer } : s)),
    )
  }

  function toggleVisible(layer: StoryLayer) {
    setVisible((v) => ({ ...v, [layer]: !v[layer] }))
  }

  return (
    <>
      <div className="pointer-events-auto flex flex-col gap-1 py-1">
        {MOCK_TABS.map((tab) => {
          const isLane = tab.short === 'เลน'
          return (
            <button
              key={tab.short}
              type="button"
              title={tab.title}
              aria-label={tab.title}
              aria-pressed={isLane}
              aria-expanded={isLane}
              className="font-display flex h-[68px] w-[26px] items-center justify-center rounded-r-md text-[11px] font-bold tracking-wide shadow-sm transition-[width] duration-150 hover:w-[30px]"
              style={{
                background: isLane ? '#2b7a8c' : 'var(--color-cream)',
                color: isLane ? 'var(--color-cream)' : 'var(--color-ink)',
                border: '1px solid rgba(20,22,25,0.2)',
                borderLeft: 'none',
                boxShadow: isLane
                  ? '2px 0 0 rgba(43,122,140,0.55)'
                  : '1px 1px 0 rgba(20,22,25,0.08)',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              {tab.short}
            </button>
          )
        })}
      </div>

      <div
        className="pointer-events-auto ml-0.5 flex max-h-[min(78vh,680px)] w-[304px] flex-col overflow-hidden rounded-r-md bg-cream/97 shadow-md"
        style={{
          border: '1px solid rgba(20,22,25,0.16)',
          borderLeft: '3px solid #2b7a8c',
          animation: 'bookmark-leaf 180ms ease-out',
        }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 text-xs text-ink">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="font-display text-sm font-bold">เลนบนกระดาน</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold text-cream"
              style={{ background: 'var(--color-rust)' }}
            >
              layered-memory
            </span>
          </div>
          <p className="text-[10px] leading-snug text-ink/55">
            โผล่เฉพาะโครงนี้ · CHARACTER = ค่าเริ่มต้น (การ์ดไม่โชว์ชิป)
          </p>

          <div className="mt-2.5">
            <p className="mb-1 text-[10px] font-semibold text-ink/45">
              ภาพเลน (mini map)
            </p>
            <button
              type="button"
              className="w-full cursor-pointer rounded transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b7a8c]"
              aria-label="ขยายภาพเลน"
              onClick={() => setLaneExpanded(true)}
            >
              <LaneDiagram
                size="mini"
                scenes={scenes}
                visible={visible}
                counts={counts}
              />
            </button>
            <button
              type="button"
              className="mt-1.5 w-full rounded px-2 py-1 text-[10px] font-semibold text-ink hover:bg-sand/25"
              style={{ border: '1px solid rgba(20,22,25,0.2)' }}
              onClick={() => setLaneExpanded(true)}
            >
              ขยายภาพเลน
            </button>
          </div>

          {laneExpanded && (
            <div
              className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/40 p-4"
              role="dialog"
              aria-modal
              aria-label="ภาพเลนขยาย"
              onClick={() => setLaneExpanded(false)}
            >
              <div
                className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-md bg-cream p-4 shadow-lg"
                style={{ border: '2px solid rgba(20,22,25,0.2)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <div>
                    <h2 className="font-display text-base font-bold text-ink">
                      ภาพเลนบนกระดาน
                    </h2>
                    <p className="mt-0.5 text-[11px] text-ink/55">
                      layered-memory · วง = META/CHARACTER · เพชร = MEMORY/GHOST
                      · จุดประ = ยังไม่ยืนยัน · ยืนยัน/แนะนำ = จำนวนต่อเลน
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-[11px] text-ink/50 hover:text-ink"
                    onClick={() => setLaneExpanded(false)}
                  >
                    ปิด
                  </button>
                </div>
                <LaneDiagram
                  size="full"
                  scenes={scenes}
                  visible={visible}
                  counts={counts}
                />
              </div>
            </div>
          )}

          {counts.unset > 0 && (
            <p className="mt-2 text-[10px] text-rust">
              ยังไม่จัดเลน {counts.unset} ใบ — จุดประ = แนะนำ (ยังไม่ยืนยัน)
            </p>
          )}

          <div className="mt-2 space-y-1">
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
                {LAYER_HINTS[layer]} ·{' '}
                {laneCountCaption(laneConfirmed[layer], lanePending[layer])}
              </p>
            ))}
          </div>

          <div
            className="mt-3 space-y-1.5 border-t pt-2"
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
                    onChange={() => toggleVisible(layer)}
                  />
                  {LAYER_LABELS[layer]}
                </label>
              ))}
            </div>
            <p className="text-[10px] text-ink/45">
              ปิดเลน = จางใน mini map (prototype)
            </p>
          </div>

          <div
            className="mt-3 space-y-2 border-t pt-2"
            style={{ borderColor: 'rgba(20,22,25,0.12)' }}
          >
            <button
              type="button"
              className="w-full rounded px-2 py-1.5 text-[11px] font-semibold text-cream"
              style={{ background: 'var(--color-ink)' }}
              onClick={runSuggest}
            >
              แนะนำเลน
            </button>
            {showSuggest && (
              <ul className="space-y-1">
                {scenes.map((s) => {
                  const sug = suggestions[s.id]
                  if (!sug || s.userSet) return null
                  const same = s.layer === sug.layer
                  return (
                    <li
                      key={s.id}
                      className="flex items-start justify-between gap-2 rounded px-2 py-1 text-[10px]"
                      style={{
                        background: same
                          ? 'rgba(47,156,108,0.08)'
                          : 'rgba(205,80,66,0.06)',
                      }}
                    >
                      <span className="leading-snug text-ink/75">
                        {s.title} → <strong>{LAYER_LABELS[sug.layer]}</strong>
                        <span className="text-ink/45"> ({sug.reason})</span>
                      </span>
                      {!same && (
                        <button
                          type="button"
                          className="shrink-0 font-semibold text-ink"
                          onClick={() => acceptOne(s.id)}
                        >
                          ✓
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            {showSuggest && (
              <button
                type="button"
                className="w-full rounded px-2 py-1 text-[10px] font-semibold text-cream"
                style={{ background: 'var(--color-mint-deep)' }}
                onClick={acceptAll}
              >
                ยืนยันทั้งหมด
              </button>
            )}
          </div>

          <div
            className="mt-3 rounded px-2 py-1.5 font-mono text-[9px] leading-relaxed text-ink/50"
            style={{ background: 'rgba(20,22,25,0.04)' }}
          >
            <p className="mb-1 font-sans text-[9px] font-semibold">state</p>
            visible:{' '}
            {STORY_LAYERS.filter((l) => visible[l])
              .map((l) => LAYER_LABELS[l])
              .join(', ')}
            <br />
            {scenes.map((s) => (
              <span key={s.id} className="block">
                {s.title.slice(0, 12)}… layer={s.layer ?? '∅'}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 text-[10px] text-ink/40 hover:text-ink/70"
            onClick={onClose}
          >
            ปิด prototype ←
          </button>
        </div>
      </div>
    </>
  )
}

const MINI_LANE_ROWS: { layer: StoryLayer; y: number; short: string }[] = [
  { layer: 'meta', y: 22, short: 'META' },
  { layer: 'character', y: 52, short: 'CHAR' },
  { layer: 'memory', y: 82, short: 'MEM' },
  { layer: 'ghost', y: 112, short: 'GHOST' },
]

const FULL_LANES: {
  layer: StoryLayer
  y: number
  label: string
  hint: string
}[] = [
  { layer: 'meta', y: 48, label: 'META', hint: 'ผู้เล่า · ระยะห่าง' },
  { layer: 'character', y: 118, label: 'CHARACTER', hint: 'เหตุการณ์หลัก' },
  { layer: 'memory', y: 188, label: 'MEMORY', hint: 'ความทรงจำที่ถูกกระตุ้น' },
  { layer: 'ghost', y: 258, label: 'GHOST', hint: 'แผลที่ตามหลอกหลอน' },
]

const MINI_SCENE_X: Record<string, number> = {
  s1: 88,
  s2: 72,
  s3: 148,
  s4: 118,
}

const FULL_SCENE_X: Record<string, number> = {
  s1: 200,
  s2: 300,
  s3: 180,
  s4: 280,
}

const CREAM = '#f8f6f0'
const INK = '#141619'

function displayLayer(scene: SampleScene): {
  layer: StoryLayer
  pending: boolean
} {
  if (scene.layer) return { layer: scene.layer, pending: false }
  return { layer: suggestLayer(scene).layer, pending: true }
}

function laneStats(scenes: SampleScene[]) {
  const confirmed: Record<StoryLayer, number> = {
    meta: 0,
    character: 0,
    memory: 0,
    ghost: 0,
  }
  const pending: Record<StoryLayer, number> = {
    meta: 0,
    character: 0,
    memory: 0,
    ghost: 0,
  }
  for (const s of scenes) {
    if (s.layer) confirmed[s.layer]++
    else pending[suggestLayer(s).layer]++
  }
  return { confirmed, pending }
}

function laneCountCaption(
  confirmed: number,
  pending: number,
  compact?: boolean,
) {
  if (compact) {
    return pending > 0 ? `${confirmed}+${pending}?` : String(confirmed)
  }
  if (pending > 0) {
    return `ยืนยัน ${confirmed} · แนะนำ ${pending}`
  }
  return `ยืนยัน ${confirmed}`
}

/** Labels above circles; below diamonds so trigger curves pass between. */
function SceneLabel({
  x,
  y,
  r,
  layer,
  title,
  size,
}: {
  x: number
  y: number
  r: number
  layer: StoryLayer
  title: string
  size: 'mini' | 'full'
}) {
  const above = layer === 'meta' || layer === 'character'
  const fontSize = size === 'full' ? 10 : 6.5
  const strokeW = size === 'full' ? 4 : 2.5
  const labelY = above ? y - r - (size === 'full' ? 8 : 10) : y + r + (size === 'full' ? 14 : 12)
  const display =
    size === 'mini' && title.length > 8 ? `${title.slice(0, 7)}…` : title

  return (
    <text
      x={x}
      y={labelY}
      textAnchor="middle"
      fill={INK}
      stroke={CREAM}
      strokeWidth={strokeW}
      paintOrder="stroke"
      fontFamily="Noto Sans Thai, sans-serif"
      fontSize={fontSize}
      fontWeight="600"
    >
      {display}
    </text>
  )
}

function LaneDiagram({
  size,
  scenes,
  visible,
  counts,
}: {
  size: 'mini' | 'full'
  scenes: SampleScene[]
  visible: Record<StoryLayer, boolean>
  counts: Record<StoryLayer | 'unset', number>
}) {
  void counts
  const { confirmed, pending } = laneStats(scenes)

  const sceneMarks = scenes
    .map((s) => {
      const { layer: eff, pending: isPending } = displayLayer(s)
      if (!visible[eff]) return null
      const laneRow = (size === 'full' ? FULL_LANES : MINI_LANE_ROWS).find(
        (l) => l.layer === eff,
      )!
      const x = (size === 'full' ? FULL_SCENE_X : MINI_SCENE_X)[s.id] ?? 100
      return { s, eff, isPending, x, y: laneRow.y }
    })
    .filter(Boolean) as {
    s: SampleScene
    eff: StoryLayer
    isPending: boolean
    x: number
    y: number
  }[]

  if (size === 'full') {
    return (
      <svg
        viewBox="0 0 720 300"
        width="100%"
        className="block"
        role="img"
        aria-label="ภาพเลนสี่ชั้นขยาย"
      >
        <rect width="720" height="300" fill={CREAM} />
        {FULL_LANES.map((lane, i) => {
          const lit = visible[lane.layer]
          return (
            <g key={lane.layer} opacity={lit ? 1 : 0.2}>
              <rect
                x="88"
                y={lane.y - 28}
                width="620"
                height="56"
                fill={
                  i % 2 === 0
                    ? 'rgba(20,22,25,0.04)'
                    : `${LAYER_COLORS[lane.layer]}10`
                }
              />
              <line
                x1="88"
                y1={lane.y}
                x2="708"
                y2={lane.y}
                stroke={LAYER_COLORS[lane.layer]}
                strokeWidth={lane.layer === 'character' ? 2.5 : 1.25}
                opacity={lane.layer === 'character' ? 0.9 : 0.4}
              />
              <text
                x="12"
                y={lane.y - 4}
                fill={LAYER_COLORS[lane.layer]}
                fontFamily="Trirong, serif"
                fontSize="11"
                fontWeight="700"
              >
                {lane.label}
              </text>
              <text
                x="12"
                y={lane.y + 12}
                fill={INK}
                fontFamily="Noto Sans Thai, sans-serif"
                fontSize="8"
                opacity="0.5"
              >
                {lane.hint} ·{' '}
                {laneCountCaption(confirmed[lane.layer], pending[lane.layer])}
              </text>
            </g>
          )
        })}

        {visible.character && visible.memory && (
          <TriggerCurve x1={200} y1={118} x2={280} y2={188} />
        )}
        {visible.character && visible.ghost && (
          <TriggerCurve x1={200} y1={118} x2={300} y2={258} dashed />
        )}

        {sceneMarks.map(({ s, eff, isPending, x, y }) => {
          const isCircle = eff === 'meta' || eff === 'character'
          const color = LAYER_COLORS[eff]
          const r = 9
          return (
            <g key={`node-${s.id}`}>
              {isCircle ? (
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={color}
                  stroke={isPending ? INK : CREAM}
                  strokeWidth={isPending ? 2 : 1.5}
                  strokeDasharray={isPending ? '4 3' : undefined}
                  opacity={isPending ? 0.8 : 1}
                />
              ) : (
                <path
                  d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`}
                  fill={color}
                  stroke={isPending ? INK : CREAM}
                  strokeWidth={isPending ? 2 : 1.5}
                  strokeDasharray={isPending ? '4 3' : undefined}
                  opacity={isPending ? 0.8 : 1}
                />
              )}
            </g>
          )
        })}

        {sceneMarks.map(({ s, eff, x, y }) => (
          <SceneLabel
            key={`label-${s.id}`}
            x={x}
            y={y}
            r={9}
            layer={eff}
            title={s.title}
            size="full"
          />
        ))}
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 276 132"
      width="100%"
      className="block rounded"
      role="img"
      aria-label="ภาพเลนสี่ชั้น"
      style={{
        border: '1px solid rgba(20,22,25,0.14)',
        background: CREAM,
      }}
    >
      {MINI_LANE_ROWS.map(({ layer, y, short }, i) => {
        const lit = visible[layer]
        return (
          <g key={layer} opacity={lit ? 1 : 0.22}>
            <rect
              x="42"
              y={y - 13}
              width="228"
              height="26"
              fill={
                i % 2 === 0
                  ? 'rgba(20,22,25,0.04)'
                  : `${LAYER_COLORS[layer]}0c`
              }
            />
            <line
              x1="42"
              y1={y}
              x2="270"
              y2={y}
              stroke={LAYER_COLORS[layer]}
              strokeWidth={layer === 'character' ? 2 : 1}
              opacity={layer === 'character' ? 0.85 : 0.4}
            />
            <text
              x="4"
              y={y + 1}
              fill={LAYER_COLORS[layer]}
              fontFamily="Trirong, serif"
              fontSize="8"
              fontWeight="700"
            >
              {short}
            </text>
            <text
              x="4"
              y={y + 10}
              fill={INK}
              fontFamily="Noto Sans Thai, sans-serif"
              fontSize="6"
              opacity="0.45"
            >
              {laneCountCaption(confirmed[layer], pending[layer], true)}
            </text>
          </g>
        )
      })}

      {visible.character && visible.memory && (
        <TriggerCurve x1={88} y1={52} x2={118} y2={82} mini />
      )}
      {visible.character && visible.ghost && (
        <TriggerCurve x1={88} y1={52} x2={72} y2={112} mini dashed />
      )}

      {sceneMarks.map(({ s, eff, isPending, x, y }) => {
        const isCircle = eff === 'meta' || eff === 'character'
        const color = LAYER_COLORS[eff]
        const r = 6
        return (
          <g key={`node-${s.id}`}>
            {isCircle ? (
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={color}
                stroke={isPending ? INK : CREAM}
                strokeWidth={isPending ? 1.2 : 1}
                strokeDasharray={isPending ? '2 2' : undefined}
                opacity={isPending ? 0.75 : 1}
              />
            ) : (
              <path
                d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`}
                fill={color}
                stroke={isPending ? INK : CREAM}
                strokeWidth={isPending ? 1.2 : 1}
                strokeDasharray={isPending ? '2 2' : undefined}
                opacity={isPending ? 0.75 : 1}
              />
            )}
          </g>
        )
      })}

      {sceneMarks.map(({ s, eff, x, y }) => (
        <SceneLabel
          key={`label-${s.id}`}
          x={x}
          y={y}
          r={6}
          layer={eff}
          title={s.title}
          size="mini"
        />
      ))}
    </svg>
  )
}

function TriggerCurve({
  x1,
  y1,
  x2,
  y2,
  mini,
  dashed,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  mini?: boolean
  dashed?: boolean
}) {
  return (
    <path
      d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
      fill="none"
      stroke={INK}
      strokeWidth={mini ? 1 : 1.4}
      strokeDasharray={dashed ? '4 3' : undefined}
      opacity="0.45"
    />
  )
}
