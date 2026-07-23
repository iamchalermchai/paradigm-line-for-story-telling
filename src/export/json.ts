import { parseProject, type ParseResult } from '../domain/schemas'
import type { Project } from '../domain/types'

/** Serialize a project to a pretty-printed JSON string. */
export function projectToJson(project: Project): string {
  return JSON.stringify(project, null, 2)
}

/** Validate + migrate a JSON string into a project. Never throws. */
export function projectFromJson(json: string): ParseResult {
  try {
    return parseProject(JSON.parse(json))
  } catch {
    return { ok: false, error: 'ไฟล์ไม่ใช่ JSON ที่ถูกต้อง' }
  }
}

function safeFilename(title: string): string {
  const base = title.trim().replace(/[\\/:*?"<>|]+/g, '-') || 'plotline-board'
  return `${base}.json`
}

/** Trigger a browser download of the project as a JSON file. */
export function downloadProjectJson(project: Project): void {
  const blob = new Blob([projectToJson(project)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = safeFilename(project.title)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Read a File (from an <input type="file">) into a validated project. */
export function readProjectFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(projectFromJson(String(reader.result)))
    reader.onerror = () => resolve({ ok: false, error: 'อ่านไฟล์ไม่สำเร็จ' })
    reader.readAsText(file)
  })
}
