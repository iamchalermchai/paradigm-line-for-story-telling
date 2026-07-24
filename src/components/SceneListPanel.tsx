import { useReactFlow } from '@xyflow/react'
import { ArcSymbol } from '../canvas/nodes/SceneNode'
import { PHASE_WIDTH } from '../domain/seed'
import { bandIndexForX, getStructureTemplate } from '../domain/structure'
import { tellingChapters } from '../domain/telling'
import { BEAT_LABELS, STORY_PHASES } from '../domain/types'
import type { StoryScene } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'

const BOARD_WIDTH = PHASE_WIDTH * STORY_PHASES.length

interface Group {
  label: string
  scenes: StoryScene[]
}

/**
 * Outline of every scene. In chronological mode it groups by the structure
 * template's bands (derived from x-position); in telling mode it groups by
 * telling chapter (A→B→C), so the list mirrors whichever order the board shows.
 * Clicking a row opens the editor and recentres the canvas on that node.
 */
export function SceneListPanel() {
  const scenes = useProjectStore((s) => s.project.scenes)
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const openSceneEditor = useUiStore((s) => s.openSceneEditor)
  const viewMode = useUiStore((s) => s.viewMode)
  const { setCenter } = useReactFlow()

  const template = getStructureTemplate(structureId)

  let groups: Group[]
  if (viewMode === 'telling') {
    groups = tellingChapters(scenes).map((ch) => ({
      label: `บท ${ch.letter}`,
      scenes: [...ch.scenes].sort((a, b) => a.position.x - b.position.x),
    }))
    const unassigned = scenes.filter((s) => !s.tellingChapter)
    if (unassigned.length) groups.push({ label: 'ยังไม่กำหนดบท', scenes: unassigned })
  } else {
    groups = template.bands.map((band, index) => ({
      label: band.label,
      scenes: scenes
        .filter(
          (s) => bandIndexForX(s.position.x / BOARD_WIDTH, template) === index,
        )
        .sort((a, b) => a.position.x - b.position.x),
    }))
  }

  return (
    <div className="flex-1 overflow-y-auto p-3">
      {groups.map((group) => (
        <div key={group.label} className="mb-4">
          <h3 className="font-display mb-1 text-sm font-bold tracking-wide text-ink/55">
            {group.label}
          </h3>
          {group.scenes.length === 0 ? (
            <p className="px-1 text-xs italic text-ink/35">ยังไม่มีฉากในช่วงนี้</p>
          ) : (
            <ul className="space-y-0.5">
              {group.scenes.map((scene) => (
                <li key={scene.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-ink hover:bg-sand/25"
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
                      <span className="shrink-0 text-[11px] text-ink/40">
                        {BEAT_LABELS[scene.beat]}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
