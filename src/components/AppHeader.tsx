import { useRef, useState } from 'react'
import { PARADIGM_LINE_Y } from '../domain/types'
import { downloadProjectJson, readProjectFile } from '../export/json'
import { useProjectStore } from '../store/projectStore'
import type { SaveStatus } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'

const SAVE_LABEL: Record<SaveStatus, string> = {
  saving: 'กำลังบันทึก…',
  saved: 'บันทึกแล้ว',
  unsaved: 'ยังไม่ได้บันทึก',
}

const SAVE_COLOR: Record<SaveStatus, string> = {
  saving: 'text-rust',
  saved: 'text-[color:var(--color-mint-deep)]',
  unsaved: 'text-ink/50',
}

/** Top application bar: primary actions, undo/redo, an overflow menu, save status. */
export function AppHeader() {
  const title = useProjectStore((s) => s.project.title)
  const setTitle = useProjectStore((s) => s.setTitle)
  const saveStatus = useProjectStore((s) => s.saveStatus)
  const addScene = useProjectStore((s) => s.addScene)
  const applyAutoLayout = useProjectStore((s) => s.applyAutoLayout)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const canUndo = useProjectStore((s) => s.past.length > 0)
  const canRedo = useProjectStore((s) => s.future.length > 0)
  const exportProject = useProjectStore((s) => s.exportProject)
  const importProject = useProjectStore((s) => s.importProject)
  const openSceneEditor = useUiStore((s) => s.openSceneEditor)
  const openDialog = useUiStore((s) => s.openDialog)
  const fileInput = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleImportFile(file: File) {
    const result = await readProjectFile(file)
    if (!result.ok || !result.project) {
      window.alert(`นำเข้าไม่สำเร็จ: ${result.error ?? 'ไฟล์ไม่ถูกต้อง'}`)
      return
    }
    if (
      window.confirm(
        'การนำเข้าจะแทนที่โปรเจกต์ปัจจุบันทั้งหมด ต้องการดำเนินการต่อหรือไม่?',
      )
    ) {
      importProject(result.project)
    }
  }

  const menuItems: [string, () => void][] = [
    ['Import Scene Bank', () => openDialog('import-scene-bank')],
    ['Export PNG', () => openDialog('export-png')],
    ['Export JSON', () => downloadProjectJson(exportProject())],
    ['Import JSON', () => fileInput.current?.click()],
  ]

  return (
    <header
      className="relative flex items-center gap-2 bg-cream px-3 py-2"
      style={{ borderBottom: '1px solid rgba(20,22,25,0.18)' }}
    >
      <span className="font-display text-xl font-bold tracking-tight text-ink">
        Plotline Board
      </span>
      <span className="text-ink/40">·</span>
      <input
        className="font-display w-60 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-0.5 text-lg font-medium text-ink hover:border-ink/20 focus:border-ink/40 focus:bg-white focus:outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="ชื่อเรื่อง…"
        aria-label="ชื่อเรื่อง"
        title="คลิกเพื่อแก้ชื่อเรื่อง"
      />

      <button
        type="button"
        className="ml-3 rounded bg-ink px-3 py-1.5 text-sm font-semibold text-cream hover:bg-ink/85"
        onClick={() => {
          const scene = addScene({ position: { x: 60, y: PARADIGM_LINE_Y + 160 } })
          openSceneEditor(scene.id)
        }}
      >
        + Scene
      </button>
      <HeaderBtn onClick={applyAutoLayout}>จัดเรียงอัตโนมัติ</HeaderBtn>

      <span className="mx-1 h-5 w-px bg-ink/15" aria-hidden />

      <HeaderBtn onClick={undo} disabled={!canUndo} title="เลิกทำ">
        ↶
      </HeaderBtn>
      <HeaderBtn onClick={redo} disabled={!canRedo} title="ทำซ้ำ">
        ↷
      </HeaderBtn>

      <div className="relative ml-1">
        <button
          type="button"
          className="rounded px-2.5 py-1.5 text-sm text-ink hover:bg-sand/30"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          aria-label="เมนูเพิ่มเติม"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          ⋯
        </button>
        {menuOpen && (
          <div
            className="absolute left-0 top-full z-20 mt-1 w-48 rounded bg-white py-1 shadow-lg"
            style={{ border: '1px solid rgba(20,22,25,0.18)' }}
            role="menu"
          >
            {menuItems.map(([label, action]) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-sand/20"
                onClick={() => {
                  action()
                  setMenuOpen(false)
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleImportFile(file)
          e.target.value = ''
        }}
      />

      <span className={`ml-auto text-sm ${SAVE_COLOR[saveStatus]}`}>
        {SAVE_LABEL[saveStatus]}
      </span>
    </header>
  )
}

function HeaderBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded px-2.5 py-1.5 text-sm text-ink hover:bg-sand/30 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ border: '1px solid rgba(20,22,25,0.25)' }}
    >
      {children}
    </button>
  )
}
