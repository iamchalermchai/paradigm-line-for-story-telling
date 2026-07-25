/**
 * Per-structure teaching diagrams for the ดูภาพ tab.
 * Same visual language as the live board (cream / ink axis / beat shapes / StoryEdges).
 * Each encodes that template's engine — not a reused Paradigm Want/Need map.
 */

import { ParadigmModelDiagram } from './ParadigmModelDiagram'
import {
  AMBER,
  AxisLine,
  BeatCircle,
  BeatDotted,
  BeatSquare,
  BeatTick,
  DiagramCanvas,
  INK,
  MINT,
  PathNote,
  PhaseColumns,
  RUST,
  StoryPath,
} from './diagramPrimitives'

type Props = {
  templateId: string
  compact?: boolean
  className?: string
}

const META: Record<
  string,
  { title: string; blurb: string; aria: string }
> = {
  'four-phase': {
    title: 'แผนภาพสอน · Paradigm',
    blurb:
      'เส้นทึบ = เหตุการณ์จริง · เส้นประ = ทางลัด Want ไป «ได้» · เส้นมิ้นต์ = ผ่าน Need ไป «ได้สิ่งที่ดีกว่า»',
    aria: 'แผนภาพสอน 4 Phase Paradigm Line',
  },
  'three-act': {
    title: 'แผนภาพสอน · Three Act',
    blurb:
      'เปิดปัญหา → ยืดการปะทะ → ปิดด้วย Climax · Midpoint พลิกจากตั้งรับเป็นรุก',
    aria: 'แผนภาพสอน Three Act: Setup Confrontation Resolution',
  },
  'save-the-cat': {
    title: 'แผนภาพสอน · Save the Cat',
    blurb:
      'Opening คู่ Final · ส่งคำสัญญาใน Fun & Games แล้วพังที่ All Is Lost ก่อนลุกใน Finale',
    aria: 'แผนภาพสอน Save the Cat: Opening ถึง Final Image',
  },
  kishotenketsu: {
    title: 'แผนภาพสอน · Kishōtenketsu',
    blurb:
      'ไม่มีเครื่องยนต์ Want/Need — พลังอยู่ที่ 転 ที่ทำให้ 起–承 มีความหมายใหม่ แล้ว 結 วางสองภาพไว้ข้างกัน',
    aria: 'แผนภาพสอน Kishōtenketsu: 起承転結',
  },
  'heros-journey': {
    title: "แผนภาพสอน · Hero's Journey",
    blurb:
      'เส้นทึบ = การผจญภัยภายนอก · เส้นประ = การเปลี่ยนภายใน · จุดต่ำสุดคือ Ordeal ก่อนกลับพร้อม Elixir',
    aria: "แผนภาพสอน Hero's Journey: Departure Initiation Return",
  },
}

export function structureDiagramMeta(templateId: string) {
  return (
    META[templateId] ?? {
      title: 'แผนภาพสอน',
      blurb: 'ยังไม่มีแผนภาพสำหรับโครงนี้ — ใช้อ่านแกนที่แท็บเส้น',
      aria: 'แผนภาพสอน',
    }
  )
}

export function hasStructureDiagram(templateId: string): boolean {
  return templateId in META
}

/** Pick the teaching diagram for the active structure template. */
export function StructureTeachingDiagram({
  templateId,
  compact = false,
  className,
}: Props) {
  if (templateId === 'four-phase') {
    return <ParadigmModelDiagram compact={compact} className={className} />
  }
  if (templateId === 'three-act') {
    return <ThreeActDiagram compact={compact} className={className} />
  }
  if (templateId === 'save-the-cat') {
    return <SaveTheCatDiagram compact={compact} className={className} />
  }
  if (templateId === 'kishotenketsu') {
    return <KishotenketsuDiagram compact={compact} className={className} />
  }
  if (templateId === 'heros-journey') {
    return <HerosJourneyDiagram compact={compact} className={className} />
  }
  return null
}

const X0 = 24
const W = 672
const Y = 130

function ThreeActDiagram({
  compact,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const meta = META['three-act']
  const fx = (f: number) => X0 + f * W
  const inciting = fx(0.12)
  const pp1 = fx(0.26)
  const mid = fx(0.5)
  const pp2 = fx(0.75)
  const climax = fx(0.88)
  const resolve = fx(0.96)

  return (
    <DiagramCanvas compact={compact} className={className} aria={meta.aria}>
      <PhaseColumns
        x0={X0}
        width={W}
        labels={['Act 1 · Setup', 'Act 2 · Confrontation', 'Act 3 · Resolution']}
        starts={[0, 0.25, 0.75]}
      />
      <AxisLine x1={X0} x2={X0 + W} y={Y} />

      {/* Rising stakes — stays above the line, peaks at Climax, settles at Resolve */}
      <StoryPath
        d={[
          `M ${inciting} ${Y}`,
          `C ${fx(0.18)} ${Y - 18}, ${fx(0.22)} ${Y - 28}, ${pp1} ${Y - 8}`,
          `C ${fx(0.36)} 78, ${fx(0.42)} 70, ${mid} 86`,
          `C ${fx(0.6)} 64, ${fx(0.68)} 58, ${pp2} 72`,
          `C ${fx(0.82)} 52, ${fx(0.85)} 48, ${climax} 56`,
          `C ${fx(0.92)} 78, ${fx(0.94)} ${Y - 6}, ${resolve} ${Y}`,
        ].join(' ')}
        width={1.9}
      />

      <PathNote x={fx(0.2)} y={Y - 40}>
        เปิดปัญหา
      </PathNote>
      <PathNote x={fx(0.48)} y={58}>
        stake สูงขึ้น
      </PathNote>
      <PathNote x={fx(0.9)} y={40} color={MINT}>
        ตอบคำถามหลัก
      </PathNote>

      <BeatCircle cx={inciting} label="Inciting" y={Y} />
      <BeatTick cx={pp1} label="PP1" y={Y} />
      <BeatTick cx={mid} label="Midpoint" y={Y} />
      <BeatTick cx={pp2} label="PP2" y={Y} />
      <BeatTick cx={climax} label="Climax" y={Y} />
      <BeatCircle cx={resolve} label="Resolve" y={Y} color={MINT} />
    </DiagramCanvas>
  )
}

function SaveTheCatDiagram({
  compact,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const meta = META['save-the-cat']
  const fx = (f: number) => X0 + f * W
  // Landmark beats only — teaching plate, not all 15 Blake Snyder beats
  const open = fx(0.05)
  const catalyst = fx(0.16)
  const break2 = fx(0.24)
  const fun = fx(0.37)
  const mid = fx(0.5)
  const lost = fx(0.66)
  const break3 = fx(0.8)
  const final = fx(0.95)

  return (
    <DiagramCanvas compact={compact} className={className} aria={meta.aria}>
      <PhaseColumns
        x0={X0}
        width={W}
        labels={['Act 1 · Setup', 'Fun & Games', 'Bad Guys Close In', 'Finale']}
        starts={[0, 0.2, 0.5, 0.75]}
      />
      <AxisLine x1={X0} x2={X0 + W} y={Y} />

      {/* Opening ↔ Final — high dashed echo */}
      <StoryPath
        d={`M ${open} ${Y - 2} C ${fx(0.32)} 38, ${fx(0.68)} 38, ${final} ${Y - 2}`}
        dashed
        color={INK}
        width={1.35}
      />

      {/* Promise through Fun → Mid → crash → Finale (blue peak sits under the dashed echo) */}
      <StoryPath
        d={`M ${catalyst} ${Y} C ${break2} ${Y - 14}, ${fun} 96, ${mid} ${Y}`}
        width={1.9}
      />
      <StoryPath
        d={`M ${mid} ${Y} C ${fx(0.58)} 178, ${fx(0.62)} 186, ${lost} ${Y}`}
        color={RUST}
        width={1.9}
      />
      <StoryPath
        d={`M ${lost} ${Y} C ${break3} 96, ${fx(0.88)} 90, ${final} ${Y}`}
        color={MINT}
        width={1.9}
      />

      {/* Notes: คำสัญญา sits on the blue arc band (y≈82), not on the dashed echo (y≈38) */}
      <PathNote x={fun} y={82}>
        คำสัญญาเรื่อง
      </PathNote>
      <PathNote x={fx(0.58)} y={198} color={RUST}>
        พังจนว่าง
      </PathNote>
      <PathNote x={fx(0.84)} y={34} color={MINT}>
        คู่ Opening
      </PathNote>

      {/* Every beat label below the axis — avoids the dashed echo + path notes above */}
      <BeatCircle cx={open} label="Opening" y={Y} />
      <BeatCircle cx={catalyst} label="Catalyst" y={Y} />
      <BeatTick cx={break2} label="Break 2" y={Y} />
      <BeatCircle cx={fun} label="Fun" y={Y} />
      <BeatTick cx={mid} label="Mid" y={Y} />
      <BeatSquare cx={lost} label="All Is Lost" y={Y} />
      <BeatTick cx={break3} label="Break 3" y={Y} />
      <BeatCircle cx={final} label="Final" y={Y} color={MINT} />
    </DiagramCanvas>
  )
}

function KishotenketsuDiagram({
  compact,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const meta = META.kishotenketsu
  const fx = (f: number) => X0 + f * W
  return (
    <DiagramCanvas compact={compact} className={className} aria={meta.aria}>
      <PhaseColumns
        x0={X0}
        width={W}
        labels={['起 Ki · เปิดโลก', '承 Shō · ขยาย', '転 Ten · พลิก', '結 Ketsu · คลี่']}
      />
      <AxisLine x1={X0} x2={X0 + W} y={Y} />

      {/* Quiet world */}
      <StoryPath
        d={`M ${fx(0.125)} ${Y} C ${fx(0.22)} 110, ${fx(0.3)} 110, ${fx(0.375)} ${Y}`}
        dashed
        width={1.6}
      />
      {/* Twist */}
      <StoryPath
        d={`M ${fx(0.375)} ${Y} C ${fx(0.48)} ${Y}, ${fx(0.55)} 78, ${fx(0.625)} ${Y}`}
        color={RUST}
        width={2.2}
      />
      {/* Settle — two frames side by side */}
      <StoryPath
        d={`M ${fx(0.625)} ${Y} C ${fx(0.72)} 160, ${fx(0.8)} 90, ${fx(0.875)} ${Y}`}
        color={MINT}
      />

      <PathNote x={fx(0.25)} y={88} color="#4b4a45">
        เงียบ · จริง
      </PathNote>
      <PathNote x={fx(0.55)} y={64} color={RUST}>
        ความหมายพลิก
      </PathNote>
      <PathNote x={fx(0.82)} y={72} color={MINT}>
        วางสองภาพ
      </PathNote>

      <BeatCircle cx={fx(0.125)} label="起" y={Y} />
      <BeatCircle cx={fx(0.375)} label="承" y={Y} />
      <BeatTick cx={fx(0.625)} label="転" y={Y} />
      <BeatCircle cx={fx(0.875)} label="結" y={Y} color={MINT} />

      <text
        x={X0 + W / 2}
        y={232}
        textAnchor="middle"
        fill="#4b4a45"
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="10"
      >
        ไม่มีผู้ชนะ / ไม่บังคับ Want–Need
      </text>
    </DiagramCanvas>
  )
}

function HerosJourneyDiagram({
  compact,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const meta = META['heros-journey']
  const fx = (f: number) => X0 + f * W
  // Landmark beats spaced for readable labels (not all 12 Campbell beats)
  const ordinary = fx(0.08)
  const call = fx(0.16)
  const threshold = fx(0.27)
  const ordeal = fx(0.51)
  const reward = fx(0.62)
  const resurrect = fx(0.78)
  const elixir = fx(0.93)

  return (
    <DiagramCanvas compact={compact} className={className} aria={meta.aria}>
      <PhaseColumns
        x0={X0}
        width={W}
        labels={['Departure', 'Initiation', 'Return']}
        starts={[0, 0.25, 0.75]}
      />
      <AxisLine x1={X0} x2={X0 + W} y={Y} />

      {/* Outer adventure — above the line, touches Ordeal on the axis */}
      <StoryPath
        d={`M ${ordinary} ${Y} C ${call} 86, ${threshold} 68, ${fx(0.4)} 74 C ${fx(0.46)} 96, ${ordeal} ${Y}, ${ordeal} ${Y} C ${reward} 86, ${resurrect} 74, ${elixir} ${Y}`}
      />
      {/* Inner change — dashed, deepest under Ordeal */}
      <StoryPath
        d={`M ${call} ${Y + 4} C ${threshold} 168, ${fx(0.4)} 202, ${ordeal} 208 C ${reward} 178, ${resurrect} 152, ${elixir} ${Y + 4}`}
        dashed
        color={RUST}
        width={1.6}
      />

      <PathNote x={fx(0.34)} y={56}>
        ผจญภัยภายนอก
      </PathNote>
      <PathNote x={ordeal} y={228} color={RUST}>
        เปลี่ยนภายใน
      </PathNote>
      <PathNote x={fx(0.88)} y={62} color={MINT}>
        กลับพร้อม Elixir
      </PathNote>

      <BeatCircle cx={ordinary} label="Ordinary" y={Y} />
      <BeatCircle cx={call} label="Call" y={Y} labelSide="above" />
      <BeatTick cx={threshold} label="Threshold" y={Y} />
      <BeatTick cx={ordeal} label="Ordeal" y={Y} labelSide="above" />
      <BeatSquare cx={reward} label="Reward" y={Y} color={AMBER} />
      <BeatTick cx={resurrect} label="Resurrection" y={Y} labelSide="above" />
      <BeatCircle cx={elixir} label="Elixir" y={Y} color={MINT} />
    </DiagramCanvas>
  )
}
