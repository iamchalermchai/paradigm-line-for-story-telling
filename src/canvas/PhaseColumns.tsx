import { ViewportPortal } from '@xyflow/react'
import { BOARD_WIDTH, getStructureTemplate } from '../domain/structure'
import { PARADIGM_LINE_Y } from '../domain/types'
import { useProjectStore } from '../store/projectStore'

// Rough card footprint + breathing room, used to size the frame around content.
const CARD_W = 300
const CARD_H = 320
const MARGIN_X = 500
const MARGIN_Y = 260

const INK_DIVIDER = 'rgba(20,22,25,0.28)'
const INK_MUTED = 'rgba(20,22,25,0.45)'

/**
 * Background drawn in flow coordinates: the vertical act dividers, the act
 * labels, and the horizontal paradigm line. The frame grows to cover whatever
 * content exists, so the paradigm line always runs the full width of the board
 * (and the columns the full height) no matter how far cards are dragged or how
 * many are added — it's never a fixed short stub.
 */
export function PhaseColumns() {
  const scenes = useProjectStore((s) => s.project.scenes)
  const beats = useProjectStore((s) => s.project.beats)
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const template = getStructureTemplate(structureId)
  const bands = template.bands

  // --- Content bounds (with a fixed baseline so an empty board still frames well) ---
  const sceneX = scenes.map((s) => s.position.x)
  const sceneY = scenes.map((s) => s.position.y)
  const beatX = beats.map((b) => b.position.x)

  const right =
    Math.max(BOARD_WIDTH + 700, ...sceneX.map((x) => x + CARD_W), ...beatX) +
    MARGIN_X
  const left = Math.min(0, ...sceneX, ...beatX) - MARGIN_X
  const top = Math.min(-600, ...sceneY) - MARGIN_Y
  const bottom = Math.max(600, ...sceneY.map((y) => y + CARD_H)) + MARGIN_Y

  const frameW = right - left
  const frameH = bottom - top

  // Act boundary x-positions (absolute) — fixed fractions of the conceptual board.
  const boundaries = [0, ...bands.slice(1).map((b) => b.start * BOARD_WIDTH)]

  return (
    <ViewportPortal>
      <div
        style={{
          position: 'absolute',
          transform: `translate(${left}px, ${top}px)`,
          width: frameW,
          height: frameH,
          pointerEvents: 'none',
        }}
      >
        {/* Vertical act dividers, full frame height */}
        {boundaries.map((x, i) => (
          <div
            key={`divider-${i}`}
            style={{
              position: 'absolute',
              left: x - left,
              top: 0,
              width: 0,
              height: frameH,
              borderLeft: `1.5px solid ${INK_DIVIDER}`,
            }}
          />
        ))}

        {/* Act labels, centred over each act's conceptual region and pinned to
            the top of the viewport as you pan */}
        {bands.map((band, i) => {
          const bandLeft = band.start * BOARD_WIDTH
          const bandRight = (bands[i + 1]?.start ?? 1) * BOARD_WIDTH
          return (
            <div
              key={`${template.id}-${band.label}`}
              style={{
                position: 'absolute',
                left: bandLeft - left,
                top: 0,
                width: bandRight - bandLeft,
                height: frameH,
              }}
            >
              <div
                className="font-display"
                style={{
                  position: 'sticky',
                  top: 12,
                  padding: '4px 12px',
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '0.005em',
                  color: 'var(--color-ink)',
                  textAlign: 'center',
                }}
              >
                {band.label}
              </div>
            </div>
          )
        })}

        {/* Paradigm line — spans the full frame width */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: PARADIGM_LINE_Y - top,
            width: frameW,
            height: 0,
            borderTop: '3px solid var(--color-ink)',
          }}
        />

        {/* Axis labels anchored at the visible left edge of the board */}
        <div
          className="font-display"
          style={{
            position: 'absolute',
            left: 16 - left,
            top: PARADIGM_LINE_Y - top - 108,
            fontSize: 15,
            fontWeight: 600,
            fontStyle: 'italic',
            color: INK_MUTED,
          }}
        >
          Paradigm Line
        </div>
        <div
          style={{
            position: 'absolute',
            left: 16 - left,
            top: PARADIGM_LINE_Y - top - 74,
            width: 300,
          }}
        >
          <div
            className="font-display"
            style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-ink)' }}
          >
            ↑ เหนือเส้น
          </div>
          <div style={{ fontSize: 13, color: INK_MUTED }}>
            สิ่งที่ตัวละครไล่ตาม — Lie · Want
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 16 - left,
            top: PARADIGM_LINE_Y - top + 16,
            width: 300,
          }}
        >
          <div
            className="font-display"
            style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-ink)' }}
          >
            ↓ ใต้เส้น
          </div>
          <div style={{ fontSize: 13, color: INK_MUTED }}>
            ความจริงที่ต้องเรียนรู้ — Ghost · Need
          </div>
        </div>
      </div>
    </ViewportPortal>
  )
}
