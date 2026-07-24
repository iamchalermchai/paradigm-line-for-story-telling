import { useProjectStore } from '../store/projectStore'

/** Roster editor: list of named characters with a colour dot, inline rename,
 *  delete, and an add button. Lives in the Backstory tab. */
export function CharacterPanel() {
  const characters = useProjectStore((s) => s.project.characters)
  const addCharacter = useProjectStore((s) => s.addCharacter)
  const updateCharacter = useProjectStore((s) => s.updateCharacter)
  const deleteCharacter = useProjectStore((s) => s.deleteCharacter)

  return (
    <div className="px-4 py-3">
      <h2 className="font-display mb-2 text-base font-bold text-ink">ตัวละคร</h2>
      <ul className="space-y-1.5">
        {characters.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <input
              type="color"
              value={c.color}
              onChange={(e) => updateCharacter(c.id, { color: e.target.value })}
              className="h-5 w-5 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
              aria-label={`สีของ ${c.name}`}
            />
            <input
              value={c.name}
              onChange={(e) => updateCharacter(c.id, { name: e.target.value })}
              className="min-w-0 flex-1 rounded px-2 py-1 text-sm text-ink focus:outline-none"
              style={{ border: '1px solid rgba(20,22,25,0.18)' }}
              aria-label="ชื่อตัวละคร"
            />
            <button
              type="button"
              className="shrink-0 rounded px-1.5 py-1 text-xs text-rust hover:bg-rust/10"
              aria-label={`ลบ ${c.name}`}
              onClick={() => deleteCharacter(c.id)}
            >
              ลบ
            </button>
          </li>
        ))}
        {characters.length === 0 && (
          <li className="px-1 text-xs italic text-ink/35">ยังไม่มีตัวละคร</li>
        )}
      </ul>
      <button
        type="button"
        className="mt-2 w-full rounded px-3 py-1.5 text-sm text-ink-soft hover:bg-sand/20"
        style={{ border: '1px dashed rgba(20,22,25,0.25)' }}
        onClick={() => addCharacter()}
      >
        + เพิ่มตัวละคร
      </button>
    </div>
  )
}
