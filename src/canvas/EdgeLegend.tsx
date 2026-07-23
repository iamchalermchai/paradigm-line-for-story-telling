import { EDGE_LABELS } from '../domain/types'
import type { EdgeType } from '../domain/types'
import { useUiStore } from '../store/uiStore'
import { EDGE_STYLE } from './edges/StoryEdge'

const EDGE_TYPES: EdgeType[] = [
  'actual_path',
  'expected_want_path',
  'better_outcome_path',
  'failure_path',
  'character_arc',
]

function LinePreview({ type }: { type: EdgeType }) {
  const style = EDGE_STYLE[type]
  return (
    <svg width="28" height="8" aria-hidden className="shrink-0">
      <line
        x1="0"
        y1="4"
        x2="28"
        y2="4"
        stroke={style.stroke}
        strokeWidth="2.5"
        strokeDasharray={style.dashed ? '5 3' : undefined}
      />
    </svg>
  )
}

/**
 * Legend for the five edge types, doubling as the picker that sets which type
 * new connections will use.
 */
export function EdgeLegend() {
  const newEdgeType = useUiStore((s) => s.newEdgeType)
  const setNewEdgeType = useUiStore((s) => s.setNewEdgeType)

  return (
    <div
      className="w-64 rounded-md bg-white/95 p-2"
      style={{ border: '1px solid rgba(20,22,25,0.18)' }}
    >
      <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-ink/45">
        ชนิดเส้น (คลิกเพื่อเลือกก่อนลากเชื่อม)
      </p>
      <ul className="space-y-0.5">
        {EDGE_TYPES.map((type) => {
          const active = type === newEdgeType
          return (
            <li key={type}>
              <button
                type="button"
                className={[
                  'flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[11px]',
                  active
                    ? 'bg-sand/40 font-semibold text-ink'
                    : 'text-ink-soft hover:bg-sand/20',
                ].join(' ')}
                aria-pressed={active}
                onClick={() => setNewEdgeType(type)}
              >
                <LinePreview type={type} />
                <span className="flex-1">{EDGE_LABELS[type]}</span>
                {active && <span aria-hidden>✓</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
