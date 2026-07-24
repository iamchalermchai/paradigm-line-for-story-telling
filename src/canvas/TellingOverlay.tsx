import { ViewportPortal } from '@xyflow/react'
import { tellingChapters } from '../domain/telling'
import { useProjectStore } from '../store/projectStore'

// Approx. half a scene card, to turn a card's top-left position into its centre.
const HALF_W = 144
const HALF_H = 100

const INDIGO = '#3d4dec'
const AMBER = '#e49c4e'
const AMBER_DEEP = '#c47c2e'

interface Stop {
  letter: string
  x: number
  y: number
}

/**
 * Telling-order overlay (shown in "ลำดับเล่า" mode): a bold narration route
 * threading the chapters A→B→C with directional arrows, a lettered stop badge
 * at each chapter, and a big ghosted chapter letter behind the cluster. The
 * chronological threads are dimmed by CSS so this route reads as the hero.
 */
export function TellingOverlay() {
  const scenes = useProjectStore((s) => s.project.scenes)
  const order = useProjectStore((s) => s.project.tellingChapterOrder)
  const chapters = tellingChapters(scenes, order).filter((ch) => ch.scenes.length > 0)
  if (chapters.length === 0) return null

  const stops: Stop[] = chapters.map((ch) => {
    const xs = ch.scenes.map((s) => s.position.x + HALF_W)
    const ys = ch.scenes.map((s) => s.position.y + HALF_H)
    return {
      letter: ch.letter,
      x: xs.reduce((a, b) => a + b, 0) / xs.length,
      y: ys.reduce((a, b) => a + b, 0) / ys.length,
    }
  })

  const pad = 260
  const minX = Math.min(...stops.map((s) => s.x)) - pad
  const minY = Math.min(...stops.map((s) => s.y)) - pad
  const maxX = Math.max(...stops.map((s) => s.x)) + pad
  const maxY = Math.max(...stops.map((s) => s.y)) + pad
  const w = maxX - minX
  const h = maxY - minY
  const points = stops.map((s) => `${s.x - minX},${s.y - minY}`).join(' ')

  return (
    <ViewportPortal>
      <div style={{ position: 'absolute', transform: 'translate(0,0)', pointerEvents: 'none' }}>
        {/* Big ghosted chapter letters behind the clusters (image12 flourish) */}
        {stops.map((s) => (
          <div
            key={`ghost-${s.letter}`}
            className="font-display"
            style={{
              position: 'absolute',
              left: s.x - 100,
              top: s.y - 210,
              width: 200,
              textAlign: 'center',
              fontSize: 170,
              fontWeight: 700,
              lineHeight: 1,
              color: INDIGO,
              opacity: 0.12,
            }}
          >
            {s.letter}
          </div>
        ))}

        {/* Narration route */}
        <svg
          style={{ position: 'absolute', left: minX, top: minY, overflow: 'visible' }}
          width={w}
          height={h}
        >
          <defs>
            <marker
              id="telling-arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={AMBER_DEEP} />
            </marker>
          </defs>
          {stops.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={AMBER}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerMid="url(#telling-arrow)"
              markerEnd="url(#telling-arrow)"
            />
          )}
          {/* Lettered stop badges, always readable even where the ghost letter is behind a card */}
          {stops.map((s, i) => (
            <g key={`stop-${s.letter}`} transform={`translate(${s.x - minX}, ${s.y - minY})`}>
              <circle r={22} fill={INDIGO} stroke="#f8f6f0" strokeWidth={3} />
              <text
                x={0}
                y={1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f8f6f0"
                style={{ font: `700 24px 'Trirong', serif` }}
              >
                {s.letter}
              </text>
              {i === 0 && (
                <text
                  x={0}
                  y={40}
                  textAnchor="middle"
                  fill={AMBER_DEEP}
                  style={{ font: `700 17px 'Trirong', serif` }}
                >
                  เริ่มเล่าที่นี่
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </ViewportPortal>
  )
}
