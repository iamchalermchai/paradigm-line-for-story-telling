import { create } from 'zustand'
import { autoLayout } from '../domain/autoLayout'
import { SCHEMA_VERSION } from '../domain/schemas'
import { createSeedProject } from '../domain/seed'
import {
  BEAT_LABELS,
  PARADIGM_LINE_Y,
} from '../domain/types'
import type {
  Backstory,
  BeatMarker,
  ClimaxOutcome,
  Project,
  StoryBeatType,
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
    viewport: { x: 0, y: 0, zoom: 0.7 },
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

  // Backstory
  updateBackstory: (patch: Partial<Backstory>) => void

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
  deleteScene: (id: string) => void

  // Beats
  addBeat: (type: StoryBeatType) => BeatMarker
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

    updateBackstory: (patch) =>
      commit((p) => ({ ...p, backstory: { ...p.backstory, ...patch } })),

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

    deleteScene: (id) =>
      commit((p) => ({
        ...p,
        scenes: p.scenes.filter((s) => s.id !== id),
        edges: p.edges.filter((e) => e.source !== id && e.target !== id),
      })),

    addBeat: (type) => {
      const beat: BeatMarker = {
        id: uid('beat'),
        type,
        title: BEAT_LABELS[type],
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
        const { scenes, beats } = autoLayout(p.scenes, p.beats)
        return { ...p, scenes, beats }
      }),

    setViewport: (viewport) =>
      set((state) => ({ project: { ...state.project, viewport } })),

    // Structure overlay is a view/authoring setting: persisted, but kept out of
    // undo history (it isn't part of the content snapshot).
    setStructureTemplate: (id) => {
      set((state) => ({
        project: {
          ...state.project,
          structureTemplateId: id,
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
