/**
 * PROTOTYPE — should a layered META/CHARACTER/MEMORY/GHOST axis live on the board?
 *
 * Question: do four Y-lanes + cross-lane triggers read on cream paper —
 * without replacing the default Paradigm Line for every structure?
 *
 * Switch with ?layers=A|B|C (see README.md). Not production UI.
 */

import { PrototypeSwitcher } from '../PrototypeSwitcher'
import { useSearchParam } from '../useSearchParam'

export const LAYER_VARIANTS = ['A', 'B', 'C'] as const
export type LayerVariant = (typeof LAYER_VARIANTS)[number]

export const LAYER_LABELS: Record<LayerVariant, string> = {
  A: 'สี่เลนเท่ากัน',
  B: 'CHARACTER เป็นแกน',
  C: 'ไม่มีแถบ — สี+รูป',
}

const INK = '#141619'
const CREAM = '#f8f6f0'
const RUST = '#cd5042'
const MINT = '#2f9c6c'
const INDIGO = '#3d4dec'
const AMBER = '#e49c4e'

/** Mount over the board when ?layers= is set (DEV). */
export function LayeredBoardPrototypeHost() {
  if (!import.meta.env.DEV) return null
  const [raw, setRaw] = useSearchParam('layers', '')
  if (!raw || !LAYER_VARIANTS.includes(raw as LayerVariant)) return null
  const variant = raw as LayerVariant

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center bg-ink/30 p-3"
        data-prototype="layered-board-host"
      >
        <div
          className="pointer-events-auto flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-md bg-cream shadow-lg"
          style={{ border: '2px solid rgba(20,22,25,0.22)' }}
        >
          <header className="flex shrink-0 items-baseline justify-between gap-2 border-b border-ink/10 px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-ink/45">
                PROTOTYPE · layered axis
              </p>
              <h2 className="font-display text-lg font-bold text-ink">
                {variant} — {LAYER_LABELS[variant]}
              </h2>
              <p className="mt-0.5 text-[11px] text-ink/55">
                เครื่องยนต์ META / CHARACTER / MEMORY / GHOST · สลับ ← → · ไม่เขียน
                store
              </p>
            </div>
            <button
              type="button"
              className="text-[11px] text-ink/45 hover:text-ink"
              onClick={() => setRaw('')}
            >
              ปิด
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {variant === 'A' && <VariantA />}
            {variant === 'B' && <VariantB />}
            {variant === 'C' && <VariantC />}
          </div>
          <p className="shrink-0 border-t border-ink/10 px-4 py-2 text-[11px] leading-snug text-ink/50">
            {variant === 'A' &&
              'Thesis: เลนชัดเหมือนโน้ตเพลง — อ่านชั้นก่อน อ่านเรื่องทีหลัง'}
            {variant === 'B' &&
              'Thesis: ยังรู้สึกเป็น Paradigm Line แต่มีความลึกใต้เส้นเป็น MEMORY/GHOST'}
            {variant === 'C' &&
              'Thesis: ไม่กินพื้นที่ด้วยแถบเลน — รูปโหนดกับเส้นบอกชั้นแทน'}
          </p>
        </div>
      </div>
      <PrototypeSwitcher
        variants={[...LAYER_VARIANTS]}
        current={variant}
        labels={LAYER_LABELS}
        onChange={setRaw}
      />
    </>
  )
}

// ─── A: four equal lanes (closest to reference) ─────────────────────────────

function VariantA() {
  const lanes = [
    { id: 'meta', y: 48, label: 'META', hint: 'ผู้เล่า · ระยะห่าง' },
    { id: 'char', y: 118, label: 'CHARACTER', hint: 'เหตุการณ์หลัก' },
    { id: 'mem', y: 188, label: 'MEMORY', hint: 'ความทรงจำที่ถูกกระตุ้น' },
    { id: 'ghost', y: 258, label: 'GHOST', hint: 'แผลที่ตามหลอกหลอน' },
  ]
  return (
    <svg viewBox="0 0 720 300" width="100%" className="block" role="img" aria-label="สี่เลนเท่ากัน">
      <rect width="720" height="300" fill={CREAM} />
      {lanes.map((lane, i) => (
        <g key={lane.id}>
          <rect
            x="88"
            y={lane.y - 28}
            width="620"
            height="56"
            fill={i % 2 === 0 ? 'rgba(20,22,25,0.04)' : 'rgba(205,80,66,0.06)'}
          />
          <line
            x1="88"
            y1={lane.y}
            x2="708"
            y2={lane.y}
            stroke={INK}
            strokeWidth={lane.id === 'char' ? 2.5 : 1.25}
            opacity={lane.id === 'char' ? 0.9 : 0.35}
          />
          <text
            x="12"
            y={lane.y - 4}
            fill={INK}
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
            {lane.hint}
          </text>
        </g>
      ))}

      {/* META circles */}
      <Circle cx={180} cy={48} label="เล่า 18 วัน" />
      <Circle cx={420} cy={48} label="ทุกอย่างผ่านไป" color={INK} />

      {/* CHARACTER spine */}
      <path
        d="M140 118 C220 118, 260 118, 320 118 C400 118, 480 118, 560 118 C620 118, 660 118, 680 118"
        fill="none"
        stroke={INK}
        strokeWidth="2"
      />
      <Circle cx={200} cy={118} label="ฉัน+มิวสิก" color={INDIGO} />
      <Circle cx={360} cy={118} label="ฉัน+หญิงสาว" color="#d4789c" />
      <Circle cx={520} cy={118} label="ดีเจวิทยุ" color={AMBER} />

      {/* MEMORY diamonds */}
      <Diamond cx={280} cy={188} label="วัยเด็ก" color={MINT} />
      <Diamond cx={440} cy={188} label="ผู้หญิงคนนั้น" color={AMBER} />

      {/* GHOST diamonds */}
      <Diamond cx={300} cy={258} label="ผู้หญิงคนนั้น" color={RUST} />
      <Diamond cx={460} cy={258} label="พี่ชาย" color={MINT} />
      <Diamond cx={580} cy={258} label="ฉัน" color={INDIGO} />

      {/* Triggers */}
      <Trigger x1={200} y1={118} x2={280} y2={188} />
      <Trigger x1={360} y1={118} x2={440} y2={188} />
      <Trigger x1={360} y1={118} x2={300} y2={258} dashed />
      <Trigger x1={520} y1={118} x2={580} y2={258} dashed />
    </svg>
  )
}

// ─── B: CHARACTER as paradigm spine; depth below ────────────────────────────

function VariantB() {
  const axisY = 130
  return (
    <svg viewBox="0 0 720 300" width="100%" className="block" role="img" aria-label="CHARACTER เป็นแกน">
      <rect width="720" height="300" fill={CREAM} />
      {/* META strip */}
      <rect x="40" y="24" width="640" height="44" fill="rgba(20,22,25,0.05)" />
      <text
        x="52"
        y="42"
        fill={INK}
        fontFamily="Trirong, serif"
        fontSize="10"
        fontWeight="700"
        opacity="0.55"
      >
        META · ผู้เล่ารู้ว่ากำลังเล่า
      </text>
      <Circle cx={200} cy={52} label="เล่า 18 วัน" r={7} />
      <Circle cx={400} cy={52} label="ทุกอย่างผ่านไป" r={7} color={INK} />

      {/* CHARACTER axis */}
      <line x1="40" y1={axisY} x2="680" y2={axisY} stroke={INK} strokeWidth="3" />
      <text
        x="48"
        y={axisY - 14}
        fill={INK}
        fontFamily="Trirong, serif"
        fontSize="11"
        fontWeight="700"
      >
        CHARACTER
      </text>
      <Circle cx={180} cy={axisY} label="ฉัน+มิวสิก" color={INDIGO} />
      <Circle cx={340} cy={axisY} label="ฉัน+หญิงสาว" color="#d4789c" />
      <Circle cx={500} cy={axisY} label="ดีเจวิทยุ" color={AMBER} />

      {/* MEMORY / GHOST field */}
      <text
        x="48"
        y="188"
        fill={INK}
        fontFamily="Trirong, serif"
        fontSize="10"
        fontWeight="700"
        opacity="0.55"
      >
        MEMORY
      </text>
      <text
        x="48"
        y="248"
        fill={INK}
        fontFamily="Trirong, serif"
        fontSize="10"
        fontWeight="700"
        opacity="0.55"
      >
        GHOST
      </text>
      <Diamond cx={260} cy={200} label="วัยเด็ก" color={MINT} />
      <Diamond cx={400} cy={200} label="ผู้หญิงคนนั้น" color={AMBER} />
      <Diamond cx={280} cy={260} label="ผู้หญิงคนนั้น" color={RUST} />
      <Diamond cx={440} cy={260} label="พี่ชาย" color={MINT} />
      <Diamond cx={560} cy={260} label="ฉัน" color={INDIGO} />

      <Trigger x1={180} y1={axisY} x2={260} y2={200} />
      <Trigger x1={340} y1={axisY} x2={400} y2={200} />
      <Trigger x1={340} y1={axisY} x2={280} y2={260} dashed />
      <Trigger x1={500} y1={axisY} x2={560} y2={260} dashed />
    </svg>
  )
}

// ─── C: no lane bands — shape + stroke encode layer ─────────────────────────

function VariantC() {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_200px]">
      <svg viewBox="0 0 520 280" width="100%" className="block" role="img" aria-label="ไม่มีแถบเลน">
        <rect width="520" height="280" fill={CREAM} />
        <line x1="40" y1="140" x2="480" y2="140" stroke={INK} strokeWidth="2" opacity="0.25" />

        <Circle cx={100} cy={60} label="เล่า 18 วัน" color={INK} />
        <Circle cx={220} cy={140} label="ฉัน+มิวสิก" color={INDIGO} />
        <Circle cx={320} cy={140} label="ฉัน+หญิงสาว" color="#d4789c" />
        <Circle cx={420} cy={140} label="ดีเจวิทยุ" color={AMBER} />
        <Diamond cx={250} cy={210} label="วัยเด็ก" color={MINT} />
        <Diamond cx={340} cy={220} label="ผู้หญิง" color={RUST} />
        <Diamond cx={430} cy={230} label="พี่ชาย" color={MINT} />

        <path
          d="M220 140 C240 140, 240 210, 250 210"
          fill="none"
          stroke={INDIGO}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d="M320 140 C330 140, 335 220, 340 220"
          fill="none"
          stroke={RUST}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d="M100 60 C160 80, 200 120, 220 140"
          fill="none"
          stroke={INK}
          strokeWidth="1.2"
          opacity="0.4"
        />
      </svg>
      <ul className="space-y-2 text-[11px] text-ink/70">
        <LegendDot color={INK} shape="circle" label="META — วงดำ" />
        <LegendDot color={INDIGO} shape="circle" label="CHARACTER — วงสี" />
        <LegendDot color={MINT} shape="diamond" label="MEMORY — เพชร" />
        <LegendDot color={RUST} shape="diamond" label="GHOST — เพชร" />
        <li className="pt-1 leading-snug text-ink/50">
          เส้นประ = กระตุ้นความทรงจำ / ดึงแผล · ไม่มีแถบเลนกินพื้นที่กระดาน
        </li>
      </ul>
    </div>
  )
}

// ─── primitives ─────────────────────────────────────────────────────────────

function Circle({
  cx,
  cy,
  label,
  color = AMBER,
  r = 9,
}: {
  cx: number
  cy: number
  label: string
  color?: string
  r?: number
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke={CREAM} strokeWidth="1.5" />
      <text
        x={cx}
        y={cy - r - 6}
        textAnchor="middle"
        fill={INK}
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="9"
        fontWeight="600"
      >
        {label}
      </text>
    </g>
  )
}

function Diamond({
  cx,
  cy,
  label,
  color,
}: {
  cx: number
  cy: number
  label: string
  color: string
}) {
  const s = 9
  return (
    <g>
      <path
        d={`M ${cx} ${cy - s} L ${cx + s} ${cy} L ${cx} ${cy + s} L ${cx - s} ${cy} Z`}
        fill={color}
        stroke={CREAM}
        strokeWidth="1.5"
      />
      <text
        x={cx}
        y={cy + s + 12}
        textAnchor="middle"
        fill={INK}
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="9"
        fontWeight="600"
      >
        {label}
      </text>
    </g>
  )
}

function Trigger({
  x1,
  y1,
  x2,
  y2,
  dashed,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  dashed?: boolean
}) {
  return (
    <path
      d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
      fill="none"
      stroke={INK}
      strokeWidth="1.4"
      strokeDasharray={dashed ? '4 3' : undefined}
      opacity="0.55"
    />
  )
}

function LegendDot({
  color,
  shape,
  label,
}: {
  color: string
  shape: 'circle' | 'diamond'
  label: string
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="inline-block shrink-0"
        style={
          shape === 'circle'
            ? { width: 10, height: 10, borderRadius: 999, background: color }
            : {
                width: 10,
                height: 10,
                background: color,
                transform: 'rotate(45deg)',
              }
        }
        aria-hidden
      />
      <span>{label}</span>
    </li>
  )
}
