import type { StructureTemplate } from '../domain/structure'

/**
 * Teaching copy for a structure's columns: guide prose plus per-band
 * job / putHere / goal. Shared by HelpDialog and StructurePicker.
 */
export function StructureBandGuide({
  template,
  compact = false,
}: {
  template: StructureTemplate
  compact?: boolean
}) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <p
        className={[
          'leading-relaxed text-ink/75',
          compact ? 'text-[11px]' : 'text-[13px]',
        ].join(' ')}
      >
        {template.guide}
      </p>
      <ol className={compact ? 'space-y-2' : 'space-y-2.5'}>
        {template.bands.map((band) => (
          <li
            key={band.label}
            className="rounded px-2 py-1.5"
            style={{
              borderLeft: '2px solid rgba(43,122,140,0.55)',
              background: 'rgba(20,22,25,0.03)',
            }}
          >
            <div
              className={[
                'font-display font-bold text-ink',
                compact ? 'text-[11px]' : 'text-[13px]',
              ].join(' ')}
            >
              {band.label}
            </div>
            <p
              className={[
                'mt-0.5 text-ink/70',
                compact ? 'text-[10px] leading-snug' : 'text-[12px] leading-relaxed',
              ].join(' ')}
            >
              <span className="font-semibold text-ink/85">งาน · </span>
              {band.job}
            </p>
            <p
              className={[
                'mt-0.5 text-ink/70',
                compact ? 'text-[10px] leading-snug' : 'text-[12px] leading-relaxed',
              ].join(' ')}
            >
              <span className="font-semibold text-ink/85">ควรใส่ · </span>
              {band.putHere}
            </p>
            <p
              className={[
                'mt-0.5 text-ink/70',
                compact ? 'text-[10px] leading-snug' : 'text-[12px] leading-relaxed',
              ].join(' ')}
            >
              <span className="font-semibold text-ink/85">เป้าจบช่วง · </span>
              {band.goal}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
