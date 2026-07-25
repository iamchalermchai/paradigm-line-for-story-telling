# Layered Memory → มิติของเรื่องเล่า (2026-07-25)

**Verdict (B+):** Paradigm Y = master · มิติ = metadata + แท็บ diagram

| ก่อน (ship แรก) | หลัง (B+) |
|----------------|-----------|
| โครง `layered-memory` ใน picker | **`laneMode`** บน project (schema v6) |
| snap Y ตามเลน · ซ่อน Paradigm | **Paradigm อยู่เสมอ** · ไม่ snap Y |
| แท็บ **เลน** · **เลนการเล่า** | แท็บ **มิติ** · **มิติของเรื่องเล่า** |
| 4 แถวเต็มบน canvas | ภาพความลึกใน **แท็บ มิติ** (CHARACTER spine + dip) |

Migration: `structureTemplateId: layered-memory` → `laneMode: true` + `four-phase`

## โมเดล

- **Paradigm / `arcRelation`** — ตำแหน่งและแท็กเส้นบนกระดานหลัก
- **`storyLayer`** — มิติการเล่า (META / CHARACTER / MEMORY / GHOST) · metadata บนการ์ด
- **Backstory** — ขับ arc · ใช้ใน `suggestStoryLayer` ไม่แทนที่มิติ
- **Editor** — บล็อก **เส้น Paradigm · มิติการเล่า** (แท็กเส้น + มิติ) · ปุ่ม「ใช้คำแนะนำ」
- **แท็กเส้น vs มิติ** — `arcRelation` = แตะ Lie/Want/Ghost บน Paradigm · `storyLayer` = เล่าชั้นไหน · Ghost แท็ก ≠ GHOST มิติเสมอ (ปัจจุบันมัก CHARACTER)
- **แท็บ มิติ** — อยู่ใน bookmark ตลอด (ไม่ต้องเปิดจากโครง)

## ภาพมิติขยาย (shipped 2026-07-26)

- **กรอบซ้าย** — `LAYER_DESCRIPTIONS` อธิบาย META / CHARACTER / MEMORY / GHOST (ยาว · align กับแถบ)
- **ชื่อฉากติดจุด** — HTML wrap ใน SVG · เหนือจุด (META/CHARACTER) · ใต้จุด (MEMORY/GHOST)
- **ขอบซ้าย–ขวา** — `LABEL_EDGE_PAD` + clamp label · ไม่ตัดคำต้น/ท้ายไทม์ไลน์
- **Schema v7** — migration patch `storyLayer` ให้ seed-al (MEMORY ×2 · GHOST ×1)
- **แนะนำมิติ** — ปุ่มในแท็บ มิติ + 「ใช้คำแนะนำ」ใน editor

## Deferred

- Trigger edges บน canvas หลัก
- Help/PDF มิติ
- ชิปไทย (กรอบ / ความทรงจำ / แผล)

Prototype ยังอยู่: `layerRail/` · `storyLayer/` · `layeredBoard/` · `laneParadigm/`
