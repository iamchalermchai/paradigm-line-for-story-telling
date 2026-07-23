import { useReactFlow } from '@xyflow/react'
import { ArcSymbol } from '../canvas/nodes/SceneNode'
import { BEAT_LABELS, PHASE_LABELS, STORY_PHASES } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'

/**
 * Outline of every scene grouped by story phase. Clicking a row opens the
 * scene editor and recentres the canvas on that node — the primary way to
 * navigate and select scenes.
 */
export function SceneListPanel() {
  const scenes = useProjectStore((s) => s.project.scenes)
  const openSceneEditor = useUiStore((s) => s.openSceneEditor)
  const { setCenter } = useReactFlow()

  return (
    <div className="flex-1 overflow-y-auto p-3">
      {STORY_PHASES.map((phase) => {
        const list = scenes
          .filter((s) => s.phase === phase)
          .sort((a, b) => a.order - b.order)
        return (
          <div key={phase} className="mb-4">
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink/45">
              {PHASE_LABELS[phase]}
            </h3>
            {list.length === 0 ? (
              <p className="px-1 text-[11px] italic text-ink/35">— ยังไม่มีฉาก —</p>
            ) : (
              <ul className="space-y-0.5">
                {list.map((scene) => (
                  <li key={scene.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-ink hover:bg-sand/25"
                      onClick={() => {
                        openSceneEditor(scene.id)
                        setCenter(scene.position.x + 120, scene.position.y, {
                          zoom: 0.8,
                          duration: 400,
                        })
                      }}
                    >
                      <ArcSymbol relation={scene.arcRelation} />
                      <span className="flex-1 truncate">
                        {scene.title || 'ฉากไม่มีชื่อ'}
                      </span>
                      {scene.beat && (
                        <span className="shrink-0 text-[10px] text-ink/40">
                          {BEAT_LABELS[scene.beat]}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
