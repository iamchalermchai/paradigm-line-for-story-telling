import { describe, expect, it } from 'vitest'
import { mockParser, splitBlocks } from './mockParser'

const SAMPLE = `Ghost: แอลเคยถูกรุ่นพี่ตัดขาด
Want: เขียนสมุดให้ครบ 30 วัน

แอลเริ่มเขียนสมุดทุกคืนเพื่อลืมคิว เขาตั้งใจเขียนให้ครบ

ชายปริศนาหายไปหลายวัน แอลเริ่มกลัวและอยากเงียบใส่ก่อน

สุดท้ายแอลเข้าใจว่าความเงียบทำร้ายอีกฝ่าย จึงกล้าเชื่อมต่อ`

describe('splitBlocks', () => {
  it('splits on blank lines and tracks offsets', () => {
    const blocks = splitBlocks(SAMPLE)
    expect(blocks.length).toBe(4)
    // Offsets point back into the source text.
    for (const b of blocks) {
      expect(SAMPLE.slice(b.start, b.end)).toBe(b.text)
    }
  })
})

describe('mockParser', () => {
  it('produces one scene suggestion per block', async () => {
    const result = await mockParser.parse(SAMPLE)
    expect(result.scenes).toHaveLength(4)
  })

  it('extracts labelled backstory fields', async () => {
    const result = await mockParser.parse(SAMPLE)
    expect(result.backstory.ghost).toContain('รุ่นพี่')
    expect(result.backstory.want).toContain('30 วัน')
  })

  it('infers arc relation from keywords', async () => {
    const result = await mockParser.parse(SAMPLE)
    // Block with เงียบ/กลัว → lie; block with เข้าใจ/กล้า → need.
    const relations = result.scenes.map((s) => s.arcRelation)
    expect(relations).toContain('lie')
    expect(relations).toContain('need')
  })

  it('spreads phases across the story and marks first/last beats', async () => {
    const result = await mockParser.parse(SAMPLE)
    expect(result.scenes[0].beat).toBe('catalyst')
    expect(result.scenes[result.scenes.length - 1].beat).toBe('climax')
    expect(result.scenes[0].phase).toBe('setup')
  })
})
