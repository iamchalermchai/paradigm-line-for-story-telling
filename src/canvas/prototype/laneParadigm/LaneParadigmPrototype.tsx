/**
 * PROTOTYPE — lane mode vs Paradigm Line: replace, metadata, or overlay?
 *
 * Question: เปิด「เลนการเล่า」ควรแทนแกน Y ของบอร์ดหลัก หรือซ้อน metadata อย่างเดียว?
 *
 * Switch: ?laneParadigm=A|B|C · npm run prototype:lane-paradigm
 * Not production — no store writes.
 */

import type { ReactNode } from 'react'
import { PrototypeSwitcher } from '../PrototypeSwitcher'
import { useSearchParam } from '../useSearchParam'

export const LANE_PARADIGM_VARIANTS = ['A', 'B', 'C'] as const
export type LaneParadigmVariant = (typeof LANE_PARADIGM_VARIANTS)[number]

export const LANE_PARADIGM_LABELS: Record<LaneParadigmVariant, string> = {
  A: 'สลับมุมมอง (prod ตอนนี้)',
  B: 'Metadata — Paradigm อยู่',
  C: 'ซ้อน — สองแกน Y พร้อมกัน',
}

const INK = '#141619'
const CREAM = '#f8f6f0'
const RUST = '#cd5042'
const MINT = '#2f9c6c'
const INDIGO = '#3d4dec'
const AMBER = '#e49c4e'

type MockCard = {
  id: string
  title: string
  arc: 'want' | 'ghost' | 'neutral'
  layer: 'meta' | 'character' | 'memory' | 'ghost'
}

const MOCK: MockCard[] = [
  { id: '1', title: 'แอลทักชายปริศนา', arc: 'want', layer: 'character' },
  { id: '2', title: 'flashback วัยเด็ก', arc: 'ghost', layer: 'memory' },
  { id: '3', title: 'เสียงรุ่นพี่ในใจ', arc: 'ghost', layer: 'ghost' },
]

const LAYER_COLOR: Record<MockCard['layer'], string> = {
  meta: INK,
  character: INDIGO,
  memory: MINT,
  ghost: RUST,
}

const LAYER_Y: Record<MockCard['layer'], number> = {
  meta: 48,
  character: 118,
  memory: 188,
  ghost: 258,
}

const PARADIGM_Y = 140
const ABOVE_Y = 80
const BELOW_Y = 200

function arcY(arc: MockCard['arc']): number {
  if (arc === 'want') return ABOVE_Y
  if (arc === 'ghost') return BELOW_Y
  return PARADIGM_Y + 30
}

/** Mount when ?laneParadigm= is set (DEV only). */
export function LaneParadigmPrototypeHost() {
  if (!import.meta.env.DEV) return null
  const [raw, setRaw] = useSearchParam('laneParadigm', '')
  if (!raw || !LANE_PARADIGM_VARIANTS.includes(raw as LaneParadigmVariant)) {
    return null
  }
  const variant = raw as LaneParadigmVariant

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[75] flex items-center justify-center bg-ink/35 p-3"
        data-prototype="lane-paradigm-host"
      >
        <div
          className="pointer-events-auto flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-md bg-cream shadow-lg"
          style={{ border: '2px solid rgba(20,22,25,0.22)' }}
        >
          <header className="shrink-0 border-b border-ink/10 px-4 py-3">
            <p className="text-[10px] font-semibold tracking-wide text-ink/45">
              PROTOTYPE · lane vs Paradigm Y
            </p>
            <h2 className="font-display text-lg font-bold text-ink">
              {variant} — {LANE_PARADIGM_LABELS[variant]}
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-ink/55">
              เปรียบ 3 แนวหลัง grilling: เลนแทน Paradigm · metadata อย่างเดียว ·
              ซ้อนสองแกน · ← → สลับ · ไม่เขียน store
            </p>
            <button
              type="button"
              className="mt-2 text-[11px] text-ink/45 hover:text-ink"
              onClick={() => setRaw('')}
            >
              ปิด prototype
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {variant === 'A' && <VariantA />}
            {variant === 'B' && <VariantB />}
            {variant === 'C' && <VariantC />}
          </div>

          <StatePanel variant={variant} />
        </div>
      </div>

      <PrototypeSwitcher
        variants={[...LANE_PARADIGM_VARIANTS]}
        current={variant}
        labels={LANE_PARADIGM_LABELS}
        onChange={setRaw}
      />
    </>
  )
}

function StatePanel({ variant }: { variant: LaneParadigmVariant }) {
  const thesis =
    variant === 'A'
      ? 'Thesis: laneMode เปิด = Paradigm หาย · Y snap เข้าเลน · arcRelation ค้างบนการ์ดแต่ไม่ขับ Y'
      : variant === 'B'
        ? 'Thesis: Paradigm เป็น master ของ Y · storyLayer = chip + แท็บ เลน · ไม่แตะ position.y'
        : 'Thesis: Y ยังตาม arc · เส้นเลนจางเป็น guide · layer = สีขอบ + chip'

  return (
    <footer className="shrink-0 space-y-2 border-t border-ink/10 px-4 py-3 text-[11px] text-ink/60">
      <p className="leading-snug">{thesis}</p>
      <table className="w-full text-left text-[10px]">
        <thead>
          <tr className="text-ink/45">
            <th className="pb-1 pr-2">การ์ด</th>
            <th className="pb-1 pr-2">arc</th>
            <th className="pb-1 pr-2">layer</th>
            <th className="pb-1">Y บน mock</th>
          </tr>
        </thead>
        <tbody>
          {MOCK.map((c) => (
            <tr key={c.id} className="border-t border-ink/8">
              <td className="py-1 pr-2 font-medium text-ink/80">{c.title}</td>
              <td className="py-1 pr-2">{c.arc}</td>
              <td className="py-1 pr-2" style={{ color: LAYER_COLOR[c.layer] }}>
                {c.layer}
              </td>
              <td className="py-1 tabular-nums">
                {variant === 'A' && `lane ${LAYER_Y[c.layer]}`}
                {variant === 'B' && `paradigm ${arcY(c.arc)}`}
                {variant === 'C' && `paradigm ${arcY(c.arc)} + ${c.layer}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </footer>
  )
}

function MiniBoard({
  children,
  caption,
}: {
  children: ReactNode
  caption: string
}) {
  return (
    <div>
      <svg
        viewBox="0 0 520 300"
        width="100%"
        className="block rounded"
        role="img"
        aria-label={caption}
        style={{
          border: '1px solid rgba(20,22,25,0.14)',
          background: CREAM,
        }}
      >
        {/* phase dividers */}
        {[0, 130, 260, 390].map((x) => (
          <line
            key={x}
            x1={x}
            y1={0}
            x2={x}
            y2={300}
            stroke={INK}
            strokeOpacity={0.15}
          />
        ))}
        {children}
      </svg>
      <p className="mt-2 text-[11px] leading-snug text-ink/55">{caption}</p>
    </div>
  )
}

function MockCardNode({
  card,
  x,
  y,
  showArcChip,
  borderColor,
}: {
  card: MockCard
  x: number
  y: number
  showArcChip?: boolean
  borderColor?: string
}) {
  const w = 100
  const h = 44
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        rx={4}
        fill="white"
        stroke={borderColor ?? INK}
        strokeWidth={borderColor ? 3 : 1.5}
        strokeOpacity={0.85}
      />
      <text x={8} y={18} fontSize={9} fontWeight={700} fill={INK}>
        {card.title.slice(0, 14)}
      </text>
      {card.layer !== 'character' && (
        <text x={8} y={32} fontSize={8} fill={LAYER_COLOR[card.layer]} fontWeight={700}>
          {card.layer.toUpperCase()}
        </text>
      )}
      {showArcChip && (
        <text x={w - 8} y={14} fontSize={7} fill={RUST} textAnchor="end">
          {card.arc}
        </text>
      )}
    </g>
  )
}

/** A — current prod: lanes replace paradigm on canvas */
function VariantA() {
  const lanes: MockCard['layer'][] = ['meta', 'character', 'memory', 'ghost']
  return (
    <MiniBoard caption="laneMode ON → เส้น Paradigm หาย · การ์ด snap Y ตาม layer · beat ลอย (prod bug)">
      {lanes.map((layer) => (
        <g key={layer}>
          <line
            x1={0}
            y1={LAYER_Y[layer]}
            x2={520}
            y2={LAYER_Y[layer]}
            stroke={LAYER_COLOR[layer]}
            strokeWidth={layer === 'character' ? 2.5 : 1}
            strokeOpacity={layer === 'character' ? 0.85 : 0.4}
          />
          <text
            x={6}
            y={LAYER_Y[layer] - 4}
            fontSize={9}
            fontWeight={700}
            fill={LAYER_COLOR[layer]}
            opacity={0.8}
          >
            {layer.toUpperCase()}
          </text>
        </g>
      ))}
      <text x={260} y={16} fontSize={10} fill={INK} opacity={0.4} textAnchor="middle">
        (ไม่มี Paradigm Line)
      </text>
      <circle cx={200} cy={PARADIGM_Y - 12} r={5} fill={AMBER} opacity={0.5} />
      <text x={210} y={PARADIGM_Y - 8} fontSize={7} fill={INK} opacity={0.45}>
        beat ลอย
      </text>
      <MockCardNode card={MOCK[0]} x={180} y={LAYER_Y.character - 22} />
      <MockCardNode card={MOCK[1]} x={320} y={LAYER_Y.memory - 22} />
      <MockCardNode card={MOCK[2]} x={420} y={LAYER_Y.ghost - 22} />
    </MiniBoard>
  )
}

/** B — metadata only: paradigm drives Y, layer is chip + rail */
function VariantB() {
  return (
    <MiniBoard caption="laneMode = metadata · Paradigm Y ตาม arc · layer แสดงชิป + แท็บ เลน (mini map) · ไม่ snap Y">
      <line
        x1={0}
        y1={PARADIGM_Y}
        x2={520}
        y2={PARADIGM_Y}
        stroke={INK}
        strokeWidth={3}
      />
      <text x={8} y={PARADIGM_Y - 8} fontSize={9} fontWeight={700} fill={INK} opacity={0.6}>
        ↑ Lie/Want · ↓ Ghost/Need
      </text>
      <MockCardNode card={MOCK[0]} x={160} y={ABOVE_Y - 22} showArcChip />
      <MockCardNode card={MOCK[1]} x={300} y={BELOW_Y - 22} showArcChip />
      <MockCardNode card={MOCK[2]} x={400} y={BELOW_Y - 22} showArcChip />
      <rect
        x={8}
        y={240}
        width={140}
        height={52}
        rx={4}
        fill="white"
        stroke="rgba(43,122,140,0.5)"
        strokeWidth={1}
      />
      <text x={16} y={256} fontSize={8} fontWeight={700} fill="#2b7a8c">
        แท็บ เลน (mini map)
      </text>
      <text x={16} y={270} fontSize={7} fill={INK} opacity={0.5}>
        4 ชั้น · ไม่แตะ Y บนกระดาน
      </text>
    </MiniBoard>
  )
}

/** C — dual overlay: paradigm Y + faint lane guides */
function VariantC() {
  const lanes: MockCard['layer'][] = ['meta', 'character', 'memory', 'ghost']
  return (
    <MiniBoard caption="Paradigm ขับ Y · เส้นเลนจางเป็น guide · layer = สีขอบการ์ด · อ่านสองมิติพร้อมกัน">
      {lanes.map((layer) => (
        <line
          key={layer}
          x1={0}
          y1={LAYER_Y[layer]}
          x2={520}
          y2={LAYER_Y[layer]}
          stroke={LAYER_COLOR[layer]}
          strokeWidth={1}
          strokeDasharray="4 4"
          strokeOpacity={0.25}
        />
      ))}
      <line
        x1={0}
        y1={PARADIGM_Y}
        x2={520}
        y2={PARADIGM_Y}
        stroke={INK}
        strokeWidth={3}
      />
      <MockCardNode
        card={MOCK[0]}
        x={160}
        y={ABOVE_Y - 22}
        borderColor={LAYER_COLOR.character}
        showArcChip
      />
      <MockCardNode
        card={MOCK[1]}
        x={300}
        y={BELOW_Y - 22}
        borderColor={LAYER_COLOR.memory}
        showArcChip
      />
      <MockCardNode
        card={MOCK[2]}
        x={400}
        y={BELOW_Y - 22}
        borderColor={LAYER_COLOR.ghost}
        showArcChip
      />
    </MiniBoard>
  )
}
