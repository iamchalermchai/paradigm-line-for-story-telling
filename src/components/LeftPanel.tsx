import { useState } from 'react'
import type { Backstory } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { ClimaxOutcomePanel } from './ClimaxOutcomePanel'
import { SceneListPanel } from './SceneListPanel'

const FIELD_ORDER: (keyof Backstory)[] = ['ghost', 'lie', 'lieAtWork', 'want', 'need']
const FIELD_LABEL: Record<keyof Backstory, string> = {
  ghost: 'Ghost',
  lie: 'Lie',
  lieAtWork: 'Lie at Work',
  want: 'Want',
  need: 'Need',
}

type Section = 'backstory' | 'story'

/** Small symbol per backstory field, echoing the paradigm-line node language. */
export function FieldIcon({ field }: { field: keyof Backstory }) {
  if (field === 'want') {
    return (
      <span
        className="inline-block shrink-0"
        style={{ width: 14, height: 14, background: 'var(--color-rust)' }}
        aria-hidden
      />
    )
  }
  const color =
    field === 'need'
      ? 'var(--color-mint-deep)'
      : field === 'ghost'
        ? 'var(--color-rust)'
        : 'var(--color-ink)'
  return (
    <span
      className="inline-block shrink-0 rounded-full bg-cream"
      style={{ width: 16, height: 16, border: `2px dotted ${color}` }}
      aria-hidden
    />
  )
}

/** One folder / document tab. The active tab merges into the panel below it. */
function DocTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'flex-1 rounded-t-md px-3 py-2 text-sm font-bold',
        active ? 'bg-white text-ink' : 'bg-sand/70 text-ink/55 hover:bg-sand/90',
      ].join(' ')}
      style={{
        position: 'relative',
        zIndex: active ? 2 : 1,
        marginBottom: active ? -1 : 0,
        border: '1px solid rgba(20,22,25,0.18)',
        borderBottom: active ? '1px solid white' : '1px solid rgba(20,22,25,0.18)',
        boxShadow: active ? '0 -2px 4px rgba(20,22,25,0.08)' : undefined,
      }}
    >
      {children}
    </button>
  )
}

/** Backstory tab: every arc field always editable, plus the climax outcome. */
function BackstoryTabBody() {
  const backstory = useProjectStore((s) => s.project.backstory)
  const updateBackstory = useProjectStore((s) => s.updateBackstory)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-3 p-3">
        {FIELD_ORDER.map((key) => (
          <label key={key} className="block">
            <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <FieldIcon field={key} />
              {FIELD_LABEL[key]}
            </span>
            <textarea
              className="w-full resize-y rounded p-2 text-[13px] text-ink focus:outline-none"
              style={{ border: '1px solid rgba(20,22,25,0.2)' }}
              rows={3}
              value={backstory[key]}
              aria-label={FIELD_LABEL[key]}
              onChange={(e) => updateBackstory({ [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(20,22,25,0.12)' }}>
        <ClimaxOutcomePanel />
      </div>
    </div>
  )
}

/**
 * The left panel: two document tabs. "Backstory" holds the always-editable
 * character-arc fields and the climax outcome; "Story Action" holds the scene
 * outline, where clicking a row selects the scene and recentres the canvas.
 */
export function LeftPanel() {
  const [section, setSection] = useState<Section>('story')
  const sceneCount = useProjectStore((s) => s.project.scenes.length)

  return (
    <aside
      className="flex w-72 shrink-0 flex-col overflow-hidden bg-sand/40"
      style={{ borderRight: '1px solid rgba(20,22,25,0.18)' }}
      aria-label="Backstory และ Story Action"
    >
      <div className="flex gap-1 px-2 pt-2" role="tablist" aria-label="แผงด้านซ้าย">
        <DocTab active={section === 'backstory'} onClick={() => setSection('backstory')}>
          Backstory
        </DocTab>
        <DocTab active={section === 'story'} onClick={() => setSection('story')}>
          Story Action · {sceneCount}
        </DocTab>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col bg-white"
        style={{
          borderLeft: '1px solid rgba(20,22,25,0.18)',
          borderRight: '1px solid rgba(20,22,25,0.18)',
          borderBottom: '1px solid rgba(20,22,25,0.18)',
          margin: '0 8px 8px',
        }}
      >
        {section === 'backstory' ? <BackstoryTabBody /> : <SceneListPanel />}
      </div>
    </aside>
  )
}
