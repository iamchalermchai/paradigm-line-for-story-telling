/**
 * Teaching diagram for 4 Phase — miniature of the live board:
 * sand Backstory, Thai phases, ink axis, amber/rust/mint beats,
 * indigo StoryEdges + mint Need detour, climax outcome stamps.
 */

import {
  AMBER,
  AxisLine,
  BackstoryStrip,
  BeatCircle,
  BeatDotted,
  BeatSquare,
  BeatTick,
  DiagramCanvas,
  INDIGO,
  INK,
  MINT,
  OutcomeStamp,
  PathNote,
  PhaseColumns,
  RUST,
  StoryPath,
} from './diagramPrimitives'

const X0 = 72
const W = 648
const Y = 128

export function ParadigmModelDiagram({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const fx = (f: number) => X0 + f * W

  const catalyst = fx(0.16)
  const want = fx(0.25)
  const peak = fx(0.38) // Things Go Well — peak of the arc (like a scene above the line)
  const peakY = 68
  const mid = fx(0.5)
  const low = fx(0.64)
  const need = fx(0.72)
  const needY = 196
  const aha = fx(0.78)
  const climax = fx(0.9)
  const gotX = fx(0.86)
  const gotY = 78

  return (
    <DiagramCanvas
      compact={compact}
      className={className}
      aria="แผนภาพสอน Paradigm Line"
    >
      <BackstoryStrip />
      <PhaseColumns
        x0={X0}
        width={W}
        labels={['1. เริ่มต้น', '2. ช่วงแรก', '3. ช่วงกลาง', '4. ช่วงท้าย']}
      />
      <AxisLine x1={X0} x2={X0 + W} y={Y} />

      {/* Want shortcut — dashed indigo, peak → ได้ */}
      <StoryPath
        d={`M ${peak} ${peakY} C ${fx(0.55)} 40, ${fx(0.72)} 44, ${gotX} ${gotY}`}
        dashed
        color={INDIGO}
        width={1.7}
      />

      {/* Actual path: Catalyst → Want → peak → Low → Aha → ได้ */}
      <StoryPath
        d={[
          `M ${catalyst} ${Y}`,
          `Q ${(catalyst + want) / 2} ${Y - 32} ${want} ${Y}`,
          `C ${fx(0.3)} ${Y - 20}, ${fx(0.33)} ${peakY + 8}, ${peak} ${peakY}`,
          `C ${fx(0.44)} ${peakY + 10}, ${mid} ${Y + 8}, ${low} ${Y}`,
          `C ${fx(0.7)} ${Y - 4}, ${fx(0.74)} ${Y - 8}, ${aha} ${Y}`,
          `C ${fx(0.82)} ${Y - 28}, ${fx(0.84)} ${gotY + 4}, ${gotX} ${gotY}`,
        ].join(' ')}
        color={INDIGO}
        width={1.9}
      />

      {/* Need detour — soft U under the line, not a sharp V */}
      <StoryPath
        d={`M ${low} ${Y} C ${fx(0.67)} ${Y + 36}, ${fx(0.68)} ${needY - 6}, ${need} ${needY} C ${fx(0.75)} ${needY - 6}, ${fx(0.76)} ${Y + 28}, ${aha} ${Y}`}
        color={MINT}
        width={1.9}
      />

      <PathNote x={(catalyst + want) / 2} y={Y - 40}>
        ลังเล
      </PathNote>
      <PathNote x={peak} y={peakY - 16}>
        ดูเหมือนได้ผล
      </PathNote>
      <PathNote x={fx(0.52)} y={Y + 36} color={INK}>
        ปัญหาใหญ่ขึ้น
      </PathNote>

      {/* Peak marker (Things Go Well) — amber disc above the line */}
      <circle cx={peak} cy={peakY} r="9" fill={AMBER} />
      <text
        x={peak}
        y={peakY + 22}
        textAnchor="middle"
        fill={INK}
        fontFamily="Trirong, serif"
        fontSize="9"
        fontWeight="700"
      >
        Go Well
      </text>

      <BeatCircle cx={catalyst} label="Catalyst" y={Y} />
      <BeatSquare cx={want} label="Want" y={Y} />
      <BeatTick cx={mid} label="Midpoint" y={Y} />
      <BeatCircle cx={low} label="Low Point" y={Y} />
      <BeatDotted cx={need} label="Need" y={needY} color={MINT} />
      <BeatCircle cx={aha} label="Aha!" y={Y} />
      <BeatTick cx={climax} label="Climax" y={Y} />

      {/* Outcomes in phase 4 — ได้ is the path endpoint; others are the board key */}
      <g>
        <rect x={gotX - 8} y={gotY - 8} width="16" height="16" rx="2" fill={INDIGO} />
        <text
          x={gotX + 14}
          y={gotY + 4}
          fill={INK}
          fontFamily="Noto Sans Thai, sans-serif"
          fontSize="10"
          fontWeight="600"
        >
          ได้
        </text>
      </g>
      <OutcomeStamp x={gotX - 8} y={gotY + 22} color={MINT} label="ได้สิ่งที่ดีกว่า" />
      <OutcomeStamp x={climax - 8} y={Y + 28} color={RUST} label="ไม่ได้" />
    </DiagramCanvas>
  )
}
