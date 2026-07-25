/**
 * PROTOTYPE ARCHIVE — placement studies (folded).
 * Winner: B modal clarity → own tab «ดูภาพ» in BoardBookmarkRail.
 * Board no longer mounts this host. Keep for reference only.
 */

export const DIAGRAM_VARIANTS = ['A', 'B', 'C'] as const
export type DiagramVariant = (typeof DIAGRAM_VARIANTS)[number]

export const DIAGRAM_LABELS: Record<DiagramVariant, string> = {
  A: 'Axis leaf',
  B: 'Modal peek → folded as tab ดูภาพ',
  C: 'Ghost underlay',
}
