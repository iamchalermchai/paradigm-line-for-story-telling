import { tellingChapters } from '../domain/telling'
import type { Project } from '../domain/types'

/** Build a plain-text telling-order outline (chapters A→B→C…). */
export function formatTellingOutline(project: Project): string {
  const chapters = tellingChapters(project.scenes, project.tellingChapterOrder)
  const notes = project.tellingChapterNotes
  const lines: string[] = [
    project.title.trim() || 'ไม่มีชื่อเรื่อง',
    'ลำดับเล่า (Telling order)',
    '─'.repeat(28),
    '',
  ]

  if (chapters.every((ch) => ch.scenes.length === 0)) {
    const unassigned = project.scenes.filter((s) => !s.tellingChapter)
    if (unassigned.length === 0) {
      lines.push('(ยังไม่มีฉากในโปรเจกต์)')
    } else {
      lines.push('ยังไม่ได้จัดบทการเล่า — ฉากทั้งหมดยังไม่ถูกใส่บท:')
      lines.push('')
      for (const s of unassigned) {
        lines.push(`• ${s.title || 'ฉากไม่มีชื่อ'}`)
      }
    }
    return lines.join('\n')
  }

  for (const ch of chapters) {
    if (ch.scenes.length === 0) continue
    lines.push(`บท ${ch.letter}`)
    const note = notes[ch.key]?.trim()
    if (note) lines.push(`  บันทึก: ${note}`)
    for (const s of ch.scenes) {
      const beat = s.beat ? ` [${s.beat}]` : ''
      lines.push(`  • ${s.title || 'ฉากไม่มีชื่อ'}${beat}`)
      if (s.action.trim()) {
        const action =
          s.action.trim().length > 120
            ? `${s.action.trim().slice(0, 120)}…`
            : s.action.trim()
        lines.push(`      ${action}`)
      }
    }
    lines.push('')
  }

  const unassigned = project.scenes.filter((s) => !s.tellingChapter)
  if (unassigned.length > 0) {
    lines.push('ยังไม่จัดบท')
    for (const s of unassigned) {
      lines.push(`  • ${s.title || 'ฉากไม่มีชื่อ'}`)
    }
  }

  return lines.join('\n').trimEnd() + '\n'
}

/** Trigger a browser download of the telling-order outline. */
export function downloadTellingOutline(project: Project): void {
  const text = formatTellingOutline(project)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safe =
    project.title.trim().replace(/[^\w\u0E00-\u0E7F-]+/g, '-').slice(0, 40) ||
    'plotline'
  a.href = url
  a.download = `${safe}-telling-outline.txt`
  a.click()
  URL.revokeObjectURL(url)
}
