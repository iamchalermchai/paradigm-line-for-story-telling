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

  const handleClass = '!h-2.5 !w-2.5 !border !border-cream !bg-ink/40'

  return (
    <div
      className="w-72 rounded-md bg-white shadow-sm transition"
      style={{
        border: selected
          ? '2px solid var(--color-ink)'
          : '1px solid rgba(20,22,25,0.18)',
      }}
      role="group"
      aria-label={`ฉาก: ${scene.title}`}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />
      <Handle type="source" position={Position.Right} className={handleClass} />

      <div className="flex items-start justify-between gap-2 px-3 pt-2.5">
        <h3 className="flex items-center gap-2 text-base font-semibold leading-snug text-ink">
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
            <span>🔒 ล็อก</span>
          </>
        )}
      </div>

      {!scene.collapsed && (
        <dl className="space-y-1 px-3 pb-3 pt-2 text-[13px] leading-snug text-ink-soft">
          {scene.location && <Row label="สถานที่" value={scene.location} />}
          {scene.action && <Row label="ทำ" value={scene.action} />}
          {scene.obstacle && <Row label="อุปสรรค" value={scene.obstacle} />}
          {scene.outcome && <Row label="ผลลัพธ์" value={scene.outcome} />}
        </dl>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="shrink-0 font-medium text-ink/45">{label}:</dt>
      <dd className="line-clamp-2">{value}</dd>
    </div>
  )
}

export const SceneNode = memo(SceneNodeComponent)
