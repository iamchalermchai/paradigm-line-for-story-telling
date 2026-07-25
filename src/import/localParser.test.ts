import { describe, expect, it } from 'vitest'
import { localParser, splitBlocks } from './localParser'

const SAMPLE = `Ghost: แอลเคยถูกรุ่นพี่ตัดขาด
Want: เขียนสมุดให้ครบ 30 วัน

แอลเริ่มเขียนสมุดทุกคืนเพื่อลืมคิว เขาตั้งใจเขียนให้ครบ

ชายปริศนาหายไปหลายวัน แอลเริ่มกลัวและอยากเงียบใส่ก่อน

สุดท้ายแอลเข้าใจว่าความเงียบทำร้ายอีกฝ่าย จึงกล้าเชื่อมต่อ`

const LABELLED = `ชื่อ: คืนแรกที่เขียนสมุด
ตัวละคร: แอล, คิว
การกระทำ: แอลเปิดสมุดเล่มใหม่แล้วเขียนจนเช้า
ผลลัพธ์: ได้หน้าที่หนึ่ง

Title: The door
Characters: Mae / Tom
Action: Mae refuses to answer
Beat: midpoint`

describe('splitBlocks', () => {
  it('splits on blank lines and tracks offsets', () => {
    const blocks = splitBlocks(SAMPLE)
    expect(blocks.length).toBeGreaterThanOrEqual(3)
    for (const b of blocks) {
      expect(SAMPLE.slice(b.start, b.end)).toBe(b.text)
    }
  })
})

describe('localParser', () => {
  it('skips backstory-only lines and yields one scene per prose block', async () => {
    const result = await localParser.parse(SAMPLE)
    expect(result.scenes).toHaveLength(3)
    expect(result.backstory.ghost).toContain('รุ่นพี่')
    expect(result.backstory.want).toContain('30 วัน')
  })

  it('infers arc relation from keywords', async () => {
    const result = await localParser.parse(SAMPLE)
    const relations = result.scenes.map((s) => s.arcRelation)
    expect(relations).toContain('lie')
    expect(relations).toContain('need')
  })

  it('marks first/last beats and setup phase on the opener', async () => {
    const result = await localParser.parse(SAMPLE)
    expect(result.scenes[0].beat).toBe('catalyst')
    expect(result.scenes[result.scenes.length - 1].beat).toBe('climax')
    expect(result.scenes[0].phase).toBe('setup')
  })

  it('parses labelled scene fields in Thai and English', async () => {
    const result = await localParser.parse(LABELLED)
    expect(result.scenes).toHaveLength(2)
    expect(result.scenes[0].title).toBe('คืนแรกที่เขียนสมุด')
    expect(result.scenes[0].characters).toEqual(['แอล', 'คิว'])
    expect(result.scenes[0].action).toContain('สมุดเล่มใหม่')
    expect(result.scenes[0].outcome).toContain('หน้าที่หนึ่ง')
    expect(result.scenes[1].title).toBe('The door')
    expect(result.scenes[1].characters).toEqual(['Mae', 'Tom'])
    expect(result.scenes[1].beat).toBe('midpoint')
  })
})
