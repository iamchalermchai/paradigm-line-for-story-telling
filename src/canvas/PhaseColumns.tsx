import { ViewportPortal } from '@xyflow/react'
import { PHASE_WIDTH } from '../domain/seed'
import { PARADIGM_LINE_Y, PHASE_LABELS, STORY_PHASES } from '../domain/types'

const TOP = -1000
const BOTTOM = 1200
const HEIGHT = BOTTOM - TOP
const BOARD_WIDTH = PHASE_WIDTH * STORY_PHASES.length

const INK_FAINT = 'rgba(20,22,25,0.14)'
const INK_MUTED = 'rgba(20,22,25,0.45)'

/**
 * Static background drawn in flow coordinates (so it pans/zooms with the
 * nodes): four phase columns and the horizontal paradigm line. Kept to a
 * plain cream field with thin ink dividers so colour is reserved for scenes,
 * beats and edges.
 */
export function PhaseColumns() {
  return (
    <ViewportPortal>
      <div
        style={{
          position: 'absolute',
          transform: `translate(0px, ${TOP}px)`,
          width: BOARD_WIDTH,
          height: HEIGHT,
          pointerEvents: 'none',
        }}
      >
        {STORY_PHASES.map((phase, i) => (
          <div
            key={phase}
            style={{
              position: 'absolute',
              left: i * PHASE_WIDTH,
              top: 0,
              width: PHASE_WIDTH,
              height: HEIGHT,
              borderRight:
                i < STORY_PHASES.length - 1
                  ? `1px dashed ${INK_FAINT}`
                  : undefined,
              borderLeft: i === 0 ? `1px dashed ${INK_FAINT}` : undefined,
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 10,
                padding: '6px 12px',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--color-ink)',
                textAlign: 'center',
              }}
            >
              {PHASE_LABELS[phase]}
            </div>
          </div>
        ))}

        {/* Paradigm line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: PARADIGM_LINE_Y - TOP,
            width: BOARD_WIDTH,
            height: 0,
            borderTop: '3px solid var(--color-ink)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: PARADIGM_LINE_Y - TOP - 40,
            fontSize: 11,
            color: INK_MUTED,
          }}
        >
          ↑ เหนือเส้น: ขับเคลื่อนด้วย Lie / Want
        </div>
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: PARADIGM_LINE_Y - TOP + 12,
            fontSize: 11,
            color: INK_MUTED,
          }}
        >
          ↓ ใต้เส้น: Ghost / ความล้มเหลว / Need
        </div>
      </div>
    </ViewportPortal>
  )
}
