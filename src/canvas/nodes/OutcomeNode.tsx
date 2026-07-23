import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'
import {
  NEED_OUTCOME_LABELS,
  WANT_OUTCOME_LABELS,
} from '../../domain/types'
import type { NeedOutcome, WantOutcome } from '../../domain/types'
import type { OutcomeNodeData } from '../graph'

const WANT_COLOR: Record<WantOutcome, string> = {
  got: 'var(--color-indigo)',
  not_got: 'var(--color-rust)',
  got_better: 'var(--color-mint-deep)',
}

const NEED_COLOR: Record<NeedOutcome, string> = {
  gained: 'var(--color-mint-deep)',
  rejected: 'var(--color-rust)',
  understood_not_yet: 'var(--color-sand-dark)',
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block shrink-0"
      style={{ width: 14, height: 14, background: color }}
      aria-hidden
    />
  )
}

function OutcomeNodeComponent({ data }: NodeProps) {
  const { project } = data as unknown as OutcomeNodeData
  const { want, need } = project.climaxOutcome

  return (
    <div
      className="w-64 rounded-md bg-white p-3"
      style={{ border: '1px solid rgba(20,22,25,0.18)' }}
      role="group"
      aria-label="ผลลัพธ์ตอนจบ"
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border !border-cream !bg-ink/40"
      />
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink/50">
        ผลลัพธ์ตอนจบ
      </h3>
      <div className="space-y-1.5 text-sm text-ink">
        <div className="flex items-center gap-2">
          <Swatch color={WANT_COLOR[want]} />
          <span>
            <span className="font-semibold">Want:</span>{' '}
            {WANT_OUTCOME_LABELS[want]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Swatch color={NEED_COLOR[need]} />
          <span>
            <span className="font-semibold">Need:</span>{' '}
            {NEED_OUTCOME_LABELS[need]}
          </span>
        </div>
      </div>
    </div>
  )
}

export const OutcomeNode = memo(OutcomeNodeComponent)
