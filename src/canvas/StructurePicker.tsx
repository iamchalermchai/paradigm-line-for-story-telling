import { getStructureTemplate, STRUCTURE_TEMPLATES } from '../domain/structure'
import { useProjectStore } from '../store/projectStore'

/**
 * Selector for the story structure. Changing it re-scaffolds the paradigm line
 * with that structure's beat markers, so the picker also shows what the chosen
 * structure is for and where to start.
 */
export function StructurePicker() {
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const setStructureTemplate = useProjectStore((s) => s.setStructureTemplate)
  const template = getStructureTemplate(structureId)

  return (
    <div
      className="w-64 rounded bg-white px-3 py-2 text-xs text-ink-soft shadow"
      style={{ border: '1px solid rgba(20,22,25,0.15)' }}
    >
      <label className="flex items-center gap-2">
        <span className="font-semibold text-ink">โครงสร้าง</span>
        <select
          className="min-w-0 flex-1 rounded bg-white px-1.5 py-0.5 text-xs text-ink focus:outline-none"
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
      <p className="mt-1.5 leading-snug text-ink/55">{template.description}</p>
      <p className="mt-1.5 leading-snug text-ink/70">
        <span className="font-semibold text-ink">เริ่มที่นี่ · </span>
        {template.startHere}
      </p>
      <p className="mt-1.5 text-[10px] text-ink/40">
        การสลับโครงสร้างจะวางหมุดชุดใหม่ลงบนเส้น (เลิกทำได้)
      </p>
    </div>
  )
}
