import { PrototypeSwitcher } from '../../canvas/prototype/PrototypeSwitcher'
import {
  PANEL_LABELS,
  PANEL_VARIANTS,
  type PanelVariant,
} from './PlanningPanelVariants'

/** PROTOTYPE — second floating bar for ?panel= (sits above chrome bar). */
export function PlanningPrototypeBar({
  current,
  onChange,
}: {
  current: PanelVariant
  onChange: (key: string) => void
}) {
  return (
    <div className="fixed bottom-14 left-1/2 z-[100] -translate-x-1/2">
      <PrototypeSwitcher
        variants={[...PANEL_VARIANTS]}
        current={current}
        labels={Object.fromEntries(
          PANEL_VARIANTS.map((k) => [k, `panel · ${PANEL_LABELS[k]}`]),
        )}
        onChange={onChange}
      />
    </div>
  )
}
