// Selectable story structures. A template owns both the vertical bands drawn
// across the timeline *and* the set of beat markers that ride the paradigm
// line, so picking a structure changes what the board actually asks the author
// to fill in — not just the column labels.

import { PARADIGM_LINE_Y } from './types'
import type { BeatMarker } from './types'

/**
 * The conceptual board width that every fraction in this file maps onto.
 * Equals seed.ts `PHASE_WIDTH` (700) times the four phase columns; duplicated
 * here as a plain number because seed.ts reaches back into this module through
 * schemas.ts, and structure.test.ts guards the two against drifting apart.
 */
export const BOARD_WIDTH = 2800

export interface StructureBand {
  label: string
  /** Left edge of the band as a fraction (0..1) of the board width. First band starts at 0. */
  start: number
}

export type BeatShape = 'tick' | 'square' | 'dotted-circle' | 'circle'

export interface TemplateBeat {
  /** Stable key, stored on `BeatMarker.type` and `StoryScene.beat`. */
  key: string
  label: string
  /** Where the marker sits, as a fraction (0..1) of the board width. */
  fraction: number
  shape: BeatShape
  color: string
  /** Beats sharing a group scale up together on hover (causal pairs). */
  group?: string
  /** Dense sheets stagger labels onto a second row so they stay readable. */
  tier?: 1
  /** One-line coaching note: what this beat is for. Shown as the marker tooltip. */
  hint: string
}

/** Labels for the horizontal paradigm line and the above/below hints on the board. */
export interface StructureAxis {
  lineTitle: string
  aboveHint: string
  belowHint: string
}

export interface StructureTemplate {
  id: string
  name: string
  bands: StructureBand[]
  beats: TemplateBeat[]
  /** What kind of story this structure serves. */
  description: string
  /** Where to start once it is picked — the first move, not a summary. */
  startHere: string
  /** How the timeline axis reads on the canvas for this structure. */
  axis: StructureAxis
}

const INK = 'var(--color-ink)'
const RUST = 'var(--color-rust)'
const AMBER = 'var(--color-amber)'

export const STRUCTURE_TEMPLATES: StructureTemplate[] = [
  {
    id: 'four-phase',
    name: '4 Phase',
    description:
      'โครงเรื่องแบบ Paradigm ที่ผูกทุกฉากไว้กับบาดแผลของตัวละคร — เหมาะกับเรื่องที่คนอ่านต้องเปลี่ยนไปพร้อมตัวละคร',
    startHere:
      'ตั้งต้นที่ตัวละครก่อนเหตุการณ์: กรอก Ghost / Lie / Want / Need ในแท็บ Backstory ให้ได้ก่อน แล้วค่อยหาว่าฉากไหนทำให้ Lie ทำงาน และฉากไหนบังคับให้เห็น Need',
    axis: {
      lineTitle: 'Paradigm Line',
      aboveHint: 'สิ่งที่ตัวละครไล่ตาม — Lie · Want',
      belowHint: 'ความจริงที่ต้องเรียนรู้ — Ghost · Need',
    },
    bands: [
      { label: '1. เริ่มต้น', start: 0 },
      { label: '2. ช่วงแรก', start: 0.25 },
      { label: '3. ช่วงกลาง', start: 0.5 },
      { label: '4. ช่วงท้าย', start: 0.75 },
    ],
    beats: [
      {
        key: 'catalyst',
        label: 'Catalyst',
        fraction: 0.18,
        shape: 'circle',
        color: AMBER,
        group: 'catalyst-want',
        hint: 'เหตุการณ์ที่ทำให้ชีวิตเดิมอยู่ต่อไม่ได้',
      },
      {
        key: 'want',
        label: 'Want',
        fraction: 0.26,
        shape: 'square',
        color: RUST,
        group: 'catalyst-want',
        hint: 'สิ่งที่ตัวละครประกาศว่าต้องการ — เป้าที่มองเห็นได้',
      },
      {
        key: 'progress',
        label: 'Things Go Well',
        fraction: 0.34,
        shape: 'circle',
        color: AMBER,
        hint: 'วิธีเดิมยังใช้ได้ผล ตัวละครยิ่งมั่นใจใน Lie',
      },
      {
        key: 'warning',
        label: 'Warning',
        fraction: 0.42,
        shape: 'circle',
        color: AMBER,
        hint: 'สัญญาณแรกว่าวิธีเดิมมีราคาที่ต้องจ่าย',
      },
      {
        key: 'midpoint',
        label: 'Midpoint',
        fraction: 0.5,
        shape: 'tick',
        color: INK,
        hint: 'จุดที่เดิมพันเปลี่ยน ถอยกลับไปเป็นคนเดิมไม่ได้แล้ว',
      },
      {
        key: 'ghost',
        label: 'Ghost',
        fraction: 0.58,
        shape: 'dotted-circle',
        color: RUST,
        hint: 'อดีตที่ยังไม่ถูกชำระ ย้อนกลับมาขัดขาในปัจจุบัน',
      },
      {
        key: 'low_point',
        label: 'Low Point',
        fraction: 0.66,
        shape: 'circle',
        color: AMBER,
        hint: 'ราคาที่แพงที่สุดของการยึด Lie เอาไว้',
      },
      {
        key: 'aha',
        label: 'Aha!',
        fraction: 0.76,
        shape: 'circle',
        color: AMBER,
        hint: 'ตัวละครมองเห็นความจริงที่หลบมาตลอดเรื่อง',
      },
      {
        key: 'choice',
        label: 'Choice',
        fraction: 0.82,
        shape: 'circle',
        color: AMBER,
        hint: 'เลือกระหว่าง Want ที่คุ้นเคย กับ Need ที่เจ็บกว่า',
      },
      {
        key: 'climax',
        label: 'Climax',
        fraction: 0.9,
        shape: 'tick',
        color: INK,
        hint: 'ลงมือตามสิ่งที่เลือก โดยไม่มีตาข่ายรองรับ',
      },
      {
        key: 'ending',
        label: 'Ending',
        fraction: 0.98,
        shape: 'circle',
        color: AMBER,
        hint: 'ชีวิตใหม่ที่ต่างจากตอนเปิดเรื่องอย่างวัดได้',
      },
    ],
  },
  {
    id: 'three-act',
    name: 'Three Act',
    description:
      'สามองก์แบบคลาสสิก โครงที่กว้างและยืดหยุ่นที่สุด — เหมาะเมื่ออยากเห็นภาพรวมก่อนลงรายละเอียด',
    startHere:
      'ปักสองหมุดให้ได้ก่อน: Inciting Incident ที่เปิดปัญหา และ Climax ที่ปิดมัน แล้วถามว่าอะไรทำให้ระยะกลางยาวขนาดนั้น — คำตอบคือ Midpoint',
    axis: {
      lineTitle: 'เส้นเรื่อง',
      aboveHint: 'ภายนอกที่ไล่ตาม',
      belowHint: 'ความจริงภายใน',
    },
    bands: [
      { label: 'Act 1 · Setup', start: 0 },
      { label: 'Act 2 · Confrontation', start: 0.25 },
      { label: 'Act 3 · Resolution', start: 0.75 },
    ],
    beats: [
      {
        key: 'inciting_incident',
        label: 'Inciting Incident',
        fraction: 0.12,
        shape: 'circle',
        color: AMBER,
        hint: 'เหตุการณ์ที่ยื่นปัญหาของเรื่องให้ตัวละครถือไว้',
      },
      {
        key: 'plot_point_1',
        label: 'Plot Point 1',
        fraction: 0.26,
        shape: 'tick',
        color: INK,
        hint: 'ตัวละครตัดสินใจเข้าสู่โลกใหม่ของเรื่อง',
      },
      {
        key: 'midpoint',
        label: 'Midpoint',
        fraction: 0.5,
        shape: 'tick',
        color: INK,
        hint: 'ความจริงกลางเรื่องที่พลิกจากตั้งรับเป็นรุก',
      },
      {
        key: 'plot_point_2',
        label: 'Plot Point 2',
        fraction: 0.75,
        shape: 'tick',
        color: INK,
        hint: 'ทางเลือกสุดท้ายหมดลง เหลือทางเดียวคือเผชิญหน้า',
      },
      {
        key: 'climax',
        label: 'Climax',
        fraction: 0.88,
        shape: 'tick',
        color: INK,
        hint: 'การเผชิญหน้าที่ตอบคำถามหลักของเรื่อง',
      },
      {
        key: 'resolution',
        label: 'Resolution',
        fraction: 0.97,
        shape: 'circle',
        color: AMBER,
        hint: 'โลกหลังพายุ — ให้คนอ่านเห็นว่าอะไรเปลี่ยนไปจริง',
      },
    ],
  },
  {
    id: 'save-the-cat',
    name: 'Save the Cat',
    description:
      'ผังบีตละเอียด 15 จุด อ้างตำแหน่งตามสัดส่วนหน้า — เหมาะกับงานที่ต้องคุมจังหวะแน่น เช่นบทภาพยนตร์',
    startHere:
      'เขียน logline หนึ่งบรรทัดก่อนแตะกระดาน แล้วปักสามหมุดหลัก Catalyst · Midpoint · All Is Lost จากนั้นค่อยเติมบีตที่เหลือเข้าไปในช่องว่าง',
    axis: {
      lineTitle: 'เส้นเรื่อง',
      aboveHint: 'ภายนอกที่ไล่ตาม',
      belowHint: 'ความจริงภายใน',
    },
    bands: [
      { label: 'Act 1 · Setup', start: 0 },
      { label: 'Fun & Games', start: 0.2 },
      { label: 'Bad Guys Close In', start: 0.5 },
      { label: 'Finale', start: 0.75 },
    ],
    beats: [
      {
        key: 'opening_image',
        label: 'Opening Image',
        fraction: 0.01,
        shape: 'circle',
        color: AMBER,
        hint: 'ภาพแรกที่บอกว่าโลกและตัวละครเป็นอย่างไรก่อนเปลี่ยน',
      },
      {
        key: 'theme_stated',
        label: 'Theme Stated',
        fraction: 0.045,
        shape: 'circle',
        color: AMBER,
        tier: 1,
        hint: 'ใครคนหนึ่งพูดแก่นเรื่องออกมา ตอนที่ตัวละครยังไม่พร้อมฟัง',
      },
      {
        key: 'setup',
        label: 'Setup',
        fraction: 0.08,
        shape: 'circle',
        color: AMBER,
        hint: 'ชีวิตปกติและสิ่งที่ขาด — ทุกอย่างที่ต้องซ่อมภายหลัง',
      },
      {
        key: 'catalyst',
        label: 'Catalyst',
        fraction: 0.11,
        shape: 'circle',
        color: AMBER,
        tier: 1,
        hint: 'ข่าวหรือเหตุการณ์ที่ทำลายสมดุลของชีวิตปกติ',
      },
      {
        key: 'debate',
        label: 'Debate',
        fraction: 0.16,
        shape: 'circle',
        color: AMBER,
        hint: 'ตัวละครลังเล — คำถามคือ "จะกล้าไปไหม"',
      },
      {
        key: 'break_into_two',
        label: 'Break into Two',
        fraction: 0.22,
        shape: 'tick',
        color: INK,
        tier: 1,
        hint: 'ก้าวออกจากโลกเดิมด้วยการเลือกเอง ไม่ใช่ถูกลาก',
      },
      {
        key: 'b_story',
        label: 'B Story',
        fraction: 0.27,
        shape: 'circle',
        color: AMBER,
        hint: 'เส้นเรื่องรองที่แบกแก่น มักมาในรูปความสัมพันธ์',
      },
      {
        key: 'fun_and_games',
        label: 'Fun and Games',
        fraction: 0.35,
        shape: 'circle',
        color: AMBER,
        tier: 1,
        hint: 'คำสัญญาของเรื่อง — สิ่งที่คนดูซื้อตั๋วเข้ามาดู',
      },
      {
        key: 'midpoint',
        label: 'Midpoint',
        fraction: 0.5,
        shape: 'tick',
        color: INK,
        hint: 'ชัยชนะหรือความพ่ายแพ้ลวง ที่ทำให้เดิมพันขึ้นจริง',
      },
      {
        key: 'bad_guys_close_in',
        label: 'Bad Guys Close In',
        fraction: 0.58,
        shape: 'circle',
        color: AMBER,
        tier: 1,
        hint: 'แรงกดจากภายนอกและรอยร้าวจากภายในบีบเข้าหากัน',
      },
      {
        key: 'all_is_lost',
        label: 'All Is Lost',
        fraction: 0.68,
        shape: 'square',
        color: RUST,
        hint: 'สิ่งที่ตัวละครพึ่งพาถูกพรากไป มักมีกลิ่นของความตาย',
      },
      {
        key: 'dark_night',
        label: 'Dark Night of the Soul',
        fraction: 0.72,
        shape: 'dotted-circle',
        color: RUST,
        tier: 1,
        hint: 'ช่วงไว้อาลัยของเก่า ก่อนจะยอมรับความจริงใหม่',
      },
      {
        key: 'break_into_three',
        label: 'Break into Three',
        fraction: 0.77,
        shape: 'tick',
        color: INK,
        hint: 'คำตอบมาจากการรวมเส้น A กับ B เข้าด้วยกัน',
      },
      {
        key: 'finale',
        label: 'Finale',
        fraction: 0.88,
        shape: 'tick',
        color: INK,
        tier: 1,
        hint: 'ลงมือแก้ด้วยบทเรียนที่เพิ่งได้ และรื้อโลกเก่าลง',
      },
      {
        key: 'final_image',
        label: 'Final Image',
        fraction: 0.99,
        shape: 'circle',
        color: AMBER,
        hint: 'ภาพคู่ตรงข้ามของ Opening Image — หลักฐานว่าเปลี่ยนแล้ว',
      },
    ],
  },
  {
    id: 'kishotenketsu',
    name: 'Kishōtenketsu',
    description:
      'โครงสี่ขั้นแบบเอเชียตะวันออกที่ไม่ต้องมีความขัดแย้งเป็นเครื่องยนต์ — เหมาะกับเรื่องสั้น เรื่องชีวิต และงานที่เดินด้วยการเปลี่ยนมุมมอง',
    startHere:
      'หา 転 Ten ให้ได้ก่อนเป็นอย่างแรก: อะไรที่โผล่เข้ามาแล้วทำให้ทุกอย่างก่อนหน้ามีความหมายใหม่ เมื่อได้จุดนั้นแล้วจึงถอยกลับไปเขียน 起 กับ 承 ให้เป็นชีวิตปกติที่เงียบพอจะถูกพลิก',
    axis: {
      lineTitle: 'เส้น 起承転結',
      aboveHint: 'โลกตามที่เล่า',
      belowHint: 'ความหมายที่ถูกพลิก',
    },
    bands: [
      { label: '起 Ki · เปิดโลก', start: 0 },
      { label: '承 Shō · ขยายความ', start: 0.25 },
      { label: '転 Ten · จุดพลิก', start: 0.5 },
      { label: '結 Ketsu · คลี่คลาย', start: 0.75 },
    ],
    beats: [
      {
        key: 'ki',
        label: '起 เปิดโลก',
        fraction: 0.125,
        shape: 'circle',
        color: AMBER,
        hint: 'แนะนำผู้คนและสถานที่ตามที่เป็นอยู่ ยังไม่ต้องมีปัญหา',
      },
      {
        key: 'sho',
        label: '承 ขยายความ',
        fraction: 0.375,
        shape: 'circle',
        color: AMBER,
        hint: 'อยู่กับโลกนั้นต่อให้ลึกขึ้น ให้คนอ่านคุ้นจนวางใจ',
      },
      {
        key: 'ten',
        label: '転 จุดพลิก',
        fraction: 0.625,
        shape: 'tick',
        color: INK,
        hint: 'สิ่งที่ไม่เกี่ยวข้องเลยปรากฏขึ้น และเปลี่ยนความหมายของทุกอย่างก่อนหน้า',
      },
      {
        key: 'ketsu',
        label: '結 คลี่คลาย',
        fraction: 0.875,
        shape: 'circle',
        color: AMBER,
        hint: 'วางสองส่วนไว้ข้างกันจนเห็นภาพรวมใหม่ ไม่ใช่การเอาชนะ',
      },
    ],
  },
  {
    id: 'heros-journey',
    name: "Hero's Journey",
    description:
      'การเดินทางของวีรบุรุษแบบ Vogler — 12 บีตใน 3 ช่วง Departure · Initiation · Return เหมาะกับเรื่องผจญภัยที่ตัวละครต้องเปลี่ยนตัวตน',
    startHere:
      'ปักสามหมุดก่อน: Call to Adventure ที่ยื่นคำเชิญ Crossing the Threshold ที่ก้าวออก และ Ordeal ที่เกือบตาย — แล้วถามว่าวีรบุรุษกลับมาพร้อมอะไรใน Return with the Elixir',
    axis: {
      lineTitle: 'เส้นการเดินทาง',
      aboveHint: 'โลกภายนอกของการผจญภัย',
      belowHint: 'การเปลี่ยนแปลงภายในวีรบุรุษ',
    },
    bands: [
      { label: 'Departure', start: 0 },
      { label: 'Initiation', start: 0.25 },
      { label: 'Return', start: 0.75 },
    ],
    beats: [
      {
        key: 'ordinary_world',
        label: 'Ordinary World',
        fraction: 0.03,
        shape: 'circle',
        color: AMBER,
        hint: 'ชีวิตปกติก่อนคำเชิญ — ให้เห็นว่าขาดอะไรอยู่',
      },
      {
        key: 'call_to_adventure',
        label: 'Call to Adventure',
        fraction: 0.09,
        shape: 'circle',
        color: AMBER,
        tier: 1,
        hint: 'ข่าวหรือเหตุการณ์ที่ยื่นการผจญภัยให้ถือ',
      },
      {
        key: 'refusal',
        label: 'Refusal of the Call',
        fraction: 0.15,
        shape: 'circle',
        color: AMBER,
        hint: 'ลังเลหรือปฏิเสธ — ความกลัวยังใหญ่กว่าความอยาก',
      },
      {
        key: 'mentor',
        label: 'Meeting the Mentor',
        fraction: 0.21,
        shape: 'circle',
        color: AMBER,
        tier: 1,
        hint: 'ได้คำแนะนำ เครื่องมือ หรือความเชื่อมั่นพอจะก้าวออก',
      },
      {
        key: 'threshold',
        label: 'Crossing the Threshold',
        fraction: 0.27,
        shape: 'tick',
        color: INK,
        hint: 'ก้าวเข้าสู่โลกพิเศษ — ถอยกลับไปเป็นคนเดิมไม่ได้แล้ว',
      },
      {
        key: 'tests_allies',
        label: 'Tests, Allies, Enemies',
        fraction: 0.35,
        shape: 'circle',
        color: AMBER,
        hint: 'เรียนรู้กฎของโลกใหม่ หาพวก และเห็นศัตรู',
      },
      {
        key: 'approach',
        label: 'Approach to the Inmost Cave',
        fraction: 0.43,
        shape: 'circle',
        color: AMBER,
        tier: 1,
        hint: 'เตรียมตัวเข้าใกล้หัวใจของอันตราย',
      },
      {
        key: 'ordeal',
        label: 'Ordeal',
        fraction: 0.51,
        shape: 'tick',
        color: INK,
        hint: 'เผชิญความตายหรือความพ่ายแพ้ครั้งใหญ่ — จุดพลิกตัวตน',
      },
      {
        key: 'reward',
        label: 'Reward',
        fraction: 0.59,
        shape: 'square',
        color: RUST,
        tier: 1,
        hint: 'ได้สิ่งที่ตามหา หลังรอดจาก Ordeal',
      },
      {
        key: 'road_back',
        label: 'The Road Back',
        fraction: 0.67,
        shape: 'circle',
        color: AMBER,
        hint: 'ตัดสินใจกลับ — แต่โลกเก่ายังไม่ยอมปล่อยง่ายๆ',
      },
      {
        key: 'resurrection',
        label: 'Resurrection',
        fraction: 0.75,
        shape: 'tick',
        color: INK,
        hint: 'บททดสอบสุดท้ายที่พิสูจน์ว่าเปลี่ยนจริง ไม่ใช่แค่รอดมา',
      },
      {
        key: 'return_elixir',
        label: 'Return with the Elixir',
        fraction: 0.93,
        shape: 'circle',
        color: AMBER,
        hint: 'กลับสู่โลกเดิมพร้อมของขวัญ — หลักฐานว่าการเดินทางคุ้มค่า',
      },
    ],
  },
]

export const DEFAULT_STRUCTURE_ID = 'four-phase'

/** Look up a template by id, falling back to the default (4 Phase). */
export function getStructureTemplate(id: string): StructureTemplate {
  return (
    STRUCTURE_TEMPLATES.find((t) => t.id === id) ?? STRUCTURE_TEMPLATES[0]
  )
}

/** The beat definition for a key within one template. */
export function templateBeat(
  template: StructureTemplate,
  key: string | undefined,
): TemplateBeat | undefined {
  if (key === undefined) return undefined
  return template.beats.find((b) => b.key === key)
}

/**
 * The beat definition for a key, searching the given template first and then
 * every other template. Scenes keep their beat tag when the author switches
 * structures, so labels must still resolve for a beat the current template
 * does not define.
 */
export function findBeatAnywhere(
  key: string | undefined,
  template?: StructureTemplate,
): TemplateBeat | undefined {
  if (key === undefined) return undefined
  const here = template && templateBeat(template, key)
  if (here) return here
  for (const t of STRUCTURE_TEMPLATES) {
    const found = t.beats.find((b) => b.key === key)
    if (found) return found
  }
  return undefined
}

/** Display label for a beat key, falling back to the raw key. */
export function beatLabel(
  key: string | undefined,
  template?: StructureTemplate,
): string {
  if (key === undefined) return ''
  return findBeatAnywhere(key, template)?.label ?? key
}

/**
 * Index of the band that contains a given x-position, expressed as a fraction
 * (0..1) of the board width. Positions left of the first band clamp to 0;
 * positions past the last band clamp to the last band. This makes a scene's
 * band a pure function of where it sits under the current template.
 */
export function bandIndexForX(
  fraction: number,
  template: StructureTemplate,
): number {
  const bands = template.bands
  let idx = 0
  for (let i = 0; i < bands.length; i++) {
    if (fraction >= bands[i].start) idx = i
    else break
  }
  return idx
}

/** [start, end) fractions of a band by index. Last band ends at 1. */
export function bandRange(
  index: number,
  template: StructureTemplate,
): [number, number] {
  const start = template.bands[index]?.start ?? 0
  const end = template.bands[index + 1]?.start ?? 1
  return [start, end]
}

/** Horizontal centre of a band as a fraction (0..1) of the board width. */
export function bandCenterFraction(
  index: number,
  template: StructureTemplate,
): number {
  const [start, end] = bandRange(index, template)
  return (start + end) / 2
}

/**
 * Which band a beat belongs to. Derived from the beat's own fraction rather
 * than declared separately, so a marker can never disagree with the band it
 * visibly sits in.
 */
export function beatBandIndex(
  beat: TemplateBeat,
  template: StructureTemplate,
): number {
  return bandIndexForX(beat.fraction, template)
}

/**
 * The default set of markers for a template, ready to drop on the paradigm
 * line. Each marker carries its coaching hint as the description, so a fresh
 * structure arrives already explaining itself.
 */
export function templateBeatMarkers(
  template: StructureTemplate,
): BeatMarker[] {
  return template.beats.map((beat) => ({
    id: `beat-${beat.key}`,
    type: beat.key,
    title: beat.label,
    description: beat.hint,
    // Markers ride 12px above the line (mirrors canvas BEAT_LINE_Y).
    position: { x: beat.fraction * BOARD_WIDTH, y: PARADIGM_LINE_Y - 12 },
    locked: false,
  }))
}
