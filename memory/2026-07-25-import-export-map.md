# Session — Export JSON / Import text·JSON → board

## What shipped
- Menu ⋯: **ส่งออก JSON** · **นำเข้า (ข้อความ / JSON)** · **ส่งออก PNG**
- Unified import dialog (`ImportSceneBankDialog` title: นำเข้าสู่กระดาน)
- Mapper `src/import/mapToBoard.ts`:
  - Full Plotline project JSON → confirm replace
  - Loose JSON (`[]`, `{ scenes }`, string array, scene-shaped object) → scene suggestions
  - Free text → `localParser` → scene suggestions + fill-empty backstory
- File pick: `.json` · `.txt` · `.md`

## Paths
- `src/import/mapToBoard.ts` (+ tests)
- `src/components/ImportSceneBankDialog.tsx`
- `src/components/AppHeader.tsx`
- Help + `docs/user-guide.html` (+ PDF)
