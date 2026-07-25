/**
 * PROTOTYPE — shared teaching diagram for Paradigm Line placement studies.
 * Static SVG; no store. Used by ?diagram=A|B|C variants.
 */

type Props = {
  compact?: boolean
  className?: string
}

const ARIA =
  'แผนภาพสอน Paradigm Line: Backstory ด้านซ้าย แล้ว Catalyst Want Midpoint Low Point Need Aha Climax และปลายทางได้ ไม่ได้ ได้สิ่งที่ดีกว่า'

/** Static Paradigm thesis diagram (cream/ink board language). */
export function ParadigmModelDiagram({ compact = false, className }: Props) {
  const h = compact ? 160 : 220
  return (
    <svg
      viewBox="0 0 640 240"
      width="100%"
      height={h}
      className={className}
      role="img"
      aria-label={ARIA}
      data-prototype="paradigm-diagram"
    >
      <rect width="640" height="240" fill="#f8f6f0" />

      <rect x="88" y="28" width="120" height="184" fill="rgba(20,22,25,0.04)" />
      <rect x="208" y="28" width="120" height="184" fill="rgba(20,22,25,0.02)" />
      <rect x="328" y="28" width="120" height="184" fill="rgba(20,22,25,0.06)" />
      <rect x="448" y="28" width="120" height="184" fill="rgba(20,22,25,0.02)" />

      <rect
        x="12"
        y="28"
        width="68"
        height="184"
        fill="rgba(228,156,78,0.18)"
        stroke="rgba(228,156,78,0.55)"
      />
      <text
        x="46"
        y="48"
        textAnchor="middle"
        fill="#141619"
        fontFamily="Trirong, serif"
        fontSize="9"
        fontWeight="700"
      >
        Backstory
      </text>
      {(
        [
          [78, 'Lie at Work'],
          [118, 'Lie'],
          [158, 'Ghost'],
        ] as const
      ).map(([y, label]) => (
        <g key={label}>
          <circle
            cx="46"
            cy={y}
            r="10"
            fill="none"
            stroke="#cd5042"
            strokeWidth="1.5"
            strokeDasharray="2.5 2"
          />
          <text
            x="46"
            y={y + 22}
            textAnchor="middle"
            fill="#4b4a45"
            fontFamily="Noto Sans Thai, sans-serif"
            fontSize="7"
          >
            {label}
          </text>
        </g>
      ))}

      {(
        [
          [148, '1. เริ่มต้น'],
          [268, '2. ช่วงแรก'],
          [388, '3. ช่วงกลาง'],
          [508, '4. ช่วงท้าย'],
        ] as const
      ).map(([x, label]) => (
        <text
          key={label}
          x={x}
          y="42"
          textAnchor="middle"
          fill="#141619"
          fontFamily="Trirong, serif"
          fontSize="10"
          fontWeight="700"
        >
          {label}
        </text>
      ))}

      <line
        x1="88"
        y1="120"
        x2="568"
        y2="120"
        stroke="#141619"
        strokeWidth="2"
      />

      <BeatDot cx={130} cy={120} label="Catalyst" color="#e49c4e" />
      <BeatSquare cx={230} cy={120} label="Want" color="#cd5042" />
      <BeatTick cx={340} cy={120} label="Midpoint" />
      <BeatTick cx={400} cy={120} label="Low Point" />
      <circle
        cx="430"
        cy="168"
        r="11"
        fill="none"
        stroke="#cd5042"
        strokeWidth="1.5"
        strokeDasharray="2.5 2"
      />
      <text
        x="430"
        y="190"
        textAnchor="middle"
        fill="#141619"
        fontFamily="Trirong, serif"
        fontSize="9"
        fontWeight="700"
      >
        Need
      </text>
      <BeatDot cx={470} cy={120} label="Aha!" color="#e49c4e" />
      <BeatTick cx={520} cy={120} label="Climax" />

      <path
        d="M138 112 C160 88, 200 88, 220 112"
        fill="none"
        stroke="#3d4dec"
        strokeWidth="1.6"
      />
      <text
        x="175"
        y="84"
        textAnchor="middle"
        fill="#3d4dec"
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="8"
      >
        ลังเล
      </text>

      <path
        d="M238 112 C280 70, 320 70, 348 112 C370 145, 390 175, 420 168"
        fill="none"
        stroke="#3d4dec"
        strokeWidth="2"
      />
      <text
        x="300"
        y="66"
        textAnchor="middle"
        fill="#3d4dec"
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="8"
      >
        ดูเหมือนได้ผล
      </text>
      <text
        x="375"
        y="158"
        textAnchor="middle"
        fill="#3d4dec"
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="8"
      >
        ปัญหาใหญ่ขึ้น
      </text>

      <path
        d="M438 160 C450 140, 458 130, 468 122"
        fill="none"
        stroke="#3d4dec"
        strokeWidth="2"
      />
      <path
        d="M478 112 C500 95, 530 88, 560 78"
        fill="none"
        stroke="#3d4dec"
        strokeWidth="2"
      />

      <path
        d="M238 108 C300 40, 480 40, 560 52"
        fill="none"
        stroke="#3d4dec"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      <Outcome x={572} y={44} color="#3d4dec" label="ได้" />
      <Outcome x={572} y={74} color="#2f9c6c" label="ได้สิ่งที่ดีกว่า" />
      <Outcome x={572} y={104} color="#cd5042" label="ไม่ได้" />
    </svg>
  )
}

function BeatDot({
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
  return (
    <g>
      <circle cx={cx} cy={cy} r="7" fill={color} />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill="#141619"
        fontFamily="Trirong, serif"
        fontSize="9"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  )
}

function BeatSquare({
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
  return (
    <g>
      <rect x={cx - 7} y={cy - 7} width="14" height="14" fill={color} />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill="#141619"
        fontFamily="Trirong, serif"
        fontSize="9"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  )
}

function BeatTick({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g>
      <rect x={cx - 1.5} y={cy - 10} width="3" height="20" fill="#141619" />
      <text
        x={cx}
        y={cy - 16}
        textAnchor="middle"
        fill="#141619"
        fontFamily="Trirong, serif"
        fontSize="8"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  )
}

function Outcome({
  x,
  y,
  color,
  label,
}: {
  x: number
  y: number
  color: string
  label: string
}) {
  return (
    <g>
      <rect x={x} y={y} width="14" height="14" fill={color} />
      <text
        x={x + 18}
        y={y + 11}
        fill="#141619"
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="8"
      >
        {label}
      </text>
    </g>
  )
}
