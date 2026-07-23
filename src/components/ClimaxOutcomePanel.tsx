import {
  NEED_OUTCOME_LABELS,
  WANT_OUTCOME_LABELS,
} from '../domain/types'
import type { NeedOutcome, WantOutcome } from '../domain/types'
import { useProjectStore } from '../store/projectStore'

const WANT_OPTIONS = Object.keys(WANT_OUTCOME_LABELS) as WantOutcome[]
const NEED_OPTIONS = Object.keys(NEED_OUTCOME_LABELS) as NeedOutcome[]

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
      style={{ width: 12, height: 12, background: color }}
      aria-hidden
    />
  )
}

/** Controls for the climax result — Want outcome and Need (character arc). */
export function ClimaxOutcomePanel() {
  const outcome = useProjectStore((s) => s.project.climaxOutcome)
  const setClimaxOutcome = useProjectStore((s) => s.setClimaxOutcome)

  return (
    <div className="px-4 py-3">
      <h2 className="mb-2 text-sm font-bold text-ink">ผลลัพธ์ตอนจบ</h2>

      <label className="mb-2 block text-[13px] text-ink/60">
        Want (Climax)
        <div className="mt-1 flex items-center gap-2">
          <Swatch color={WANT_COLOR[outcome.want]} />
          <select
            className="w-full rounded bg-white px-2 py-1 text-sm text-ink"
            style={{ border: '1px solid rgba(20,22,25,0.25)' }}
            value={outcome.want}
            onChange={(e) =>
              setClimaxOutcome({ want: e.target.value as WantOutcome })
            }
          >
            {WANT_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {WANT_OUTCOME_LABELS[w]}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label className="block text-[13px] text-ink/60">
        Need (Character Arc)
        <div className="mt-1 flex items-center gap-2">
          <Swatch color={NEED_COLOR[outcome.need]} />
          <select
            className="w-full rounded bg-white px-2 py-1 text-sm text-ink"
            style={{ border: '1px solid rgba(20,22,25,0.25)' }}
            value={outcome.need}
            onChange={(e) =>
              setClimaxOutcome({ need: e.target.value as NeedOutcome })
            }
          >
            {NEED_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {NEED_OUTCOME_LABELS[n]}
              </option>
            ))}
          </select>
        </div>
      </label>
    </div>
  )
}
