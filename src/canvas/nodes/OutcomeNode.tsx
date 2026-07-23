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

/** A labelled destination marker: a solid square (echoing the reference boards'
 *  ได้/ไม่ได้/ได้สิ่งที่ดีกว่า endpoints) with the role and outcome beside it. */
function OutcomeMarker({
  color,
  role,
  label,
}: {
  color: string
  role: string
  label: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 inline-block shrink-0 rounded-sm"
        style={{ width: 22, height: 22, background: color }}
        aria-hidden
      />
      <div className="leading-tight">
        <div className="font-display text-base font-bold text-ink">{role}</div>
        <div className="text-sm text-ink/70">{label}</div>
      </div>
    </div>
  )
}

function OutcomeNodeComponent({ data }: NodeProps) {
  const { project } = data as unknown as OutcomeNodeData
  const { want, need } = project.climaxOutcome

  return (
    <div
      className="w-56"
      role="group"
      aria-label="ผลลัพธ์ตอนจบ"
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <p className="font-display mb-2.5 border-b border-ink/15 pb-1.5 text-sm font-bold tracking-wide text-ink/55">
        ปลายทาง · ผลลัพธ์ตอนจบ
      </p>
      <div className="space-y-3">
        <OutcomeMarker
          color={WANT_COLOR[want]}
          role="Want"
          label={WANT_OUTCOME_LABELS[want]}
        />
        <OutcomeMarker
          color={NEED_COLOR[need]}
          role="Need"
          label={NEED_OUTCOME_LABELS[need]}
        />
      </div>
    </div>
  )
}

export const OutcomeNode = memo(OutcomeNodeComponent)
