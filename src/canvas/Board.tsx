import {
  Background,
  BackgroundVariant,
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
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { EdgeEditor } from './EdgeEditor'
import { EdgeLegend } from './EdgeLegend'
import { StructurePicker } from './StructurePicker'
import { StoryEdge } from './edges/StoryEdge'
import {
  projectToEdges,
  projectToNodes,
  reconcileDrag,
  type BoardNode,
} from './graph'
import { BeatNode } from './nodes/BeatNode'
import { OutcomeNode } from './nodes/OutcomeNode'
import { PhaseColumns } from './PhaseColumns'
import { SceneNode } from './nodes/SceneNode'

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
  const setViewport = useProjectStore((s) => s.setViewport)
  const addEdge = useProjectStore((s) => s.addEdge)
  const deleteEdge = useProjectStore((s) => s.deleteEdge)
  const openSceneEditor = useUiStore((s) => s.openSceneEditor)
  const newEdgeType = useUiStore((s) => s.newEdgeType)
  const selectEdge = useUiStore((s) => s.selectEdge)
  const { setViewport: rfSetViewport } = useReactFlow()

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

  const onNodeDragStop = useCallback<OnNodeDrag>(
    (_event, _node, dragged: Node[]) => {
      const updates = dragged.map((n) => ({ id: n.id, position: n.position }))
      const { scenes, beats } = reconcileDrag(updates, sceneIds, beatIds)
      isDragging.current = false
      applyNodeDrag(scenes, beats)
    },
    [sceneIds, beatIds, applyNodeDrag],
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

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      for (const e of deleted) deleteEdge(e.id)
    },
    [deleteEdge],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onNodeDoubleClick={(_e, node) => {
        if (node.type === 'scene') openSceneEditor(node.id)
      }}
      onConnect={onConnect}
      onEdgesDelete={onEdgesDelete}
      onEdgeClick={(_e, edge) => selectEdge(edge.id)}
      onPaneClick={() => selectEdge(null)}
      defaultViewport={project.viewport}
      onMoveEnd={(_e, vp) => setViewport(vp)}
      snapToGrid={snapToGrid}
      snapGrid={GRID}
      minZoom={0.15}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      className="bg-cream"
    >
      <PhaseColumns />
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(20,22,25,0.12)" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable className="!bg-white" />
      <Panel position="top-left">
        <div className="flex max-w-64 flex-col gap-2">
          <StructurePicker />
          <EdgeLegend />
        </div>
      </Panel>
      <Panel position="top-right">
        <label className="flex cursor-pointer items-center gap-2 rounded bg-white px-3 py-1.5 text-xs text-ink-soft shadow">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => setSnapToGrid(e.target.checked)}
          />
          Snap to grid
        </label>
      </Panel>
      <Panel position="bottom-center">
        <EdgeEditor />
      </Panel>
    </ReactFlow>
  )
}
