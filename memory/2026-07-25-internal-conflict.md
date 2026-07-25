# Session — Per-scene internal conflict (นอก · / ใน ·)

## Verdict
Prototype `?conflict=A|B|C` → **A won**.

## What shipped
- `StoryScene.internalConflict` (Zod `.default('')` for old saves)
- Scene editor block **แรงต้านในฉาก**: ภายนอก (`obstacle`) + ข้างใน (`internalConflict`)
- Scene card footer: `นอก ·` / `ใน ·`
- Help `?` + PDF: อธิบายว่า internal conflict คืออะไร ต่างจาก Backstory ยังไง วิธีแยกนอก/ใน
- Import keys: `internal` / `ความขัดแย้งภายใน`

## Teaching (user-facing)
- **ใน** = แรงกดในตัวละครในจังหวะฉาก (กลัว / ยึด Lie / ไม่กล้ารับ)
- **นอก** = คน สถานการณ์ โลก
- Backstory Ghost/Lie/Want/Need = เครื่องยนต์ทั้งเรื่อง ไม่ใช่ข้อความ conflict ต่อฉาก

## Paths
- Prototype: `src/canvas/prototype/internalConflict/`
- Help: `HelpDialog` §2 · `docs/user-guide.html` · `public/user-guide.pdf`
