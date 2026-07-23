import { ViewportPortal } from '@xyflow/react'
import { PHASE_WIDTH } from '../domain/seed'
import { getStructureTemplate } from '../domain/structure'
import { PARADIGM_LINE_Y, STORY_PHASES } from '../domain/types'
import { useProjectStore } from '../store/projectStore'

const TOP = -1000
const BOTTOM = 1200
const HEIGHT = BOTTOM - TOP
const BOARD_WIDTH = PHASE_WIDTH * STORY_PHASES.length

const INK_FAINT = 'rgba(20,22,25,0.14)'
const INK_MUTED = 'rgba(20,22,25,0.45)'

/**
 * Static background drawn in flow coordinates (so it pans/zooms with the
 * nodes): the vertical structure bands of the selected template and the
 * horizontal paradigm line. Kept to a plain cream field with thin ink
 * dividers so colour is reserved for scenes, beats and edges.
 */
export function PhaseColumns() {
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const template = getStructureTemplate(structureId)
  const bands = template.bands

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
        {bands.map((band, i) => {
          const left = band.start * BOARD_WIDTH
          const right = (bands[i + 1]?.start ?? 1) * BOARD_WIDTH
          return (
            <div
              key={`${template.id}-${band.label}`}
              style={{
                position: 'absolute',
                left,
                top: 0,
                width: right - left,
                height: HEIGHT,
                borderRight:
                  i < bands.length - 1 ? `1px dashed ${INK_FAINT}` : undefined,
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
                {band.label}
              </div>
            </div>
          )
        })}

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
