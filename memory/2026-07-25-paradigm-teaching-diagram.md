# Session — Paradigm teaching diagrams (ดูภาพ)

## Story-planning scope
Each structure has its **own** teaching diagram (not one Paradigm map reused):

| Template | Engine the diagram teaches |
|----------|----------------------------|
| 4 Phase | Want / Need / ได้·ไม่ได้·ได้สิ่งที่ดีกว่า |
| Three Act | Setup → Confrontation → Resolution · rising stakes → Climax |
| Save the Cat | Opening↔Final · promise → All Is Lost → Finale |
| Kishōtenketsu | 起承転結 · meaning flip · no Want/Need winner |
| Hero’s Journey | Departure / Initiation / Return · outer vs inner path |

## UI decision
- Tab **ดูภาพ** switches diagram by `structureTemplateId`
- **เส้น** stays ↑↓ axis hints only
- Leaf has compact SVG + **ขยายแผนภาพ** modal
- Structure leaf band strip: **grid wrap** (2×2 / 3-col) — no `truncate` on long Kishōtenketsu labels

## Visual language (match the live board)
- Cream paper · ink phase dividers · 3px axis · amber circles / rust squares / mint dotted Need / ink ticks
- Indigo StoryEdge curves · mint Need detour · dashed Want shortcut (4 Phase)
- Path notes = floating text + cream halo (no heavy chip UI)
- Landmark beats only on dense templates (STC / Hero) — not every beat from `structure.ts`

## Paths
- `src/components/diagramPrimitives.tsx` — shared board-matching SVG bits
- `src/components/ParadigmModelDiagram.tsx` — 4 Phase
- `src/components/StructureTeachingDiagram.tsx` — router + Three Act / STC / Kishōtenketsu / Hero
- `src/canvas/BoardBookmarkRail.tsx` — `DiagramLeafBody` + structure band grid
- Prototype archive: `src/canvas/prototype/paradigmDiagram/` (verdict B → tab ดูภาพ)

## Help / PDF
Synced: bookmark list includes **ดูภาพ**; diagrams are per-structure engines.
