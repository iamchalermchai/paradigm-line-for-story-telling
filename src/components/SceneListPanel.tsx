import { useReactFlow } from '@xyflow/react'
import { useState } from 'react'
import { ArcSymbol } from '../canvas/nodes/SceneNode'
import { PHASE_WIDTH } from '../domain/seed'
import { bandIndexForX, getStructureTemplate } from '../domain/structure'
import { tellingChapters, tellingOrderKeys } from '../domain/telling'
import { BEAT_LABELS, STORY_PHASES } from '../domain/types'
import type { StoryScene } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'

const BOARD_WIDTH = PHASE_WIDTH * STORY_PHASES.length

type Dragged = { kind: 'scene' | 'chapter'; id: string } | null

/**
 * Scene outline. Chronological mode groups by structure band; telling mode
 * groups by telling chapter and is fully drag-arrangeable — drag a scene row to
 * move it between chapters, drag a chapter header to reorder the telling
 * sequence (letters relabel automatically), and add chapters with a button.
 */
export function SceneListPanel() {
  const scenes = useProjectStore((s) => s.project.scenes)
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const chapterOrder = useProjectStore((s) => s.project.tellingChapterOrder)
  const chapterNotes = useProjectStore((s) => s.project.tellingChapterNotes)
  const updateScene = useProjectStore((s) => s.updateScene)
  const addTellingChapter = useProjectStore((s) => s.addTellingChapter)
  const reorderTellingChapters = useProjectStore((s) => s.reorderTellingChapters)
  const setChapterNote = useProjectStore((s) => s.setChapterNote)
  const openSceneEditor = useUiStore((s) => s.openSceneEditor)
  const viewMode = useUiStore((s) => s.viewMode)
  const { setCenter } = useReactFlow()

  const [dragged, setDragged] = useState<Dragged>(null)
  const [openNote, setOpenNote] = useState<string | null>(null)

  function selectScene(scene: StoryScene) {
    openSceneEditor(scene.id)
    setCenter(scene.position.x + 120, scene.position.y, { zoom: 0.8, duration: 400 })
  }

  function SceneRow({ scene, draggable }: { scene: StoryScene; draggable: boolean }) {
    return (
      <button
        type="button"
        draggable={draggable}
        onDragStart={() => setDragged({ kind: 'scene', id: scene.id })}
        onDragEnd={() => setDragged(null)}
        className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-ink hover:bg-sand/25"
        onClick={() => selectScene(scene)}
      >
        {draggable && <span className="shrink-0 select-none text-ink/30" aria-hidden>⠿</span>}
        <ArcSymbol relation={scene.arcRelation} />
        <span className="flex-1 truncate">{scene.title || 'ฉากไม่มีชื่อ'}</span>
        {scene.beat && (
          <span className="shrink-0 text-[11px] text-ink/40">{BEAT_LABELS[scene.beat]}</span>
        )}
      </button>
    )
  }

  // --- Chronological mode ---
  if (viewMode !== 'telling') {
    const template = getStructureTemplate(structureId)
    const groups = template.bands.map((band, index) => ({
      label: band.label,
      scenes: scenes
        .filter((s) => bandIndexForX(s.position.x / BOARD_WIDTH, template) === index)
        .sort((a, b) => a.position.x - b.position.x),
    }))
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
                    <SceneRow scene={scene} draggable={false} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )
  }

  // --- Telling mode (drag-arrangeable) ---
  const chapters = tellingChapters(scenes, chapterOrder)
  const unassigned = scenes.filter((s) => !s.tellingChapter)

  function dropOnChapter(targetKey: string | null) {
    const d = dragged
    setDragged(null)
    if (!d) return
    if (d.kind === 'scene') {
      updateScene(d.id, { tellingChapter: targetKey ?? undefined })
      return
    }
    // Reorder chapters: materialise the effective order, then move the key.
    if (d.kind === 'chapter' && targetKey && d.id !== targetKey) {
      const eff = tellingOrderKeys(scenes, chapterOrder).filter((k) => k !== d.id)
      const idx = eff.indexOf(targetKey)
      eff.splice(idx < 0 ? eff.length : idx, 0, d.id)
      reorderTellingChapters(eff)
    }
  }

  const dropProps = (key: string | null) => ({
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      dropOnChapter(key)
    },
  })

  return (
    <div className="flex-1 overflow-y-auto p-3">
      {chapters.map((ch) => (
        <div
          key={ch.key}
          className="mb-3 rounded-md"
          style={{ border: '1px dashed rgba(20,22,25,0.18)' }}
          {...dropProps(ch.key)}
        >
          <div
            draggable
            onDragStart={() => setDragged({ kind: 'chapter', id: ch.key })}
            onDragEnd={() => setDragged(null)}
            className="flex cursor-grab items-center gap-2 rounded-t-md bg-sand/40 px-2 py-1.5"
          >
            <span className="select-none text-ink/30" aria-hidden>⠿</span>
            <span
              className="font-display inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-sm font-bold text-cream"
              style={{ background: 'var(--color-indigo)' }}
            >
              {ch.letter}
            </span>
            <span className="text-xs text-ink/55">บท {ch.letter}</span>
            <span className="ml-auto text-[11px] text-ink/35">{ch.scenes.length} ฉาก</span>
            <button
              type="button"
              className="rounded px-1 text-xs text-ink/40 hover:bg-cream/60"
              aria-label={openNote === ch.key ? 'ซ่อนเล่าย่อ' : 'เขียนเล่าย่อ'}
              aria-expanded={openNote === ch.key}
              onClick={(e) => {
                e.stopPropagation()
                setOpenNote(openNote === ch.key ? null : ch.key)
              }}
            >
              {openNote === ch.key ? '▾' : '✎'}
            </button>
          </div>
          {openNote === ch.key && (
            <div className="px-2 pt-1.5">
              <textarea
                className="w-full resize-y rounded bg-white p-2 text-[12px] text-ink focus:outline-none"
                style={{ border: '1px solid rgba(20,22,25,0.2)' }}
                rows={3}
                value={chapterNotes[ch.key] ?? ''}
                placeholder="เล่าย่อของบทนี้…"
                aria-label={`เล่าย่อ บท ${ch.letter}`}
                onChange={(e) => setChapterNote(ch.key, e.target.value)}
              />
            </div>
          )}
          <ul className="min-h-8 space-y-0.5 p-1">
            {ch.scenes.length === 0 ? (
              <li className="px-2 py-2 text-[11px] italic text-ink/35">ลากฉากมาที่บทนี้</li>
            ) : (
              ch.scenes
                .sort((a, b) => a.position.x - b.position.x)
                .map((scene) => (
                  <li key={scene.id}>
                    <SceneRow scene={scene} draggable />
                  </li>
                ))
            )}
          </ul>
        </div>
      ))}

      {unassigned.length > 0 && (
        <div className="mb-3" {...dropProps(null)}>
          <h3 className="font-display mb-1 text-sm font-bold tracking-wide text-ink/45">
            ยังไม่กำหนดบท
          </h3>
          <ul className="space-y-0.5">
            {unassigned.map((scene) => (
              <li key={scene.id}>
                <SceneRow scene={scene} draggable />
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="w-full rounded px-3 py-2 text-sm text-ink-soft hover:bg-sand/20"
        style={{ border: '1px dashed rgba(20,22,25,0.25)' }}
        onClick={() => addTellingChapter()}
      >
        + เพิ่มบท
      </button>
    </div>
  )
}
