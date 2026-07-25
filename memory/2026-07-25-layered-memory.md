# Layered Memory → Lane mode (2026-07-25)

**Verdict (refactor):** เลน = overlay ไม่ใช่โครงที่ 6

| ก่อน | หลัง |
|------|------|
| โครง `layered-memory` ใน picker | **`laneMode`** บน project (schema v6) |
| สลับโครงเพื่อได้สี่เลน | เปิด **เลนการเล่า** ในแท็บ **โครง** — ใช้คู่กับโครงใดก็ได้ |
| แท็บ **เลน** ผูก structure id | แท็บ **เลน** ผูก `laneMode` |

Migration: `structureTemplateId: layered-memory` → `laneMode: true` + `four-phase`

`storyLayer` บนการ์ด · snap Y · แท็บ **เลน** · suggest — เหมือนเดิม

Prototype ยังอยู่: `src/canvas/prototype/layerRail/` · `storyLayer/` · `layeredBoard/`
