import { EDGE_LABELS } from '../domain/types'
import type { EdgeType } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'

const EDGE_TYPES: EdgeType[] = [
  'actual_path',
  'expected_want_path',
  'better_outcome_path',
  'failure_path',
  'character_arc',
]

/** Floating editor for the currently selected edge (type, label, delete). */
export function EdgeEditor() {
  const selectedEdgeId = useUiStore((s) => s.selectedEdgeId)
  const selectEdge = useUiStore((s) => s.selectEdge)
  const edges = useProjectStore((s) => s.project.edges)
  const updateEdge = useProjectStore((s) => s.updateEdge)
  const deleteEdge = useProjectStore((s) => s.deleteEdge)

  const edge = edges.find((e) => e.id === selectedEdgeId)
  if (!edge) return null

  return (
    <div
      className="w-72 rounded-md bg-white p-3"
      style={{ border: '1px solid rgba(20,22,25,0.18)' }}
      role="dialog"
      aria-label="แก้ไขเส้นเชื่อม"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-ink">แก้ไขเส้นเชื่อม</h3>
        <button
          type="button"
          aria-label="ปิด"
          className="rounded p-0.5 text-ink/40 hover:bg-sand/30"
          onClick={() => selectEdge(null)}
        >
          ✕
        </button>
      </div>

      <label className="mb-2 block text-[11px] text-ink-soft">
        ชนิดเส้น
        <select
          className="mt-1 w-full rounded px-2 py-1 text-xs text-ink"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          value={edge.type}
          onChange={(e) =>
            updateEdge(edge.id, { type: e.target.value as EdgeType })
          }
        >
          {EDGE_TYPES.map((t) => (
            <option key={t} value={t}>
              {EDGE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-3 block text-[11px] text-ink-soft">
        ป้ายกำกับ (ไม่บังคับ)
        <input
          className="mt-1 w-full rounded px-2 py-1 text-xs text-ink"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          value={edge.label ?? ''}
          onChange={(e) =>
            updateEdge(edge.id, { label: e.target.value || undefined })
          }
        />
      </label>

      <button
        type="button"
        className="w-full rounded px-2 py-1 text-xs text-rust hover:bg-rust/10"
        style={{ border: '1px solid var(--color-rust)' }}
        onClick={() => {
          deleteEdge(edge.id)
          selectEdge(null)
        }}
      >
        ลบเส้นเชื่อม
      </button>
    </div>
  )
}
