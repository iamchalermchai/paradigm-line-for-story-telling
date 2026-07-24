# Plotline Board

เครื่องมือวางแผนเรื่องแบบภาพ (Visual Story Planning Board) สำหรับนักเขียน —
เปลี่ยน Scene Bank ให้กลายเป็น **Paradigm Line** แบบลากวางได้ พร้อมส่งออกเป็นภาพเต็มกระดาน

## แนวคิด 3 ชั้น

1. **Backstory / Character Arc** — Ghost, Lie, Lie at Work, Want, Need (แผงซ้าย)
2. **Plot Timeline** — 4 ช่วง: เริ่มต้น / ช่วงแรก / ช่วงกลาง / ช่วงท้าย (คอลัมน์บน canvas)
3. **Story Beats** — Catalyst, Want, Midpoint, Low Point, Aha!, Climax, Ending (หมุดบนเส้น Paradigm Line)

Scene แต่ละใบยึดหลัก **Character + Action = Plot** (ใคร ต้องการอะไร ทำอะไร อุปสรรค ผลลัพธ์ อะไรเปลี่ยน)
มาพร้อมโปรเจกต์ตัวอย่าง **"แอล — ตะกร้าคนใจสลาย"**

## คำสั่ง

```bash
npm install
npm run dev        # เปิด dev server
npm run test       # unit + integration tests (Vitest)
npm run typecheck  # ตรวจชนิดข้อมูล (tsc)
npm run build      # production build
```

## สถาปัตยกรรม

- **React + TypeScript (strict) + Vite + Tailwind CSS v4**
- **@xyflow/react (React Flow v12)** — canvas, custom nodes/edges, pan/zoom, snap-to-grid
- **Zustand** — state + undo/redo (snapshot-based)
- **Zod** — validation + versioned JSON schema (รองรับ migration)
- **html-to-image** — Export PNG เต็มกระดาน

```
src/
  domain/     โมเดล + Zod schemas + seed + validation + auto-layout (pure, ไม่พึ่ง React)
  store/      Zustand store, history (undo/redo), localStorage persistence
  canvas/     Board (React Flow), custom nodes/edges, phase columns, graph conversion
  components/ Toolbar, BackstoryPanel, SceneEditorDrawer, dialogs (import/export)
  import/     AIParserAdapter (interface) + mock parser
  export/     PNG + JSON export/import
```

## ความสามารถ (MVP)

สร้าง/แก้ Backstory · เพิ่ม/แก้/ทำสำเนา/ลบ Scene (Character + Action = Plot + validation warnings) ·
ลาก Scene ข้าม phase และเหนือ/ใต้ Paradigm Line · เชื่อมเส้นเรื่อง 5 ชนิด · กำหนดผล Climax (Want/Need) ·
Auto Layout (undo ได้) · บันทึกอัตโนมัติลงเบราว์เซอร์ · Import/Export JSON · Export PNG เต็มกระดาน ·
Import Scene Bank (mock parser — review/merge/split/select ก่อน confirm)

## ความเป็นส่วนตัว (Privacy)

Plotline Board เป็นแอป **client-only** — ทำงานในเบราว์เซอร์ล้วน ไม่มีเซิร์ฟเวอร์ของเรา:

- **ข้อมูลโปรเจกต์ทั้งหมด** (ฉาก, ตัวละคร, backstory, เรื่องย่อ ฯลฯ) เก็บใน **localStorage ของเบราว์เซอร์คุณเท่านั้น** ไม่ถูกส่งออกไปที่ไหน
- **ไม่มี** บัญชีผู้ใช้ · ไม่มีฐานข้อมูลออนไลน์ · ไม่มี analytics/tracking ของเรา
- Export JSON/PNG เป็นไฟล์ที่ดาวน์โหลดลงเครื่องคุณโดยตรง
- ข้อกำหนดภายนอกเดียว: ฟอนต์ Trirong/Noto Sans Thai โหลดจาก Google Fonts CDN (เบราว์เซอร์คุณติดต่อ Google เพื่อโหลดฟอนต์ — ไม่มีข้อมูลเรื่องของคุณถูกส่งไป)

## Deploy

Push ขึ้น `main` แล้ว GitHub Actions (`.github/workflows/deploy.yml`) จะรัน test + build
แล้ว deploy `dist/` ขึ้น GitHub Pages อัตโนมัติ — เป็น static hosting ล้วน

## ยังไม่รวมในรอบนี้

AI parser จริง (ตอนนี้เป็น mock หลัง `AIParserAdapter` — ต่อ Claude API ผ่าน server endpoint ภายหลัง),
Playwright E2E, ระบบสมาชิก/ฐานข้อมูลออนไลน์, แชร์แก้ร่วมกัน, version history ออนไลน์
