# PROTOTYPE — Paradigm diagram placement (archived)

Question: แผนภาพสอนควรโผล่แบบไหนโดยไม่ทำลาย composition?

| Key | Thesis | Verdict |
|-----|--------|---------|
| A | Axis leaf (inline) | Rejected — cramped |
| **B** | Modal peek | **Winner** — folded into tab **เส้น** as «ดูแผนภาพแกน» |
| C | Ghost underlay | Rejected — fights the board |

**Folded:** B’s modal, entry from left bookmark **เส้น** (production `BoardBookmarkRail` + `ParadigmModelDiagram`).  
**Scope:** diagram teaches **4 Phase / Paradigm only** — other structures keep ↑↓ axis copy only.

Re-run study (optional): `npm run prototype:diagram` still opens `?diagram=` host if re-wired; Board no longer mounts it by default.
