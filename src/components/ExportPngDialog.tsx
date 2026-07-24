import { useReactFlow } from '@xyflow/react'
import { useState } from 'react'
import {
  downloadDataUrl,
  exportBoardPng,
  SIZE_PRESETS,
  type SizeKey,
} from '../export/exportPng'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { Modal } from './Modal'

const SIZE_KEYS = Object.keys(SIZE_PRESETS) as SizeKey[]

type Status = 'idle' | 'working' | 'error'

export function ExportPngDialog() {
  const open = useUiStore((s) => s.dialog === 'export-png')
  const closeDialog = useUiStore((s) => s.closeDialog)
  const backstory = useProjectStore((s) => s.project.backstory)
  const title = useProjectStore((s) => s.project.title)
  const { getNodes } = useReactFlow()

  const [size, setSize] = useState<SizeKey>('facebook')
  const [transparent, setTransparent] = useState(false)
  const [includeBackstory, setIncludeBackstory] = useState(true)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  if (!open) return null

  async function handleExport() {
    setStatus('working')
    setError('')
    try {
      // Exclude the non-content outcome node? Keep everything; bounds cover all.
      const nodes = getNodes()
      const dataUrl = await exportBoardPng(nodes, {
        size,
        transparent,
        includeBackstory,
        backstory,
        title,
      })
      downloadDataUrl(dataUrl, `${title || 'plotline-board'}.png`)
      setStatus('idle')
      closeDialog()
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'ส่งออกไม่สำเร็จ')
    }
  }

  return (
    <Modal title="ส่งออกภาพ PNG (ทั้งกระดาน)" onClose={closeDialog}>
      <fieldset className="mb-4">
        <legend className="mb-1 text-xs font-semibold text-ink-soft">
          ขนาดภาพ
        </legend>
        <div className="flex flex-col gap-1">
          {SIZE_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="size"
                checked={size === key}
                onChange={() => setSize(key)}
              />
              {SIZE_PRESETS[key].label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-ink/45">
          ภาพย่อ/ขยายตามกระดานจริง คมชัดเมื่อซูม — เลือก"พอดีเฟซบุ๊ก"
          สำหรับโพสต์หรือคอมเมนต์
        </p>
      </fieldset>

      <fieldset className="mb-4">
        <legend className="mb-1 text-xs font-semibold text-ink-soft">
          พื้นหลัง
        </legend>
        <label className="mr-4 text-sm">
          <input
            type="radio"
            name="bg"
            checked={!transparent}
            onChange={() => setTransparent(false)}
          />{' '}
          สว่าง
        </label>
        <label className="text-sm">
          <input
            type="radio"
            name="bg"
            checked={transparent}
            onChange={() => setTransparent(true)}
          />{' '}
          โปร่งใส
        </label>
      </fieldset>

      <label className="mb-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeBackstory}
          onChange={(e) => setIncludeBackstory(e.target.checked)}
        />
        แนบแผง Backstory ไว้ด้านบนภาพ
      </label>

      {status === 'error' && (
        <p
          className="mb-3 rounded px-3 py-2 text-xs text-ink"
          style={{ border: '1px solid var(--color-rust)', background: 'rgba(205,80,66,0.08)' }}
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded px-3 py-1.5 text-sm text-ink-soft hover:bg-sand/20"
          style={{ border: '1px solid rgba(20,22,25,0.25)' }}
          onClick={closeDialog}
        >
          ยกเลิก
        </button>
        <button
          type="button"
          className="rounded bg-ink px-3 py-1.5 text-sm font-semibold text-cream hover:bg-ink/85 disabled:opacity-50"
          onClick={handleExport}
          disabled={status === 'working'}
        >
          {status === 'working' ? 'กำลังสร้างภาพ…' : 'ส่งออก PNG'}
        </button>
      </div>
    </Modal>
  )
}
