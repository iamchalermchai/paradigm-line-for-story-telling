import { create } from 'zustand'
import { autoLayout } from '../domain/autoLayout'
import { SCHEMA_VERSION } from '../domain/schemas'
import { createSeedProject } from '../domain/seed'
import {
  beatLabel,
  getStructureTemplate,
  templateBeatMarkers,
} from '../domain/structure'
import { PARADIGM_LINE_Y } from '../domain/types'
import { CHARACTER_COLORS } from '../domain/types'
import type {
  Backstory,
  BeatKey,
  BeatMarker,
  Character,
  ClimaxOutcome,
  Project,
  StoryEdge,
  StoryPhase,
  StoryScene,
  Viewport,
} from '../domain/types'
import {
  applySnapshot,
  HISTORY_LIMIT,
  snapshot,
  type HistorySnapshot,
} from './history'
import { loadProject, saveProject } from './persistence'

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

let saveTimer: ReturnType<typeof setTimeout> | undefined

export function uid(prefix = 'id'): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}-${rand}`
}

function emptyProject(title: string): Project {
  const backstory: Backstory = {
    ghost: '',
    lie: '',
    lieAtWork: '',
    want: '',
    need: '',
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    id: uid('project'),
    title,
    backstory,
    scenes: [],
    beats: [],
    edges: [],
    climaxOutcome: { want: 'not_got', need: 'gained' },
    structureTemplateId: 'four-phase',
    tellingChapterOrder: [],
    characters: [],
    synopsis: '',
    tellingChapterNotes: {},
    viewport: { x: 40, y: 360, zoom: 0.8 },
    updatedAt: new Date().toISOString(),
  }
}

function newScene(project: Project, partial: Partial<StoryScene>): StoryScene {
  const maxOrder = project.scenes.reduce((m, s) => Math.max(m, s.order), -1)
  return {
    id: uid('scene'),
    title: 'ฉากใหม่',
    location: '',
    characters: [],
    povCharacter: undefined,
    characterGoal: '',
    action: '',
    obstacle: '',
    outcome: '',
    changeAfterScene: '',
    phase: 'setup',
    beat: undefined,
    arcRelation: 'neutral',
    position: { x: 60, y: PARADIGM_LINE_Y + 160 },
    color: undefined,
    order: maxOrder + 1,
    notes: '',
    collapsed: false,
    locked: false,
    ...partial,
  }
}

interface ProjectState {
  project: Project
  past: HistorySnapshot[]
  future: HistorySnapshot[]
  saveStatus: SaveStatus

  // Project title
  setTitle: (title: string) => void

  // Backstory
  updateBackstory: (patch: Partial<Backstory>) => void

  // Characters
  addCharacter: (name?: string) => Character
  updateCharacter: (id: string, patch: Partial<Omit<Character, 'id'>>) => void
  deleteCharacter: (id: string) => void

  // Narrative
  setSynopsis: (text: string) => void
  setChapterNote: (chapterKey: string, text: string) => void

  // Scenes
  addScene: (partial?: Partial<StoryScene>) => StoryScene
  updateScene: (
    id: string,
    patch: Partial<StoryScene>,
    opts?: { history?: boolean },
  ) => void
  moveScenes: (
    updates: { id: string; position: { x: number; y: number } }[],
  ) => void
  applyNodeDrag: (
    scenes: {
      id: string
      position: { x: number; y: number }
      phase: StoryPhase
    }[],
    beats: { id: string; position: { x: number; y: number } }[],
  ) => void
  duplicateScene: (id: string) => StoryScene | undefined
  /** Paste copied scenes as new scenes (new ids, offset positions), one commit. */
  pasteScenes: (scenes: StoryScene[]) => StoryScene[]
  deleteScene: (id: string) => void
  /** Remove scenes, beats and edges in a single commit (batched canvas delete). */
  deleteElements: (params: {
    sceneIds?: string[]
    beatIds?: string[]
    edgeIds?: string[]
  }) => void

  // Beats
  addBeat: (type: BeatKey) => BeatMarker
  updateBeat: (
    id: string,
    patch: Partial<BeatMarker>,
    opts?: { history?: boolean },
  ) => void
  deleteBeat: (id: string) => void

  // Edges
  addEdge: (edge: Omit<StoryEdge, 'id'> & { id?: string }) => StoryEdge
  updateEdge: (id: string, patch: Partial<StoryEdge>) => void
  deleteEdge: (id: string) => void

  // Climax
  setClimaxOutcome: (patch: Partial<ClimaxOutcome>) => void

  // Layout / viewport
  applyAutoLayout: () => void
  setViewport: (viewport: Viewport) => void
  setStructureTemplate: (id: string) => void

  // Telling chapters
  addTellingChapter: () => string
  reorderTellingChapters: (order: string[]) => void

  // History
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Project lifecycle
  createProject: (title: string) => void
  importProject: (project: Project) => void
  exportProject: () => Project
  markSaved: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => {
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer)
    set({ saveStatus: 'saving' })
    saveTimer = setTimeout(() => {
      const ok = saveProject(get().project)
      set({ saveStatus: ok ? 'saved' : 'unsaved' })
    }, 600)
  }

  /**
   * Apply a pure mutation to the project. By default this records an undo
   * snapshot and marks the project dirty. Pass `history: false` for
   * high-frequency updates (drag position sync) that should not spam history.
   */
  function commit(
    mutate: (project: Project) => Project,
    opts: { history?: boolean } = {},
  ) {
    const { history = true } = opts
    set((state) => {
      const next = mutate(state.project)
      const withMeta: Project = {
        ...next,
        updatedAt: new Date().toISOString(),
      }
      if (!history) {
        return { project: withMeta }
      }
      const past = [...state.past, snapshot(state.project)].slice(
        -HISTORY_LIMIT,
      )
      return { project: withMeta, past, future: [] }
    })
    scheduleSave()
  }

  return {
    project: loadProject() ?? createSeedProject(),
    past: [],
    future: [],
    saveStatus: 'saved',

    setTitle: (title) => {
      set((state) => ({
        project: {
          ...state.project,
          title,
          updatedAt: new Date().toISOString(),
        },
      }))
      scheduleSave()
    },

    updateBackstory: (patch) =>
      commit((p) => ({ ...p, backstory: { ...p.backstory, ...patch } })),

    addCharacter: (name = 'ตัวละครใหม่') => {
      const existing = get().project.characters
      const character: Character = {
        id: uid('ch'),
        name,
        color: CHARACTER_COLORS[existing.length % CHARACTER_COLORS.length],
      }
      commit((p) => ({ ...p, characters: [...p.characters, character] }))
      return character
    },

    updateCharacter: (id, patch) =>
      commit((p) => ({
        ...p,
        characters: p.characters.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      })),

    deleteCharacter: (id) =>
      commit((p) => ({
        ...p,
        characters: p.characters.filter((c) => c.id !== id),
      })),

    setSynopsis: (text) => commit((p) => ({ ...p, synopsis: text })),

    setChapterNote: (chapterKey, text) =>
      commit((p) => ({
        ...p,
        tellingChapterNotes: { ...p.tellingChapterNotes, [chapterKey]: text },
      })),

    addScene: (partial = {}) => {
      const scene = newScene(get().project, partial)
      commit((p) => ({ ...p, scenes: [...p.scenes, scene] }))
      return scene
    },

    updateScene: (id, patch, opts) =>
      commit(
        (p) => ({
          ...p,
          scenes: p.scenes.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        }),
        { history: opts?.history ?? true },
      ),

    moveScenes: (updates) => {
      const map = new Map(updates.map((u) => [u.id, u.position]))
      commit((p) => ({
        ...p,
        scenes: p.scenes.map((s) =>
          map.has(s.id) ? { ...s, position: map.get(s.id)! } : s,
        ),
      }))
    },

    applyNodeDrag: (sceneUpdates, beatUpdates) => {
      if (sceneUpdates.length === 0 && beatUpdates.length === 0) return
      const sceneMap = new Map(sceneUpdates.map((u) => [u.id, u]))
      const beatMap = new Map(beatUpdates.map((u) => [u.id, u.position]))
      commit((p) => ({
        ...p,
        scenes: p.scenes.map((s) => {
          const u = sceneMap.get(s.id)
          return u ? { ...s, position: u.position, phase: u.phase } : s
        }),
        beats: p.beats.map((b) =>
          beatMap.has(b.id) ? { ...b, position: beatMap.get(b.id)! } : b,
        ),
      }))
    },

    duplicateScene: (id) => {
      const original = get().project.scenes.find((s) => s.id === id)
      if (!original) return undefined
      const copy = newScene(get().project, {
        ...original,
        id: undefined as unknown as string,
        title: `${original.title} (สำเนา)`,
        position: {
          x: original.position.x + 40,
          y: original.position.y + 40,
        },
        locked: false,
      })
      commit((p) => ({ ...p, scenes: [...p.scenes, copy] }))
      return copy
    },

    pasteScenes: (scenes) => {
      if (scenes.length === 0) return []
      const created: StoryScene[] = []
      commit((p) => {
        let maxOrder = p.scenes.reduce((m, s) => Math.max(m, s.order), -1)
        const news = scenes.map((s) => {
          maxOrder += 1
          return {
            ...s,
            id: uid('scene'),
            position: { x: s.position.x + 40, y: s.position.y + 40 },
            order: maxOrder,
            locked: false,
          }
        })
        created.push(...news)
        return { ...p, scenes: [...p.scenes, ...news] }
      })
      return created
    },

    deleteScene: (id) =>
      commit((p) => ({
        ...p,
        scenes: p.scenes.filter((s) => s.id !== id),
        edges: p.edges.filter((e) => e.source !== id && e.target !== id),
      })),

    deleteElements: ({ sceneIds = [], beatIds = [], edgeIds = [] }) => {
      if (!sceneIds.length && !beatIds.length && !edgeIds.length) return
      const sceneSet = new Set(sceneIds)
      const beatSet = new Set(beatIds)
      const edgeSet = new Set(edgeIds)
      const removedNode = (endpoint: string) =>
        sceneSet.has(endpoint) || beatSet.has(endpoint)
      commit((p) => ({
        ...p,
        scenes: p.scenes.filter((s) => !sceneSet.has(s.id)),
        beats: p.beats.filter((b) => !beatSet.has(b.id)),
        edges: p.edges.filter(
          (e) =>
            !edgeSet.has(e.id) &&
            !removedNode(e.source) &&
            !removedNode(e.target),
        ),
      }))
    },

    addBeat: (type) => {
      const beat: BeatMarker = {
        id: uid('beat'),
        type,
        title: beatLabel(type),
        description: '',
        position: { x: 200, y: PARADIGM_LINE_Y - 12 },
        locked: false,
      }
      commit((p) => ({ ...p, beats: [...p.beats, beat] }))
      return beat
    },

    updateBeat: (id, patch, opts) =>
      commit(
        (p) => ({
          ...p,
          beats: p.beats.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        }),
        { history: opts?.history ?? true },
      ),

    deleteBeat: (id) =>
      commit((p) => ({ ...p, beats: p.beats.filter((b) => b.id !== id) })),

    addEdge: (edge) => {
      const full: StoryEdge = { ...edge, id: edge.id ?? uid('edge') }
      commit((p) => {
        // Avoid duplicate source/target/type edges.
        const exists = p.edges.some(
          (e) =>
            e.source === full.source &&
            e.target === full.target &&
            e.type === full.type,
        )
        return exists ? p : { ...p, edges: [...p.edges, full] }
      })
      return full
    },

    updateEdge: (id, patch) =>
      commit((p) => ({
        ...p,
        edges: p.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      })),

    deleteEdge: (id) =>
      commit((p) => ({ ...p, edges: p.edges.filter((e) => e.id !== id) })),

    setClimaxOutcome: (patch) =>
      commit((p) => ({
        ...p,
        climaxOutcome: { ...p.climaxOutcome, ...patch },
      })),

    applyAutoLayout: () =>
      commit((p) => {
        const { scenes, beats } = autoLayout(
          p.scenes,
          p.beats,
          getStructureTemplate(p.structureTemplateId),
        )
        return { ...p, scenes, beats }
      }),

    setViewport: (viewport) =>
      set((state) => ({ project: { ...state.project, viewport } })),

    /**
     * Switching structures re-scaffolds the paradigm line with the new
     * structure's beat markers, so it edits content and belongs in undo. Two
     * kinds of marker survive the swap: ones the author locked, and ones that
     * never came from the outgoing structure (added by hand). Scene beat tags
     * are left untouched — switching back restores their meaning.
     */
    setStructureTemplate: (id) =>
      commit((p) => {
        const outgoing = getStructureTemplate(p.structureTemplateId)
        const incoming = getStructureTemplate(id)
        const kept = p.beats.filter(
          (b) => b.locked || !outgoing.beats.some((tb) => tb.key === b.type),
        )
        const keptKeys = new Set(kept.map((b) => b.type))
        const fresh = templateBeatMarkers(incoming).filter(
          (b) => !keptKeys.has(b.type),
        )
        return { ...p, structureTemplateId: id, beats: [...kept, ...fresh] }
      }),

    addTellingChapter: () => {
      const key = uid('tc')
      set((state) => ({
        project: {
          ...state.project,
          tellingChapterOrder: [...state.project.tellingChapterOrder, key],
          updatedAt: new Date().toISOString(),
        },
      }))
      scheduleSave()
      return key
    },

    reorderTellingChapters: (order) => {
      set((state) => ({
        project: {
          ...state.project,
          tellingChapterOrder: order,
          updatedAt: new Date().toISOString(),
        },
      }))
      scheduleSave()
    },

    undo: () =>
      set((state) => {
        const prev = state.past[state.past.length - 1]
        if (!prev) return state
        const future = [snapshot(state.project), ...state.future].slice(
          0,
          HISTORY_LIMIT,
        )
        scheduleSave()
        return {
          project: applySnapshot(state.project, prev),
          past: state.past.slice(0, -1),
          future,
        }
      }),

    redo: () =>
      set((state) => {
        const nextSnap = state.future[0]
        if (!nextSnap) return state
        const past = [...state.past, snapshot(state.project)].slice(
          -HISTORY_LIMIT,
        )
        scheduleSave()
        return {
          project: applySnapshot(state.project, nextSnap),
          past,
          future: state.future.slice(1),
        }
      }),

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    createProject: (title) => {
      const project = emptyProject(title)
      set({ project, past: [], future: [] })
      scheduleSave()
    },

    importProject: (project) => {
      set({ project, past: [], future: [] })
      scheduleSave()
    },

    exportProject: () => get().project,

    markSaved: () => set({ saveStatus: 'saved' }),
  }
})
