import { create } from 'zustand'
import type { EdgeType } from '../domain/types'

export type DialogKind = 'import-scene-bank' | 'export-png' | 'help' | null

/** Whether the board shows chronological (paradigm) order or telling order. */
export type ViewMode = 'chronological' | 'telling'

interface UiState {
  editingSceneId: string | null
  selectedEdgeId: string | null
  newEdgeType: EdgeType
  dialog: DialogKind
  viewMode: ViewMode
  /** Key of a linked beat-marker group currently hovered (e.g. 'catalyst-want'), so paired beats can scale up together. */
  hoveredBeatGroup: string | null
  openSceneEditor: (id: string) => void
  closeSceneEditor: () => void
  selectEdge: (id: string | null) => void
  setNewEdgeType: (type: EdgeType) => void
  openDialog: (kind: Exclude<DialogKind, null>) => void
  closeDialog: () => void
  setHoveredBeatGroup: (group: string | null) => void
  setViewMode: (mode: ViewMode) => void
}

export const useUiStore = create<UiState>((set) => ({
  editingSceneId: null,
  selectedEdgeId: null,
  newEdgeType: 'actual_path',
  dialog: null,
  viewMode: 'chronological',
  hoveredBeatGroup: null,
  openSceneEditor: (id) => set({ editingSceneId: id }),
  closeSceneEditor: () => set({ editingSceneId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id }),
  setNewEdgeType: (type) => set({ newEdgeType: type }),
  openDialog: (kind) => set({ dialog: kind }),
  closeDialog: () => set({ dialog: null }),
  setHoveredBeatGroup: (group) => set({ hoveredBeatGroup: group }),
  setViewMode: (mode) => set({ viewMode: mode }),
}))
