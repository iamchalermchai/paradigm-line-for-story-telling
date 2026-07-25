import { describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { projectToJson } from '../export/json'
import { mapRawToBoard } from './mapToBoard'

describe('mapRawToBoard', () => {
  it('recognizes a full Plotline project JSON', async () => {
    const project = createSeedProject()
    const result = await mapRawToBoard(projectToJson(project))
    expect(result.kind).toBe('project')
    if (result.kind !== 'project') return
    expect(result.project.title).toBe(project.title)
    expect(result.project.scenes.length).toBe(project.scenes.length)
  })

  it('maps a loose JSON scene array onto suggestions', async () => {
    const raw = JSON.stringify([
      { title: 'เปิดเรื่อง', action: 'แอลเปิดสมุด' },
      { name: 'พลิก', summary: 'ชายปริศนาหายไป', phase: 'midpoint' },
    ])
    const result = await mapRawToBoard(raw)
    expect(result.kind).toBe('scenes')
    if (result.kind !== 'scenes') return
    expect(result.source).toBe('json')
    expect(result.scenes).toHaveLength(2)
    expect(result.scenes[0].title).toBe('เปิดเรื่อง')
    expect(result.scenes[1].action).toContain('ชายปริศนา')
    expect(result.scenes[1].phase).toBe('middle')
  })

  it('maps { scenes: [...] } and root backstory fields', async () => {
    const raw = JSON.stringify({
      want: 'อยากได้คำตอบ',
      scenes: [{ title: 'A', text: 'เนื้อหาฉากเอ' }],
    })
    const result = await mapRawToBoard(raw)
    expect(result.kind).toBe('scenes')
    if (result.kind !== 'scenes') return
    expect(result.backstory.want).toBe('อยากได้คำตอบ')
    expect(result.scenes[0].action).toContain('เนื้อหาฉากเอ')
  })

  it('maps an array of plain strings as scenes', async () => {
    const result = await mapRawToBoard(JSON.stringify(['ฉากหนึ่งสั้นๆ', 'ฉากสองสั้นๆ']))
    expect(result.kind).toBe('scenes')
    if (result.kind !== 'scenes') return
    expect(result.scenes).toHaveLength(2)
    expect(result.scenes[0].action).toBe('ฉากหนึ่งสั้นๆ')
  })

  it('falls back to prose parsing for free text', async () => {
    const result = await mapRawToBoard(
      'Ghost: บาดแผลเก่า\n\nแอลเริ่มเขียนสมุดทุกคืน\n\nชายปริศนาหายไป',
    )
    expect(result.kind).toBe('scenes')
    if (result.kind !== 'scenes') return
    expect(result.source).toBe('text')
    expect(result.backstory.ghost).toContain('บาดแผล')
    expect(result.scenes.length).toBeGreaterThanOrEqual(2)
  })
})
