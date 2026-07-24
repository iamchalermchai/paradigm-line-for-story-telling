import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'
import { ARC_RELATION_LABELS, BEAT_LABELS } from '../../domain/types'
import type { ArcRelation } from '../../domain/types'
import { useProjectStore } from '../../store/projectStore'
import type { SceneNodeData } from '../graph'

/**
 * Small symbol per arc relation, reused from the paradigm-line visual
 * language: a filled shape means "this happened"; a dotted ring means a
 * conceptual thread (Ghost / Lie / Need) is present in the scene.
 */
export function ArcSymbol({ relation }: { relation: ArcRelation }) {
  const common = 'inline-block shrink-0'
  switch (relation) {
    case 'want':
      return (
        <span
          className={common}
          style={{ width: 9, height: 9, background: 'var(--color-rust)' }}
          aria-hidden
        />
      )
    case 'ghost':
      return (
        <span
          className={`${common} rounded-full`}
          style={{
            width: 10,
            height: 10,
            border: '1.5px dotted var(--color-rust)',
          }}
          aria-hidden
        />
      )
    case 'need':
      return (
        <span
          className={`${common} rounded-full`}
          style={{
            width: 10,
            height: 10,
            border: '1.5px dotted var(--color-mint-deep)',
          }}
          aria-hidden
        />
      )
    case 'lie':
    case 'lie_at_work':
      return (
        <span
          className={`${common} rounded-full`}
          style={{
            width: 10,
            height: 10,
            border: '1.5px dotted var(--color-ink)',
          }}
          aria-hidden
        />
      )
    default:
      return (
        <span
          className={`${common} rounded-full`}
          style={{ width: 9, height: 9, background: 'var(--color-amber)' }}
          aria-hidden
        />
      )
  }
}

function SceneNodeComponent({ data, selected }: NodeProps) {
  const { scene } = data as unknown as SceneNodeData
  const updateScene = useProjectStore((s) => s.updateScene)

  // The "Character" side of Character + Action = Plot: lead with the POV actor.
  const who =
    scene.characters.length > 0
      ? scene.characters
      : scene.povCharacter
        ? [scene.povCharacter]
        : []

  // Handles are invisible at rest (floating edges attach to the border, so a
  // dot would be redundant clutter) and fade in on hover to signal where to
  // start a connection.
  const handleClass =
    '!h-3 !w-3 !border-2 !border-cream !bg-ink/55 !opacity-0 transition-opacity duration-150 group-hover:!opacity-100'

  return (
    <div
      className="group w-72 rounded-md bg-white shadow-sm transition"
      style={{
        border: selected
          ? '2px solid var(--color-ink)'
          : '1px solid rgba(20,22,25,0.18)',
      }}
      role="group"
      aria-label={`ฉาก: ${scene.title}`}
    >
      {/* A connect point on every side — with loose connection mode each can
          be both start and end, so a thread can leave or arrive from any edge
          of the card (top included). */}
      <Handle id="top" type="source" position={Position.Top} className={handleClass} />
      <Handle id="right" type="source" position={Position.Right} className={handleClass} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={handleClass} />
      <Handle id="left" type="source" position={Position.Left} className={handleClass} />

      <div className="flex items-start justify-between gap-2 px-3 pt-2.5">
        <h3 className="font-display flex items-center gap-2 text-lg font-semibold leading-snug text-ink">
          <ArcSymbol relation={scene.arcRelation} />
          {scene.title || 'ฉากไม่มีชื่อ'}
        </h3>
        <button
          type="button"
          className="nodrag shrink-0 rounded px-1 text-sm text-ink/40 hover:bg-sand/40 hover:text-ink"
          aria-label={scene.collapsed ? 'ขยายการ์ด' : 'ย่อการ์ด'}
          onClick={(e) => {
            e.stopPropagation()
            updateScene(scene.id, { collapsed: !scene.collapsed })
          }}
        >
          {scene.collapsed ? '▸' : '▾'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pt-1 text-[12px] text-ink/55">
        {scene.tellingChapter && (
          <span
            className="font-display inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[12px] font-bold text-cream"
            style={{ background: 'var(--color-indigo)' }}
            title={`บทการเล่า ${scene.tellingChapter}`}
          >
            {scene.tellingChapter}
          </span>
        )}
        <span>{ARC_RELATION_LABELS[scene.arcRelation]}</span>
        {scene.beat && (
          <>
            <span aria-hidden>·</span>
            <span>{BEAT_LABELS[scene.beat]}</span>
          </>
        )}
        {scene.locked && (
          <>
            <span aria-hidden>·</span>
            <span>ล็อก</span>
          </>
        )}
      </div>

      {!scene.collapsed && (
        <div className="px-3 pb-3 pt-2 text-[13px] leading-snug text-ink-soft">
          {/* Character + Action = Plot, read straight off the card */}
          <div className="space-y-1">
            {who.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {who.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-sand/40 px-2 py-0.5 text-[12px] font-medium text-ink"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
            {scene.action && (
              <Line op="+" text={scene.action} />
            )}
            {scene.outcome && (
              <Line op="=" text={scene.outcome} strong />
            )}
          </div>

          {(scene.location || scene.obstacle) && (
            <div className="mt-2 space-y-0.5 border-t border-ink/10 pt-1.5 text-[12px] text-ink/50">
              {scene.location && <div>ที่: {scene.location}</div>}
              {scene.obstacle && <div>อุปสรรค: {scene.obstacle}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** One term of the Character + Action = Plot equation, led by a serif operator. */
function Line({ op, text, strong }: { op: string; text: string; strong?: boolean }) {
  return (
    <div className="flex gap-1.5">
      <span
        className="font-display shrink-0 text-base leading-tight text-ink/35"
        aria-hidden
      >
        {op}
      </span>
      <span className={`line-clamp-2 ${strong ? 'font-medium text-ink' : ''}`}>
        {text}
      </span>
    </div>
  )
}

export const SceneNode = memo(SceneNodeComponent)
