import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  type OnNodeDrag,
} from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isLayeredMemory, snapSceneToLayer } from '../domain/layers'
import type { StoryScene } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { EdgeEditor } from './EdgeEditor'
import { BoardBookmarkRail } from './BoardBookmarkRail'
import { TellingOverlay } from './TellingOverlay'
import { StoryEdge } from './edges/StoryEdge'
import {
  BEAT_LINE_Y,
  projectToEdges,
  projectToNodes,
  reconcileDrag,
  type BoardNode,
} from './graph'
import { BeatNode } from './nodes/BeatNode'
import { OutcomeNode } from './nodes/OutcomeNode'
import { PhaseColumns } from './PhaseColumns'
import { SceneNode } from './nodes/SceneNode'
import { InternalConflictPrototypeHost } from './prototype/internalConflict/InternalConflictPrototype'
import { LayeredBoardPrototypeHost } from './prototype/layeredBoard/LayeredBoardPrototype'
import { LayerRailPrototypeHost } from './prototype/layerRail/LayerRailPrototype'
import { StoryLayerPrototypeHost } from './prototype/storyLayer/StoryLayerPrototype'

const nodeTypes: NodeTypes = {
  scene: SceneNode,
  beat: BeatNode,
  outcome: OutcomeNode,
}

const edgeTypes: EdgeTypes = {
  actual_path: StoryEdge,
  expected_want_path: StoryEdge,
  better_outcome_path: StoryEdge,
  failure_path: StoryEdge,
  character_arc: StoryEdge,
}

const GRID: [number, number] = [16, 16]

export function Board() {
  const project = useProjectStore((s) => s.project)
  const applyNodeDrag = useProjectStore((s) => s.applyNodeDrag)
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const layered = isLayeredMemory(structureId)
  const setViewport = useProjectStore((s) => s.setViewport)
  const addEdge = useProjectStore((s) => s.addEdge)
  const deleteElements = useProjectStore((s) => s.deleteElements)
  const pasteScenes = useProjectStore((s) => s.pasteScenes)
  const openSceneEditor = useUiStore((s) => s.openSceneEditor)
  const newEdgeType = useUiStore((s) => s.newEdgeType)
  const selectEdge = useUiStore((s) => s.selectEdge)
  const viewMode = useUiStore((s) => s.viewMode)
  const { setViewport: rfSetViewport, getNodes } = useReactFlow()
  const clipboard = useRef<StoryScene[]>([])

  // On first mount, open at a comfortable zoom: earlier saved projects may hold
  // a very zoomed-out viewport that makes card text hard to read.
  useEffect(() => {
    if (project.viewport.zoom < 0.7) {
      const next = { x: 40, y: 360, zoom: 0.8 }
      rfSetViewport(next)
      setViewport(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Copy / paste selected scene cards (⌘/Ctrl+C, ⌘/Ctrl+V).
  useEffect(() => {
    function isTyping(target: EventTarget | null): boolean {
      const el = target as HTMLElement | null
      const tag = el?.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || !!el?.isContentEditable
    }
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || isTyping(e.target)) return
      const key = e.key.toLowerCase()
      if (key === 'c') {
        const selected = new Set(
          getNodes()
            .filter((n) => n.type === 'scene' && n.selected)
            .map((n) => n.id),
        )
        const scenes = useProjectStore
          .getState()
          .project.scenes.filter((s) => selected.has(s.id))
        if (scenes.length) clipboard.current = scenes
      } else if (key === 'v') {
        if (clipboard.current.length === 0) return
        e.preventDefault()
        const pasted = pasteScenes(clipboard.current)
        // Cascade further pastes from the newly placed copies.
        clipboard.current = pasted
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [getNodes, pasteScenes])

  const [nodes, setNodes, onNodesChange] = useNodesState<BoardNode>(
    projectToNodes(project),
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    projectToEdges(project),
  )
  const [snapToGrid, setSnapToGrid] = useState(false)

  const isDragging = useRef(false)

  // Keep the local React Flow graph in sync with the store, except while a drag
  // is in progress (the store is only written on drag stop).
  useEffect(() => {
    if (isDragging.current) return
    setNodes(projectToNodes(project))
    setEdges(projectToEdges(project))
  }, [project, setNodes, setEdges])

  const sceneIds = useMemo(
    () => new Set(project.scenes.map((s) => s.id)),
    [project.scenes],
  )
  const beatIds = useMemo(
    () => new Set(project.beats.map((b) => b.id)),
    [project.beats],
  )

  const onNodeDragStart = useCallback(() => {
    isDragging.current = true
  }, [])

  const onNodeDrag = useCallback<OnNodeDrag>(
    (_event, node) => {
      if (node.type === 'beat') {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, position: { x: n.position.x, y: BEAT_LINE_Y } }
              : n,
          ),
        )
        return
      }
      if (node.type === 'scene' && layered) {
        const snap = snapSceneToLayer(node.position)
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, position: { x: snap.x, y: snap.y } }
              : n,
          ),
        )
      }
    },
    [setNodes, layered],
  )

  const onNodeDragStop = useCallback<OnNodeDrag>(
    (_event, _node, dragged: Node[]) => {
      const updates = dragged.map((n) => ({ id: n.id, position: n.position }))
      const { scenes, beats } = reconcileDrag(updates, sceneIds, beatIds)
      const sceneUpdates = layered
        ? scenes.map((s) => {
            const snap = snapSceneToLayer(s.position)
            return {
              ...s,
              position: { x: snap.x, y: snap.y },
              storyLayer: snap.storyLayer,
            }
          })
        : scenes
      isDragging.current = false
      applyNodeDrag(sceneUpdates, beats)
    },
    [sceneIds, beatIds, applyNodeDrag, layered],
  )

  const onConnect = useCallback<OnConnect>(
    (conn) => {
      if (!conn.source || !conn.target) return
      addEdge({
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
        type: newEdgeType,
      })
    },
    [addEdge, newEdgeType],
  )

  // Batch every canvas deletion (nodes + their edges) into a single store
  // commit, so deleting many cards at once is one update instead of one per
  // element — which previously thrashed the app.
  const onDelete = useCallback(
    ({ nodes: delNodes, edges: delEdges }: { nodes: Node[]; edges: Edge[] }) => {
      const sceneIds = delNodes.filter((n) => n.type === 'scene').map((n) => n.id)
      const beatIds = delNodes.filter((n) => n.type === 'beat').map((n) => n.id)
      const edgeIds = delEdges.map((e) => e.id)
      deleteElements({ sceneIds, beatIds, edgeIds })
    },
    [deleteElements],
  )

  return (
    <div className="relative h-full w-full">
      <BoardBookmarkRail />
      <InternalConflictPrototypeHost />
      <LayeredBoardPrototypeHost />
      <StoryLayerPrototypeHost />
      <LayerRailPrototypeHost />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeDoubleClick={(_e, node) => {
          if (node.type === 'scene') openSceneEditor(node.id)
        }}
        onConnect={onConnect}
        onDelete={onDelete}
        onEdgeClick={(_e, edge) => selectEdge(edge.id)}
        onPaneClick={() => selectEdge(null)}
        defaultViewport={project.viewport}
        onMoveEnd={(_e, vp) => setViewport(vp)}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={snapToGrid}
        snapGrid={GRID}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className={viewMode === 'telling' ? 'bg-cream telling-mode' : 'bg-cream'}
      >
        <PhaseColumns />
        {viewMode === 'telling' && <TellingOverlay />}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(20,22,25,0.12)"
        />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className="!bg-white" />
        <Panel position="top-right">
          <label className="flex cursor-pointer items-center gap-2 rounded bg-white px-3 py-1.5 text-xs text-ink-soft shadow">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
            />
            จับแนวกริด
          </label>
        </Panel>
        {project.scenes.length === 0 && (
          <Panel position="top-center">
            <div
              className="mt-24 max-w-sm rounded-lg bg-white/90 px-6 py-5 text-center shadow-sm"
              style={{ border: '1px solid rgba(20,22,25,0.15)' }}
            >
              <p className="font-display text-lg font-bold text-ink">
                เริ่มวางเรื่องของคุณ
              </p>
              <p className="mt-1 text-sm text-ink/55">
                กด <span className="font-medium text-ink">+ Scene</span> เพื่อเพิ่มฉากแรก
                หรือ <span className="font-medium text-ink">Import Scene Bank</span>{' '}
                เพื่อแปลงข้อความยาวเป็นฉากอัตโนมัติ
              </p>
            </div>
          </Panel>
        )}
        <Panel position="bottom-center">
          <EdgeEditor />
        </Panel>
      </ReactFlow>
    </div>
  )
}
