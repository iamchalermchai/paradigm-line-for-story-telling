import { STRUCTURE_TEMPLATES } from '../domain/structure'
import { useProjectStore } from '../store/projectStore'

/** Selector for the vertical structure overlay (4 Phase / Three Act / Save the Cat). */
export function StructurePicker() {
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const setStructureTemplate = useProjectStore((s) => s.setStructureTemplate)

  return (
    <label
      className="flex items-center gap-2 rounded bg-white px-3 py-1.5 text-xs text-ink-soft shadow"
      style={{ border: '1px solid rgba(20,22,25,0.15)' }}
    >
      <span className="font-semibold text-ink">โครงสร้าง</span>
      <select
        className="rounded bg-white px-1.5 py-0.5 text-xs text-ink focus:outline-none"
        style={{ border: '1px solid rgba(20,22,25,0.25)' }}
        value={structureId}
        onChange={(e) => setStructureTemplate(e.target.value)}
        aria-label="เลือกโครงสร้างเรื่อง"
      >
        {STRUCTURE_TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  )
}
