import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EDGE_STYLE } from '../canvas/edges/StoryEdge'
import { EDGE_LABELS, type EdgeType } from '../domain/types'
import { useUiStore } from '../store/uiStore'
import { Modal } from './Modal'

/**
 * The guide's table of contents is itself a miniature paradigm line: each
 * section is a beat dot on the line, labels alternating above/below the way
 * scenes sit above (Lie/Want) and below (Ghost/Need) on the real board.
 */
const SECTIONS = [
  { id: 'save', num: '1', label: 'การเซฟ', color: '#2f9c6c' },
  { id: 'cards', num: '2', label: 'เขียนการ์ดฉาก', color: '#e49c4e' },
  { id: 'edges', num: '3', label: 'ลากเส้นเชื่อม', color: '#3d4dec' },
  { id: 'timeline', num: '4', label: 'วางบนไทม์ไลน์', color: '#cd5042' },
  { id: 'example', num: '5', label: 'ตัวอย่างการใช้งาน', color: '#141619' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const EDGE_TYPES: EdgeType[] = [
  'actual_path',
  'expected_want_path',
  'better_outcome_path',
  'failure_path',
  'character_arc',
]

export function HelpDialog() {
  const open = useUiStore((s) => s.dialog === 'help')
  const closeDialog = useUiStore((s) => s.closeDialog)

  if (!open) return null
  return (
    <Modal title="วิธีใช้งาน Plotline Board" onClose={closeDialog} wide>
      <HelpContent />
    </Modal>
  )
}

function HelpContent() {
  const [active, setActive] = useState<SectionId>('save')
  const contentRef = useRef<HTMLDivElement>(null)

  // Scroll-spy: light up the beat dot for the section currently in view.
  useEffect(() => {
    const scroller = contentRef.current?.parentElement
    if (!scroller) return
    function onScroll() {
      const marker = scroller!.getBoundingClientRect().top + 140
      let current: SectionId = SECTIONS[0].id
      for (const s of SECTIONS) {
        const el = document.getElementById(`help-${s.id}`)
        if (el && el.getBoundingClientRect().top <= marker) current = s.id
      }
      setActive(current)
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  function jumpTo(id: SectionId) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .getElementById(`help-${id}`)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div ref={contentRef}>
      {/* Beat-line navigation */}
      <nav
        className="sticky top-0 z-10 -mx-4 -mt-4 mb-5 bg-cream px-6 pt-1"
        style={{ borderBottom: '1px solid rgba(20,22,25,0.12)' }}
        aria-label="หัวข้อในคู่มือ"
      >
        <div className="relative flex h-[72px] items-center">
          <span
            className="absolute inset-x-1 top-1/2 h-[1.5px] bg-ink/60"
            aria-hidden
          />
          {SECTIONS.map((s, i) => {
            const isActive = s.id === active
            const above = i % 2 === 0
            return (
              <button
                key={s.id}
                type="button"
                className="group relative flex h-full flex-1 items-center justify-center"
                onClick={() => jumpTo(s.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span
                  className="rounded-full transition-all duration-150"
                  style={{
                    width: isActive ? 13 : 9,
                    height: isActive ? 13 : 9,
                    background: s.color,
                    boxShadow: isActive
                      ? `0 0 0 4px ${s.color}26`
                      : '0 0 0 2px var(--color-cream)',
                  }}
                  aria-hidden
                />
                <span
                  className={[
                    'absolute left-1/2 w-max -translate-x-1/2 text-[11px] leading-tight transition-colors',
                    above ? 'top-1.5' : 'bottom-1.5',
                    isActive
                      ? 'font-bold text-ink'
                      : 'text-ink/55 group-hover:text-ink',
                  ].join(' ')}
                >
                  <span className="font-display mr-1" style={{ color: s.color }}>
                    {s.num}
                  </span>
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <Section id="save" num="1" title="การเซฟ" color="#2f9c6c">
        <p>
          งานของคุณ<strong>บันทึกอัตโนมัติ</strong>ลงในเบราว์เซอร์เครื่องนี้
          ทุกครั้งที่แก้ไข — ไม่มีปุ่มเซฟ ดูสถานะได้ที่มุมขวาบน:{' '}
          <em className="not-italic text-[color:var(--color-mint-deep)]">
            บันทึกแล้ว
          </em>{' '}
          แปลว่าเรียบร้อย
        </p>
        <p>
          ถ้าต้องการสำรองไฟล์หรือย้ายเครื่อง ใช้เมนู <Kbd>⋯</Kbd> →{' '}
          <strong>Export JSON</strong> เพื่อดาวน์โหลดโปรเจกต์เป็นไฟล์ แล้วเปิดคืนด้วย{' '}
          <strong>Import JSON</strong> (การนำเข้าจะแทนที่งานปัจจุบันทั้งหมด)
        </p>
        <Tip>
          ล้างข้อมูลเบราว์เซอร์ = งานหาย อย่าลืม Export JSON เก็บไว้เป็นระยะ
        </Tip>
      </Section>

      <Section id="cards" num="2" title="เขียนการ์ดฉาก" color="#e49c4e">
        <ul className="space-y-2">
          <li>
            กดปุ่ม <Kbd>+ Scene</Kbd> ที่แถบบน — การ์ดใหม่จะปรากฏบนกระดาน
            พร้อมเปิดแผงแก้ไขให้กรอก ชื่อฉาก สถานที่ ตัวละคร เป้าหมาย การกระทำ
            อุปสรรค และผลลัพธ์
          </li>
          <li>
            <Kbd>ดับเบิลคลิก</Kbd> การ์ดใดก็ได้เพื่อเปิดแผงแก้ไขอีกครั้ง
            ในแผงมีปุ่ม <strong>ทำสำเนา</strong> และ <strong>ลบฉาก</strong> ด้วย
          </li>
          <li>
            คัดลอกการ์ดที่เลือกด้วย <Kbd>⌘C</Kbd> แล้ววางด้วย <Kbd>⌘V</Kbd>{' '}
            (Windows ใช้ <Kbd>Ctrl</Kbd>) — ลบการ์ดหรือเส้นที่เลือกด้วย{' '}
            <Kbd>Delete</Kbd>
          </li>
          <li>
            คลิกชื่อฉากในแผงรายการด้านซ้าย (แท็บ Story Action)
            เพื่อกระโดดไปหาการ์ดนั้นบนกระดาน
          </li>
        </ul>
      </Section>

      <Section id="edges" num="3" title="ลากเส้นเชื่อม" color="#3d4dec">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            เลือกชนิดเส้นก่อน จากแผง <strong>ชนิดเส้น</strong> มุมซ้ายบนของกระดาน
          </li>
          <li>
            ชี้เมาส์ที่การ์ดต้นทาง จะเห็นจุดเชื่อมโผล่ทั้ง 4 ด้าน —
            ลากจากจุดนั้นไปปล่อยบนการ์ดปลายทาง
          </li>
          <li>
            คลิกเส้นที่วาดแล้วเพื่อเปิดแผงแก้ไขด้านล่าง: เปลี่ยนชนิด ใส่ป้ายกำกับ
            หรือลบเส้น
          </li>
        </ol>
        <div
          className="mt-3 rounded-md bg-white/70 px-3 py-2.5"
          style={{ border: '1px solid rgba(20,22,25,0.12)' }}
        >
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
            ชนิดเส้นทั้ง 5
          </p>
          <ul className="space-y-1">
            {EDGE_TYPES.map((type) => (
              <li key={type} className="flex items-center gap-2.5 text-[13px]">
                <EdgePreview type={type} />
                {EDGE_LABELS[type]}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="timeline" num="4" title="วางบนไทม์ไลน์" color="#cd5042">
        <p>
          กระดานคือไทม์ไลน์ของเรื่อง แบ่งเป็น 4 ช่วง (เริ่มต้น → ช่วงแรก →
          ช่วงกลาง → ช่วงท้าย) โดยมี<strong>เส้น Paradigm</strong>{' '}
          พาดแนวนอนตรงกลาง
        </p>
        <ul className="mt-2 space-y-2">
          <li>
            <strong>ลากซ้าย–ขวา</strong> เพื่อเลื่อนฉากไปช่วงอื่นของเรื่อง —
            ช่วง (Phase) ของฉากเปลี่ยนตามตำแหน่งอัตโนมัติ
          </li>
          <li>
            <strong>เหนือเส้น</strong> = ฉากที่ขับด้วย Lie / Want ·{' '}
            <strong>ใต้เส้น</strong> = ฉากที่ขับด้วย Ghost / Need
          </li>
          <li>
            หมุด Beat (Catalyst, Midpoint, Climax …) เกาะอยู่บนเส้น
            ลากได้เฉพาะแนวนอน
          </li>
          <li>
            ปุ่ม <Kbd>จัดเรียงอัตโนมัติ</Kbd> ที่แถบบน จัดผังทั้งกระดานให้ทันที
            (กดปุ่มเลิกทำ <Kbd>↶</Kbd> เพื่อย้อนกลับได้)
          </li>
          <li>
            สลับมุมมอง <strong>เวลาในเรื่อง / ลำดับเล่า</strong> ที่มุมซ้ายบนของกระดาน
            เพื่อดูลำดับเหตุการณ์จริง เทียบกับลำดับการเล่า — และติ๊ก{' '}
            <strong>จับแนวกริด</strong> ที่มุมขวาบน ถ้าอยากให้การ์ดเรียงเป็นระเบียบ
          </li>
        </ul>
      </Section>

      <Section id="example" num="5" title="ตัวอย่างการใช้งาน" color="#141619">
        <p className="mb-3">
          เริ่มเรื่องใหม่หนึ่งเรื่อง ครบใน 5 ขั้น:
        </p>
        <ol className="space-y-2.5">
          {[
            [
              'ปูพื้นตัวละคร',
              'กรอก Ghost / Lie / Want / Need ในแท็บ Backstory ด้านซ้าย ให้กระดานรู้ว่าแกนเรื่องคืออะไร',
            ],
            [
              'สร้างฉากสำคัญ',
              'กด + Scene สัก 5–6 ฉาก กรอกอย่างน้อยชื่อฉากกับการกระทำ (Action) ของแต่ละฉาก',
            ],
            [
              'วางลงไทม์ไลน์',
              'ลากการ์ดไปตามช่วงเรื่อง 4 ช่วง ฉากที่ตัวละครไล่ตาม Want ไว้เหนือเส้น ฉากที่แผล Ghost ทำงานไว้ใต้เส้น',
            ],
            [
              'ลากเส้นเชื่อมเรื่อง',
              'เลือกชนิดเส้น "เหตุการณ์จริง" แล้วเชื่อมฉากตามลำดับ จากนั้นใช้เส้นชนิดอื่นวาดทางแยกที่คาดหวัง / ล้มเหลว',
            ],
            [
              'ตรวจและแชร์',
              'สลับไปมุมมอง "ลำดับเล่า" ตรวจลำดับการเล่า แล้วใช้ Export PNG ในเมนู ··· เพื่อแชร์กระดานเป็นภาพ',
            ],
          ].map(([head, body], i) => (
            <li key={head} className="flex gap-3">
              <span
                className="font-display mt-0.5 w-5 shrink-0 text-right text-base font-bold text-rust"
                aria-hidden
              >
                {i + 1}
              </span>
              <span>
                <strong>{head}</strong> — {body}
              </span>
            </li>
          ))}
        </ol>
        <Tip>
          จะโพสต์ลงเฟซบุ๊ก? ในหน้าต่าง Export PNG เลือก{' '}
          <strong>แบ่งเป็นหลายภาพ</strong> — เฟซบุ๊กย่อทุกภาพเหลือ 2048px
          กระดานใหญ่ในภาพเดียวจะอ่านไม่ออก แบบแบ่งภาพจะตัดกระดานเป็นช่วงๆ
          ให้ยังอ่านชัด แล้วอัปโหลดเป็นอัลบั้มในโพสต์เดียวได้เลย
        </Tip>
      </Section>

      {/* Persistent download bar */}
      <div
        className="sticky bottom-0 -mx-4 -mb-4 mt-6 flex items-center justify-between gap-3 bg-cream px-4 py-3"
        style={{ borderTop: '1px solid rgba(20,22,25,0.15)' }}
      >
        <span className="text-xs text-ink/55">
          เก็บคู่มือฉบับเต็มไว้อ่านนอกจอ หรือส่งต่อให้ทีม
        </span>
        <a
          href={`${import.meta.env.BASE_URL}user-guide.pdf`}
          download="Plotline-Board-user-guide.pdf"
          className="shrink-0 rounded bg-ink px-3 py-1.5 text-sm font-semibold text-cream hover:bg-ink/85"
        >
          ดาวน์โหลดคู่มือ PDF
        </a>
      </div>
    </div>
  )
}

function Section({
  id,
  num,
  title,
  color,
  children,
}: {
  id: SectionId
  num: string
  title: string
  color: string
  children: ReactNode
}) {
  return (
    <section
      id={`help-${id}`}
      className="mb-7 scroll-mt-24 text-sm leading-relaxed text-ink"
    >
      <h3 className="font-display mb-2 flex items-baseline gap-2 text-lg font-bold text-ink">
        <span
          className="relative top-[-2px] inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
          aria-hidden
        />
        <span style={{ color }}>{num}</span>
        {title}
      </h3>
      <div className="space-y-2 pl-[18px]">{children}</div>
    </section>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="rounded bg-white px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink"
      style={{
        border: '1px solid rgba(20,22,25,0.3)',
        boxShadow: '0 1.5px 0 rgba(20,22,25,0.25)',
      }}
    >
      {children}
    </kbd>
  )
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <p
      className="rounded px-3 py-2 text-[13px] text-ink"
      style={{
        border: '1px solid rgba(228,156,78,0.6)',
        background: 'rgba(236,198,140,0.18)',
      }}
    >
      {children}
    </p>
  )
}

function EdgePreview({ type }: { type: EdgeType }) {
  const style = EDGE_STYLE[type]
  return (
    <svg width="32" height="8" aria-hidden className="shrink-0">
      <line
        x1="0"
        y1="4"
        x2="32"
        y2="4"
        stroke={style.stroke}
        strokeWidth="2.5"
        strokeDasharray={style.dashed ? '5 3' : undefined}
      />
    </svg>
  )
}
