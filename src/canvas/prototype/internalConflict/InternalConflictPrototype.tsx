/**
 * PROTOTYPE — how should per-scene internal conflict look on the board?
 *
 * Three structurally different treatments of the same sample scene.
 * Switch with ?conflict=A|B|C (see README.md). Not production UI.
 */

import type { ReactNode } from 'react'
import { PrototypeSwitcher } from '../PrototypeSwitcher'
import { useSearchParam } from '../useSearchParam'

export const CONFLICT_VARIANTS = ['A', 'B', 'C'] as const
export type ConflictVariant = (typeof CONFLICT_VARIANTS)[number]

export const CONFLICT_LABELS: Record<ConflictVariant, string> = {
  A: 'นอก· / ใน· footer',
  B: 'สองคอลัมน์แรงต้าน',
  C: 'ชิปเส้น + เจ็บตอนนี้',
}

const SAMPLE = {
  title: 'แอลเปิดสมุดวันแรก',
  who: 'แอล',
  action: 'เขียนชื่อคิวลงหน้าแรกของสมุด',
  outcome: 'เขียนได้สามบรรทัดแล้วปิดสมุด',
  location: 'ห้องเช่า ตีสอง',
  external: 'คิวบล็อกทุกช่องทางโดยไม่อธิบาย',
  internal: 'อยากทักแต่กลัวถูกเมินอีก — ยึด Lie ว่าเงียบปลอดภัยกว่า',
  arc: 'Want' as const,
}

/** Mount over the board when ?conflict= is set (DEV). */
export function InternalConflictPrototypeHost() {
  if (!import.meta.env.DEV) return null
  const [raw, setRaw] = useSearchParam('conflict', '')
  if (!raw || !CONFLICT_VARIANTS.includes(raw as ConflictVariant)) return null
  const variant = raw as ConflictVariant

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center bg-ink/25 p-4"
        data-prototype="internal-conflict-host"
      >
        <div
          className="pointer-events-auto max-h-[90vh] w-full max-w-3xl overflow-auto rounded-md bg-cream p-4 shadow-lg"
          style={{ border: '2px solid rgba(20,22,25,0.22)' }}
        >
          <header className="mb-3 flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-ink/45">
                PROTOTYPE · internal conflict
              </p>
              <h2 className="font-display text-lg font-bold text-ink">
                {variant} — {CONFLICT_LABELS[variant]}
              </h2>
              <p className="mt-0.5 text-[11px] text-ink/55">
                ฉากตัวอย่างเดียวกัน · สลับลูกศรหรือ ← → เพื่อเทียบโครง
              </p>
            </div>
            <button
              type="button"
              className="text-[11px] text-ink/45 hover:text-ink"
              onClick={() => setRaw('')}
            >
              ปิด
            </button>
          </header>
          {variant === 'A' && <VariantA />}
          {variant === 'B' && <VariantB />}
          {variant === 'C' && <VariantC />}
        </div>
      </div>
      <PrototypeSwitcher
        variants={[...CONFLICT_VARIANTS]}
        current={variant}
        labels={CONFLICT_LABELS}
        onChange={setRaw}
      />
    </>
  )
}

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {children}
    </div>
  )
}

function Col({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-ink/40">
        {eyebrow}
      </p>
      {children}
    </div>
  )
}

// ─── A: paired นอก· / ใน· footer (plan default) ─────────────────────────────

function VariantA() {
  return (
    <Stage>
      <Col eyebrow="การ์ดบนกระดาน">
        <FakeCard>
          <CardTitle arc="Want">{SAMPLE.title}</CardTitle>
          <Who>{SAMPLE.who}</Who>
          <Eq op="+" text={SAMPLE.action} />
          <Eq op="=" text={SAMPLE.outcome} strong />
          <div className="mt-2 space-y-0.5 border-t border-ink/10 pt-1.5 text-[12px] text-ink/50">
            <div>ที่: {SAMPLE.location}</div>
            <div>
              <span className="font-display text-ink/35">นอก · </span>
              {SAMPLE.external}
            </div>
            <div>
              <span className="font-display text-ink/35">ใน · </span>
              {SAMPLE.internal}
            </div>
          </div>
        </FakeCard>
        <p className="mt-2 text-[11px] leading-snug text-ink/50">
          Thesis: แรงต้านเป็นคู่ภาษาเดียวกับแกน paradigm — ไม่แย่ง ArcSymbol
        </p>
      </Col>
      <Col eyebrow="ในตัวแก้ไขฉาก">
        <FakeEditor>
          <EditorBlock label="ตัวละครต้องการอะไร" value="เขียนสมุดให้ครบ" />
          <EditorBlock label="ตัวละครทำอะไร" value={SAMPLE.action} />
          <div
            className="rounded px-2 py-2"
            style={{
              border: '1px solid rgba(20,22,25,0.18)',
              background: 'rgba(20,22,25,0.03)',
            }}
          >
            <p className="font-display text-[12px] font-bold text-ink">
              แรงต้านในฉาก
            </p>
            <EditorBlock
              label="อะไรขัดขวางภายนอก"
              value={SAMPLE.external}
              nested
            />
            <EditorBlock
              label="อะไรขัดข้างใน"
              value={SAMPLE.internal}
              nested
            />
          </div>
          <EditorSelect label="แท็กเส้น Ghost / Lie / Want / Need" value="Want" />
        </FakeEditor>
      </Col>
    </Stage>
  )
}

// ─── B: equal dual columns on the card face ─────────────────────────────────

function VariantB() {
  return (
    <Stage>
      <Col eyebrow="การ์ดบนกระดาน">
        <FakeCard>
          <CardTitle arc="Want">{SAMPLE.title}</CardTitle>
          <Who>{SAMPLE.who}</Who>
          <Eq op="+" text={SAMPLE.action} />
          <div
            className="mt-2 grid grid-cols-2 gap-2 border-t border-ink/10 pt-2"
          >
            <div
              className="rounded px-2 py-1.5"
              style={{ background: 'rgba(205,80,66,0.08)' }}
            >
              <p className="font-display text-[10px] font-bold text-rust">
                ภายนอก
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-ink/70">
                {SAMPLE.external}
              </p>
            </div>
            <div
              className="rounded px-2 py-1.5"
              style={{ background: 'rgba(47,156,108,0.1)' }}
            >
              <p className="font-display text-[10px] font-bold text-[color:var(--color-mint-deep)]">
                ภายใน
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-ink/70">
                {SAMPLE.internal}
              </p>
            </div>
          </div>
          <Eq op="=" text={SAMPLE.outcome} strong />
        </FakeCard>
        <p className="mt-2 text-[11px] leading-snug text-ink/50">
          Thesis: นอก/ใน ระดับเดียวกับ action — อ่านแรงต้านก่อนผลลัพธ์
        </p>
      </Col>
      <Col eyebrow="ในตัวแก้ไขฉาก">
        <FakeEditor>
          <EditorBlock label="การกระทำ" value={SAMPLE.action} />
          <div className="grid grid-cols-2 gap-2">
            <EditorBlock label="อุปสรรคภายนอก" value={SAMPLE.external} />
            <EditorBlock label="ความขัดแย้งภายใน" value={SAMPLE.internal} />
          </div>
          <EditorBlock label="ผลลัพธ์" value={SAMPLE.outcome} />
        </FakeEditor>
      </Col>
    </Stage>
  )
}

// ─── C: no paired prose — Backstory chips + one “hurts now” line ────────────

function VariantC() {
  return (
    <Stage>
      <Col eyebrow="การ์ดบนกระดาน">
        <FakeCard>
          <CardTitle arc="Want">{SAMPLE.title}</CardTitle>
          <div className="mb-1.5 flex flex-wrap gap-1 px-0">
            {['Ghost', 'Lie', 'Want'].map((chip, i) => (
              <span
                key={chip}
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{
                  border:
                    i === 2
                      ? '1.5px solid var(--color-rust)'
                      : '1px dotted rgba(20,22,25,0.35)',
                  color: i === 2 ? 'var(--color-rust)' : 'var(--color-ink-soft)',
                  background: i === 2 ? 'rgba(205,80,66,0.08)' : 'transparent',
                }}
              >
                {chip}
                {i < 2 ? ' กด' : ' ขับ'}
              </span>
            ))}
          </div>
          <Who>{SAMPLE.who}</Who>
          <Eq op="+" text={SAMPLE.action} />
          <Eq op="=" text={SAMPLE.outcome} strong />
          <div className="mt-2 border-t border-ink/10 pt-1.5 text-[12px] italic text-ink/55">
            เจ็บตอนนี้ · {SAMPLE.internal}
          </div>
        </FakeCard>
        <p className="mt-2 text-[11px] leading-snug text-ink/50">
          Thesis: ไม่แยกฟิลด์คู่เดียวกับอุปสรรค — ผูกกลับเส้น Backstory แทน
        </p>
      </Col>
      <Col eyebrow="ในตัวแก้ไขฉาก">
        <FakeEditor>
          <p className="text-[11px] font-semibold text-ink">
            ฉากนี้กดเส้นไหน
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Ghost', 'Lie', 'Lie at Work', 'Want', 'Need'].map((chip) => {
              const on = chip === 'Ghost' || chip === 'Lie' || chip === 'Want'
              return (
                <span
                  key={chip}
                  className="rounded px-2 py-1 text-[11px] font-semibold"
                  style={{
                    background: on ? 'var(--color-ink)' : 'white',
                    color: on ? 'var(--color-cream)' : 'var(--color-ink-soft)',
                    border: '1px solid rgba(20,22,25,0.25)',
                  }}
                >
                  {chip}
                </span>
              )
            })}
          </div>
          <EditorBlock label="เจ็บตอนนี้ (ข้อความสั้น)" value={SAMPLE.internal} />
          <EditorBlock label="อุปสรรคภายนอก" value={SAMPLE.external} />
          <p className="text-[10px] leading-snug text-ink/45">
            arcRelation เดี่ยวอาจไม่พอ — ชิปหลายเส้นบอกว่าฉากกด Ghost+Lie พร้อมขับ Want
          </p>
        </FakeEditor>
      </Col>
    </Stage>
  )
}

// ─── shared fake chrome ─────────────────────────────────────────────────────

function FakeCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-full max-w-sm rounded-md bg-white px-3 pb-3 pt-2.5 shadow-sm"
      style={{ border: '1px solid rgba(20,22,25,0.18)' }}
    >
      {children}
    </div>
  )
}

function FakeEditor({ children }: { children: ReactNode }) {
  return (
    <div
      className="space-y-2.5 rounded-md bg-white p-3"
      style={{ border: '1px solid rgba(20,22,25,0.18)' }}
    >
      {children}
    </div>
  )
}

function CardTitle({
  children,
  arc,
}: {
  children: string
  arc: string
}) {
  return (
    <div className="mb-1">
      <h3 className="font-display flex items-start gap-2 text-lg font-semibold leading-snug text-ink">
        <span
          className="mt-[5px] inline-block shrink-0"
          style={{ width: 9, height: 9, background: 'var(--color-rust)' }}
          aria-hidden
        />
        {children}
      </h3>
      <p className="mt-0.5 text-[12px] text-ink/55">{arc}</p>
    </div>
  )
}

function Who({ children }: { children: string }) {
  return (
    <span className="mb-1 inline-flex rounded-full bg-sand/40 px-2 py-0.5 text-[12px] font-medium text-ink">
      {children}
    </span>
  )
}

function Eq({
  op,
  text,
  strong,
}: {
  op: string
  text: string
  strong?: boolean
}) {
  return (
    <div className="mt-1 flex gap-1.5 text-[13px] leading-snug text-ink-soft">
      <span className="font-display shrink-0 text-base text-ink/35" aria-hidden>
        {op}
      </span>
      <span className={strong ? 'font-medium text-ink' : ''}>{text}</span>
    </div>
  )
}

function EditorBlock({
  label,
  value,
  nested,
}: {
  label: string
  value: string
  nested?: boolean
}) {
  return (
    <label className={`block ${nested ? 'mt-2' : ''}`}>
      <span className="text-[11px] font-semibold text-ink">{label}</span>
      <div
        className="mt-0.5 min-h-[2.5rem] rounded px-2 py-1.5 text-[12px] leading-snug text-ink/70"
        style={{
          border: '1px solid rgba(20,22,25,0.2)',
          background: nested ? 'var(--color-cream)' : 'white',
        }}
      >
        {value}
      </div>
    </label>
  )
}

function EditorSelect({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-ink">{label}</span>
      <div
        className="mt-0.5 rounded px-2 py-1.5 text-[12px] text-ink"
        style={{ border: '1px solid rgba(20,22,25,0.2)' }}
      >
        {value}
      </div>
    </label>
  )
}
