/**
 * PROTOTYPE — how should story layer (meta/character/memory/ghost) appear on cards?
 *
 * Question: scoped layer field + suggest flow — does it feel right without clutter?
 * Switch with ?layerField=A|B|C|AC (see README.md). Not production UI.
 */

import { useMemo, useState, type ReactNode } from 'react'
import { PrototypeSwitcher } from '../PrototypeSwitcher'
import { useSearchParam } from '../useSearchParam'
import {
  LAYER_COLORS,
  LAYER_HINTS,
  LAYER_LABELS,
  SAMPLE_SCENES,
  STORY_LAYERS,
  suggestLayer,
  type SampleScene,
  type StoryLayer,
} from './suggestLayer'

export const LAYER_FIELD_VARIANTS = ['A', 'B', 'C', 'AC'] as const
export type LayerFieldVariant = (typeof LAYER_FIELD_VARIANTS)[number]

export const LAYER_FIELD_LABELS: Record<LayerFieldVariant, string> = {
  A: 'ชิป meta + บล็อก editor',
  B: 'แถบสีซ้าย + แผงลอย',
  C: 'แสดงเมื่อ ≠ CHARACTER',
  AC: 'A+C · ชิปเมื่อเลื่อนชั้น',
}

export function StoryLayerPrototypeHost() {
  if (!import.meta.env.DEV) return null
  const [raw, setRaw] = useSearchParam('layerField', '')
  if (!raw || !LAYER_FIELD_VARIANTS.includes(raw as LayerFieldVariant)) return null
  const variant = raw as LayerFieldVariant

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center bg-ink/30 p-3"
        data-prototype="story-layer-host"
      >
        <div
          className="pointer-events-auto flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-md bg-cream shadow-lg"
          style={{ border: '2px solid rgba(20,22,25,0.22)' }}
        >
          <StoryLayerPrototypeBody variant={variant} onClose={() => setRaw('')} />
        </div>
      </div>
      <PrototypeSwitcher
        variants={[...LAYER_FIELD_VARIANTS]}
        current={variant}
        labels={LAYER_FIELD_LABELS}
        onChange={setRaw}
      />
    </>
  )
}

function StoryLayerPrototypeBody({
  variant,
  onClose,
}: {
  variant: LayerFieldVariant
  onClose: () => void
}) {
  const [scenes, setScenes] = useState<SampleScene[]>(() =>
    SAMPLE_SCENES.map((s) => ({ ...s })),
  )
  const [selectedId, setSelectedId] = useState(SAMPLE_SCENES[0].id)
  const [suggestions, setSuggestions] = useState<
    Record<string, ReturnType<typeof suggestLayer>>
  >({})
  const [showSuggestPanel, setShowSuggestPanel] = useState(false)

  const selected = scenes.find((s) => s.id === selectedId) ?? scenes[0]

  const pending = useMemo(
    () =>
      scenes.filter((s) => {
        const sug = suggestions[s.id]
        return sug && s.layer !== sug.layer && !s.userSet
      }),
    [scenes, suggestions],
  )

  function runSuggest() {
    const next: typeof suggestions = {}
    for (const s of scenes) {
      if (!s.userSet) next[s.id] = suggestLayer(s)
    }
    setSuggestions(next)
    setShowSuggestPanel(true)
  }

  function acceptOne(id: string) {
    const sug = suggestions[id]
    if (!sug) return
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, layer: sug.layer } : s)),
    )
  }

  function acceptAll() {
    setScenes((prev) =>
      prev.map((s) => {
        if (s.userSet) return s
        const sug = suggestions[s.id]
        return sug ? { ...s, layer: sug.layer } : s
      }),
    )
  }

  function setLayer(id: string, layer: StoryLayer) {
    setScenes((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, layer, userSet: true } : s,
      ),
    )
  }

  return (
    <>
      <header className="flex shrink-0 items-baseline justify-between gap-2 border-b border-ink/10 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-ink/45">
            PROTOTYPE · story layer · โครง layered-memory
          </p>
          <h2 className="font-display text-lg font-bold text-ink">
            {variant} — {LAYER_FIELD_LABELS[variant]}
          </h2>
          <p className="mt-0.5 text-[11px] text-ink/55">
            ช่อง layer เห็นเฉพาะโครงนี้ · default CHARACTER · ไม่เขียน store
          </p>
        </div>
        <button
          type="button"
          className="text-[11px] text-ink/45 hover:text-ink"
          onClick={onClose}
        >
          ปิด
        </button>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-ink/10 px-4 py-2">
        <StructureBadge />
        <button
          type="button"
          className="rounded px-2.5 py-1 text-[11px] font-semibold text-cream"
          style={{ background: 'var(--color-ink)' }}
          onClick={runSuggest}
        >
          แนะนำเลน
        </button>
        {Object.keys(suggestions).length > 0 && (
          <span className="text-[11px] text-ink/50">
            รอยืนยัน {pending.length} ใบ
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {variant === 'A' && (
          <VariantA
            scenes={scenes}
            selected={selected}
            suggestions={suggestions}
            showSuggestPanel={showSuggestPanel}
            onSelect={setSelectedId}
            onSetLayer={setLayer}
            onAcceptOne={acceptOne}
            onAcceptAll={acceptAll}
            onDismissSuggest={() => setShowSuggestPanel(false)}
          />
        )}
        {variant === 'B' && (
          <VariantB
            scenes={scenes}
            selected={selected}
            suggestions={suggestions}
            showSuggestPanel={showSuggestPanel}
            onSelect={setSelectedId}
            onSetLayer={setLayer}
            onAcceptOne={acceptOne}
            onAcceptAll={acceptAll}
            onDismissSuggest={() => setShowSuggestPanel(false)}
          />
        )}
        {variant === 'C' && (
          <VariantC
            scenes={scenes}
            selected={selected}
            suggestions={suggestions}
            showSuggestPanel={showSuggestPanel}
            onSelect={setSelectedId}
            onSetLayer={setLayer}
            onAcceptOne={acceptOne}
            onAcceptAll={acceptAll}
            onDismissSuggest={() => setShowSuggestPanel(false)}
          />
        )}
        {variant === 'AC' && (
          <VariantAC
            scenes={scenes}
            selected={selected}
            suggestions={suggestions}
            showSuggestPanel={showSuggestPanel}
            onSelect={setSelectedId}
            onSetLayer={setLayer}
            onAcceptOne={acceptOne}
            onAcceptAll={acceptAll}
            onDismissSuggest={() => setShowSuggestPanel(false)}
          />
        )}

        <StatePanel scenes={scenes} suggestions={suggestions} />
      </div>

      <p className="shrink-0 border-t border-ink/10 px-4 py-2 text-[11px] leading-snug text-ink/50">
        {variant === 'A' &&
          'Thesis: ชิปเลนคู่ arc/beat — อ่านชั้นกับความหมาย arc พร้อมกัน'}
        {variant === 'B' &&
          'Thesis: สีซ้ายบอกเลนเงียบๆ — editor เหลือน้อย แผงแนะนำแยก'}
        {variant === 'C' &&
          'Thesis: CHARACTER เงียบ (default) — แสดงเฉพาะเมื่อเลื่อนชั้น'}
        {variant === 'AC' &&
          'Thesis: ชิป+editor+แนะนำเลน (A) · CHARACTER เงียบบนการ์ด (C) — แนะนำพับ'}
      </p>
    </>
  )
}

// ─── A: chip in meta row + editor block + suggest panel ─────────────────────

function VariantA({
  scenes,
  selected,
  suggestions,
  showSuggestPanel,
  onSelect,
  onSetLayer,
  onAcceptOne,
  onAcceptAll,
  onDismissSuggest,
  silentCharacter,
}: VariantProps & { silentCharacter?: boolean }) {
  const sug = suggestions[selected.id]

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Col eyebrow="การ์ดบนกระดาน (คลิกเลือก)">
        <div className="flex flex-wrap gap-3">
          {scenes.map((s) => {
            const layer = s.layer ?? 'character'
            const showChip = !silentCharacter || layer !== 'character'
            return (
            <button
              key={s.id}
              type="button"
              className="text-left"
              onClick={() => onSelect(s.id)}
            >
              <FakeCard selected={s.id === selected.id}>
                <CardTitle>{s.title}</CardTitle>
                <MetaRow>
                  {showChip && <LayerChip layer={layer} variant="A" />}
                  <span>{arcLabel(s.arcRelation)}</span>
                  {s.beat && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{s.beat}</span>
                    </>
                  )}
                </MetaRow>
                <Eq op="+" text={s.action} />
                {suggestions[s.id] &&
                  s.layer !== suggestions[s.id].layer &&
                  !s.userSet && (
                    <p className="mt-1 text-[10px] text-rust">
                      แนะนำ → {LAYER_LABELS[suggestions[s.id].layer]}
                    </p>
                  )}
              </FakeCard>
            </button>
            )
          })}
        </div>
      </Col>
      <Col eyebrow="ตัวแก้ไขฉาก (เฉพาะโครง layered-memory)">
        <FakeEditor>
          <EditorBlock label="ชื่อฉาก" value={selected.title} />
          <LayerEditorBlock
            layer={selected.layer ?? 'character'}
            reason={sug?.reason}
            confidence={sug?.confidence}
            variant="select"
            onChange={(l) => onSetLayer(selected.id, l)}
          />
          <EditorSelect
            label="แท็กเส้น Ghost / Lie / Want / Need"
            value={arcLabel(selected.arcRelation)}
          />
          <p className="text-[10px] leading-snug text-ink/45">
            arcRelation = ความหมายบน Paradigm · layer = อยู่เลนไหนบนกระดานสี่แถว
          </p>
        </FakeEditor>
        {showSuggestPanel && (
          <SuggestPanel
            scenes={scenes}
            suggestions={suggestions}
            onAcceptOne={onAcceptOne}
            onAcceptAll={onAcceptAll}
            onDismiss={onDismissSuggest}
          />
        )}
      </Col>
    </div>
  )
}

// ─── AC: A editor + suggest, C silent CHARACTER on card ─────────────────────

function VariantAC({
  scenes,
  selected,
  suggestions,
  showSuggestPanel,
  onSelect,
  onSetLayer,
  onAcceptOne,
  onAcceptAll,
  onDismissSuggest,
}: VariantProps) {
  const sug = suggestions[selected.id]
  const layer = selected.layer ?? 'character'

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Col eyebrow="การ์ด — CHARACTER เงียบ · ชิปเมื่อเลื่อนชั้น">
        <div className="flex flex-wrap gap-3">
          {scenes.map((s) => {
            const L = s.layer ?? 'character'
            const showChip = L !== 'character'
            return (
              <button
                key={s.id}
                type="button"
                className="text-left"
                onClick={() => onSelect(s.id)}
              >
                <FakeCard selected={s.id === selected.id}>
                  <CardTitle>{s.title}</CardTitle>
                  <MetaRow>
                    {showChip && <LayerChip layer={L} variant="A" />}
                    <span>{arcLabel(s.arcRelation)}</span>
                    {s.beat && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{s.beat}</span>
                      </>
                    )}
                  </MetaRow>
                  <Eq op="+" text={s.action} />
                  {suggestions[s.id] &&
                    s.layer !== suggestions[s.id].layer &&
                    !s.userSet && (
                      <p className="mt-1 text-[10px] text-rust">
                        แนะนำ → {LAYER_LABELS[suggestions[s.id].layer]}
                      </p>
                    )}
                </FakeCard>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-ink/50">
          การ์ดแรก (แอลเปิดสมุด) = CHARACTER → ไม่มีชิป · ที่เหลือมีชิปเมื่อเลื่อนชั้น
        </p>
      </Col>
      <Col eyebrow="editor — บล็อกเลน + segmented (A+C)">
        <FakeEditor>
          <EditorBlock label="ชื่อฉาก" value={selected.title} />
          <div
            className="space-y-2 rounded px-2.5 py-2"
            style={{
              border: '1px solid rgba(61,77,236,0.25)',
              background: 'rgba(61,77,236,0.05)',
            }}
          >
            <p className="font-display text-[12px] font-bold text-ink">
              เลนบนกระดาน (layered-memory)
            </p>
            <LayerSegmented layer={layer} onChange={(l) => onSetLayer(selected.id, l)} />
            {layer === 'character' && (
              <p className="text-[10px] text-ink/45">
                CHARACTER = ค่าเริ่มต้น · การ์ดไม่แสดงชิป
              </p>
            )}
            {sug && (
              <p className="text-[10px] text-ink/50">
                แนะนำ: {sug.reason} · {sug.confidence}
              </p>
            )}
          </div>
          <EditorSelect
            label="แท็กเส้น Ghost / Lie / Want / Need"
            value={arcLabel(selected.arcRelation)}
          />
        </FakeEditor>
        {showSuggestPanel && (
          <SuggestPanel
            scenes={scenes}
            suggestions={suggestions}
            onAcceptOne={onAcceptOne}
            onAcceptAll={onAcceptAll}
            onDismiss={onDismissSuggest}
          />
        )}
      </Col>
    </div>
  )
}

function LayerSegmented({
  layer,
  onChange,
}: {
  layer: StoryLayer
  onChange: (l: StoryLayer) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {STORY_LAYERS.map((l) => (
        <button
          key={l}
          type="button"
          className="rounded px-2 py-1 text-[11px] font-semibold"
          style={{
            background: layer === l ? LAYER_COLORS[l] : 'white',
            color: layer === l ? '#f8f6f0' : 'var(--color-ink-soft)',
            border: `1px solid ${layer === l ? LAYER_COLORS[l] : 'rgba(20,22,25,0.25)'}`,
          }}
          onClick={() => onChange(l)}
        >
          {LAYER_LABELS[l]}
        </button>
      ))}
    </div>
  )
}

// ─── B: left stripe + floating suggest panel ────────────────────────────────

function VariantB({
  scenes,
  selected,
  suggestions,
  showSuggestPanel,
  onSelect,
  onSetLayer,
  onAcceptOne,
  onAcceptAll,
  onDismissSuggest,
}: VariantProps) {
  return (
    <div className="relative grid gap-4 lg:grid-cols-[220px_1fr]">
      {showSuggestPanel && (
        <aside
          className="rounded-md bg-white p-3 shadow-sm lg:sticky lg:top-0 lg:self-start"
          style={{ border: '1px solid rgba(20,22,25,0.18)' }}
        >
          <p className="font-display text-[12px] font-bold text-ink">
            แนะนำเลน
          </p>
          <SuggestList
            scenes={scenes}
            suggestions={suggestions}
            compact
            onAcceptOne={onAcceptOne}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="rounded px-2 py-1 text-[10px] font-semibold text-cream"
              style={{ background: 'var(--color-mint-deep)' }}
              onClick={onAcceptAll}
            >
              ยืนยันทั้งหมด
            </button>
            <button
              type="button"
              className="text-[10px] text-ink/45"
              onClick={onDismissSuggest}
            >
              ปิด
            </button>
          </div>
        </aside>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Col eyebrow="การ์ด — แถบสีซ้าย">
          <div className="space-y-2">
            {scenes.map((s) => (
              <button key={s.id} type="button" className="w-full text-left" onClick={() => onSelect(s.id)}>
                <FakeCard
                  selected={s.id === selected.id}
                  stripe={s.layer ?? 'character'}
                >
                  <CardTitle compact>{s.title}</CardTitle>
                  <Eq op="+" text={s.action} />
                </FakeCard>
              </button>
            ))}
          </div>
        </Col>
        <Col eyebrow="editor — เลือกเลนอย่างเดียว">
          <FakeEditor>
            <select
              className="w-full rounded px-2 py-1.5 text-[12px]"
              style={{ border: '1px solid rgba(20,22,25,0.2)' }}
              value={selected.layer ?? 'character'}
              onChange={(e) =>
                onSetLayer(selected.id, e.target.value as StoryLayer)
              }
            >
              {STORY_LAYERS.map((l) => (
                <option key={l} value={l}>
                  {LAYER_LABELS[l]} — {LAYER_HINTS[l]}
                </option>
              ))}
            </select>
          </FakeEditor>
        </Col>
      </div>
    </div>
  )
}

// ─── C: show layer only when ≠ character ────────────────────────────────────

function VariantC({
  scenes,
  selected,
  suggestions,
  showSuggestPanel,
  onSelect,
  onSetLayer,
  onAcceptOne,
  onAcceptAll,
  onDismissSuggest,
}: VariantProps) {
  const layer = selected.layer ?? 'character'

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Col eyebrow="การ์ด — CHARACTER เงียบ">
        <div className="flex flex-wrap gap-3">
          {scenes.map((s) => {
            const L = s.layer ?? 'character'
            return (
              <button
                key={s.id}
                type="button"
                className="text-left"
                onClick={() => onSelect(s.id)}
              >
                <FakeCard selected={s.id === selected.id}>
                  <CardTitle>{s.title}</CardTitle>
                  <MetaRow>
                    <span>{arcLabel(s.arcRelation)}</span>
                    {L !== 'character' && (
                      <>
                        <span aria-hidden>·</span>
                        <LayerChip layer={L} variant="C" />
                      </>
                    )}
                  </MetaRow>
                  <Eq op="+" text={s.action} />
                </FakeCard>
              </button>
            )
          })}
        </div>
      </Col>
      <Col eyebrow="editor — segmented เลน">
        <FakeEditor>
          <p className="text-[11px] font-semibold text-ink">เลนบนกระดาน</p>
          <div className="flex flex-wrap gap-1">
            {STORY_LAYERS.map((l) => (
              <button
                key={l}
                type="button"
                className="rounded px-2 py-1 text-[11px] font-semibold"
                style={{
                  background: layer === l ? LAYER_COLORS[l] : 'white',
                  color: layer === l ? '#f8f6f0' : 'var(--color-ink-soft)',
                  border: `1px solid ${layer === l ? LAYER_COLORS[l] : 'rgba(20,22,25,0.25)'}`,
                }}
                onClick={() => onSetLayer(selected.id, l)}
              >
                {LAYER_LABELS[l]}
              </button>
            ))}
          </div>
          {layer === 'character' && (
            <p className="text-[10px] text-ink/45">
              CHARACTER = ค่าเริ่มต้น · การ์ดไม่แสดงชิป
            </p>
          )}
        </FakeEditor>
        {showSuggestPanel && (
          <SuggestPanel
            scenes={scenes}
            suggestions={suggestions}
            onAcceptOne={onAcceptOne}
            onAcceptAll={onAcceptAll}
            onDismiss={onDismissSuggest}
          />
        )}
      </Col>
    </div>
  )
}

// ─── shared pieces ──────────────────────────────────────────────────────────

type VariantProps = {
  scenes: SampleScene[]
  selected: SampleScene
  suggestions: Record<string, ReturnType<typeof suggestLayer>>
  showSuggestPanel: boolean
  onSelect: (id: string) => void
  onSetLayer: (id: string, layer: StoryLayer) => void
  onAcceptOne: (id: string) => void
  onAcceptAll: () => void
  onDismissSuggest: () => void
}

function StructureBadge() {
  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-cream"
      style={{ background: 'var(--color-rust)' }}
    >
      โครง: layered-memory
    </span>
  )
}

function SuggestPanel({
  scenes,
  suggestions,
  onAcceptOne,
  onAcceptAll,
  onDismiss,
}: {
  scenes: SampleScene[]
  suggestions: Record<string, ReturnType<typeof suggestLayer>>
  onAcceptOne: (id: string) => void
  onAcceptAll: () => void
  onDismiss: () => void
}) {
  return (
    <div
      className="mt-3 rounded-md bg-white p-3"
      style={{ border: '1px solid rgba(20,22,25,0.18)' }}
    >
      <p className="font-display text-[12px] font-bold text-ink">
        แนะนำเลน — ยืนยันก่อน snap
      </p>
      <SuggestList
        scenes={scenes}
        suggestions={suggestions}
        onAcceptOne={onAcceptOne}
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="rounded px-2 py-1 text-[10px] font-semibold text-cream"
          style={{ background: 'var(--color-mint-deep)' }}
          onClick={onAcceptAll}
        >
          ยืนยันทั้งหมด
        </button>
        <button type="button" className="text-[10px] text-ink/45" onClick={onDismiss}>
          ปิดแผง
        </button>
      </div>
    </div>
  )
}

function SuggestList({
  scenes,
  suggestions,
  onAcceptOne,
  compact,
}: {
  scenes: SampleScene[]
  suggestions: Record<string, ReturnType<typeof suggestLayer>>
  onAcceptOne: (id: string) => void
  compact?: boolean
}) {
  return (
    <ul className={`mt-2 space-y-1.5 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
      {scenes.map((s) => {
        const sug = suggestions[s.id]
        if (!sug || s.userSet) return null
        const same = s.layer === sug.layer
        return (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded px-2 py-1"
            style={{ background: same ? 'rgba(47,156,108,0.08)' : 'rgba(205,80,66,0.06)' }}
          >
            <span className="text-ink/80">
              {s.title} →{' '}
              <strong>{LAYER_LABELS[sug.layer]}</strong>
              <span className="text-ink/45"> ({sug.reason})</span>
            </span>
            {!same && (
              <button
                type="button"
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ border: '1px solid rgba(20,22,25,0.25)' }}
                onClick={() => onAcceptOne(s.id)}
              >
                ยืนยัน
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function StatePanel({
  scenes,
  suggestions,
}: {
  scenes: SampleScene[]
  suggestions: Record<string, ReturnType<typeof suggestLayer>>
}) {
  return (
    <div
      className="mt-4 rounded-md px-3 py-2 font-mono text-[10px] leading-relaxed text-ink/60"
      style={{ background: 'rgba(20,22,25,0.04)' }}
    >
      <p className="mb-1 font-sans text-[10px] font-semibold text-ink/45">
        state (prototype)
      </p>
      {scenes.map((s) => (
        <div key={s.id}>
          {s.id}: layer={s.layer ?? 'null'} userSet={String(!!s.userSet)}
          {suggestions[s.id] &&
            ` suggest=${suggestions[s.id].layer} (${suggestions[s.id].confidence})`}
        </div>
      ))}
    </div>
  )
}

function LayerChip({
  layer,
  variant,
}: {
  layer: StoryLayer
  variant: 'A' | 'C'
}) {
  const color = LAYER_COLORS[layer]
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold"
      style={{
        background: variant === 'A' ? `${color}18` : color,
        color: variant === 'A' ? color : '#f8f6f0',
        border: variant === 'A' ? `1px solid ${color}55` : undefined,
      }}
    >
      {LAYER_LABELS[layer]}
    </span>
  )
}

function LayerEditorBlock({
  layer,
  reason,
  confidence,
  variant,
  onChange,
}: {
  layer: StoryLayer
  reason?: string
  confidence?: 'high' | 'medium' | 'low'
  variant: 'select' | 'segmented'
  onChange: (l: StoryLayer) => void
}) {
  return (
    <div
      className="space-y-2 rounded px-2.5 py-2"
      style={{
        border: '1px solid rgba(61,77,236,0.25)',
        background: 'rgba(61,77,236,0.05)',
      }}
    >
      <p className="font-display text-[12px] font-bold text-ink">
        เลนบนกระดาน (layered-memory)
      </p>
      {variant === 'select' && (
        <select
          className="w-full rounded px-2 py-1.5 text-[12px]"
          style={{ border: '1px solid rgba(20,22,25,0.2)' }}
          value={layer}
          onChange={(e) => onChange(e.target.value as StoryLayer)}
        >
          {STORY_LAYERS.map((l) => (
            <option key={l} value={l}>
              {LAYER_LABELS[l]} — {LAYER_HINTS[l]}
            </option>
          ))}
        </select>
      )}
      {reason && (
        <p className="text-[10px] text-ink/50">
          แนะนำ: {reason}
          {confidence && ` · ${confidence}`}
        </p>
      )}
    </div>
  )
}

function arcLabel(relation: string) {
  const map: Record<string, string> = {
    ghost: 'Ghost',
    want: 'Want',
    need: 'Need',
    lie: 'Lie',
    lie_at_work: 'Lie at Work',
    neutral: 'Neutral',
  }
  return map[relation] ?? relation
}

function Col({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-ink/40">
        {eyebrow}
      </p>
      {children}
    </div>
  )
}

function FakeCard({
  children,
  selected,
  stripe,
}: {
  children: ReactNode
  selected?: boolean
  stripe?: StoryLayer
}) {
  return (
    <div
      className="w-full max-w-[220px] rounded-md bg-white px-3 pb-2.5 pt-2 shadow-sm transition"
      style={{
        border: selected
          ? '2px solid var(--color-ink)'
          : '1px solid rgba(20,22,25,0.18)',
        borderLeft: stripe
          ? `4px solid ${LAYER_COLORS[stripe]}`
          : undefined,
      }}
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
  compact,
}: {
  children: string
  compact?: boolean
}) {
  return (
    <h3
      className={`font-display font-semibold leading-snug text-ink ${compact ? 'text-sm' : 'text-base'}`}
    >
      {children}
    </h3>
  )
}

function MetaRow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink/55">
      {children}
    </div>
  )
}

function Eq({ op, text }: { op: string; text: string }) {
  return (
    <div className="flex gap-1 text-[12px] leading-snug text-ink/70">
      <span className="font-display text-ink/35">{op}</span>
      <span>{text}</span>
    </div>
  )
}

function EditorBlock({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-ink">{label}</span>
      <div
        className="mt-0.5 rounded px-2 py-1.5 text-[12px] text-ink/70"
        style={{ border: '1px solid rgba(20,22,25,0.2)' }}
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
