# Plotline Board — project memory

บันทึกบริบทงาน ว่าทำอะไรไปแล้ว ตอนนี้อยู่ตรงไหน และลองแล้วถึงไหน  
อัปเดตล่าสุด: **2026-07-25** · นอก·/ใน· + Help/PDF · deploy: GitHub Pages จาก `main`

---

## 1. Context — โปรเจกต์นี้คืออะไร

**Plotline Board** = เครื่องมือวางแผนเรื่องแบบภาพ (client-only)  
นักเขียนวาง Scene บน **Paradigm Line** / โครงเรื่องที่เลือกได้ แล้วส่งออก PNG/JSON

**ผู้ใช้:** นักเขียนไทย (UI ไทยเป็นหลัก · ชื่อปุ่มไทย/อังกฤษให้ตรงกับบนจอ)  
**ข้อจำกัดที่ตั้งใจ:** ไม่มีเซิร์ฟเวอร์ · ไม่มี login · ข้อมูลอยู่ localStorage · ไม่มี collab/AI บังคับ

**แนวคิด 3 ชั้น**
1. Backstory / Character Arc — Ghost, Lie, Lie at Work, Want, Need  
2. Plot Timeline — คอลัมน์ช่วงตามโครงที่เลือก  
3. Story Beats — หมุดบนเส้น  

**สไตล์ภาพที่รักษา:** cream / ink / rust · ฟอนต์ Trirong + Noto Sans Thai · ลายเซ็น = **แท็บคั่นหน้า (bookmark) ขอบซ้าย** ไม่ใช่แดชบอร์ด SaaS

**Seed ตัวอย่าง:** «แอล — ตะกร้าคนใจสลาย»

**Repo / live:** `iamchalermchai/paradigm-line-for-story-telling`  
Pages deploy อัตโนมัติเมื่อ push `main`

---

## 2. ตอนนี้ถึงไหนแล้ว (สถานะปัจจุบัน)

### พร้อมใช้บน `main`
| พื้นที่ | สถานะ |
|--------|--------|
| MVP กระดาน (ฉาก · เส้น 5 ชนิด · undo · autosave · JSON) | ✅ |
| โครงเรื่องขับกระดาน (bands + beats + editor) | ✅ |
| โครงที่มี: 4 Phase · Three Act · Save the Cat · Kishōtenketsu · Hero’s Journey | ✅ |
| แกนเส้นต่อโครง (`axis`: ชื่อเส้น · เหนือ/ใต้) | ✅ |
| กระดานว่าง → StructureChooser | ✅ |
| มุมมองเวลา / ลำดับเล่า (+ จัดบทเล่า) | ✅ |
| Auto-layout ตาม beat | ✅ |
| Roster ตัวละคร · synopsis · โน้ตต่อบท | ✅ |
| Help `?` + PDF คู่มือ | ✅ (อัปเดตตาม chrome ใหม่แล้ว) |
| Export PNG (สัดส่วนกระดาน · preset ขนาด · แบ่งภาพ Facebook) | ✅ |
| ฟอนต์ self-host (PNG ตรงกับจอ) | ✅ |
| **Bookmark rail ซ้าย** เวลา/เล่า/โครง/ชนิด/เส้น | ✅ shipped `269c81c` |
| **หลักฐานบนกระดาน** ใต้ climax Want/Need | ✅ shipped `269c81c` |
| คู่มือช่วงโครง (job / ควรใส่ / เป้า) ใน Help + ใบโครง | ✅ |
| Offline Scene Bank parser (`localParser`) | ✅ logic · ผ่าน dialog |
| **ส่งออก JSON / นำเข้าข้อความ·JSON แมปกระดาน** | ✅ เมนู ⋯ · `mapToBoard` (โปรเจกต์เต็มหรือฉาก) |
| **แรงต้านฉาก นอก·/ใน·** (`internalConflict`) | ✅ editor + การ์ด + Help/PDF สอนแล้ว |
| **แผนภาพสอนต่อโครง** (แท็บ **ดูภาพ**) | ✅ ทั้ง 5 โครง · ภาษาภาพเดียวกับบอร์ด |

### ยังไม่พับเข้า UI / ยังไม่ทำ
| รายการ | โน้ต |
|--------|------|
| Ghost/Lie/Want/Need **ต่อตัวละคร** (UI) | schema/seed มีแล้ว · prototype panel B ลองแล้ว **ไม่ได้เลือก** |
| Checklist «ตรวจ» บน rail / dock | helper `boardCoverage` มี · panel C **ไม่ได้เลือก** |
| เมนู Export telling outline | helper `tellingOutline` มี · ยังไม่ติด AppHeader |
| AI parser จริง (Claude/API) | ยังเป็น adapter + local parser offline |
| Playwright E2E · สมาชิก · DB · collab | นอกขอบเขตโดยตั้งใจ |

---

## 3. ประวัติงานแบบย่อ (ตามลำดับ commit)

1. **MVP** — กระดาน earth-tone, React Flow, Zustand, Zod, seed แอล  
2. **โครงซ้อนแนวตั้ง** — เลือก 4 Phase / Three Act / Save the Cat  
3. **โครงขับ list + drag re-bucket + auto-layout + editor band**  
4. **Polish** — ชื่อโปรเจกต์ · แบนด์ชัดขึ้น · ซูมอ่านง่าย · ลบการ์ดเยอะไม่ค้าง  
5. **ตัวตนภาพ** — Trirong · a11y · คัดลอกไทย  
6. **Canvas overhaul** — เส้น woven · การ์ดแน่นขึ้น · outcome · copy/paste  
7. **ลำดับเล่า** — telling mode · overlay · จัดบทได้ · ตัวอักษรบท  
8. **Roster + synopsis + โน้ตบท**  
9. **Deploy** GitHub Pages (client-only)  
10. **Auto-layout ใต้หมุด beat** · **self-host fonts**  
11. **PNG** สัดส่วนถูกต้อง · preset · **แบ่งภาพ Facebook**  
12. **Help `?` + PDF** (แล้ว iterate: เลขอาราบิก · ชื่อปุ่มตรง UI)  
13. **โครงขับกระดานจริง** — สลับโครง = ชุดหมุดใหม่ · ไม่ทำลายการ์ด  
14. **Hero’s Journey + axis ต่อโครง + StructureChooser กระดานว่าง**  
15. **Bookmark chrome + climax evidence + Help/PDF sync**
16. **แผนภาพสอนต่อโครง** (แท็บ **ดูภาพ**) + ภาษาภาพบอร์ด + แก้ truncate ใบโครง
17. **Import mapToBoard** + **internal conflict นอก·/ใน·** + Help/PDF ← ปัจจุบัน

รายละเอียด: [2026-07-25-bookmark-chrome-and-climax-evidence.md](./2026-07-25-bookmark-chrome-and-climax-evidence.md) · [2026-07-25-paradigm-teaching-diagram.md](./2026-07-25-paradigm-teaching-diagram.md) · [2026-07-25-import-export-map.md](./2026-07-25-import-export-map.md) · [2026-07-25-internal-conflict.md](./2026-07-25-internal-conflict.md)

---

## 4. ลองทำแล้วถึงไหน (ทดลอง / prototype / ที่ทิ้ง)

### Board chrome (เครื่องมือบนกระดานอยู่ไหน)
| Variant | แนวคิด | ผล |
|---------|--------|-----|
| **A Five bookmarks** | ทุกเครื่องมือเป็นแท็บคั่นหน้าซ้าย | **ชนะ → พับเข้า production** |
| B Tool spine | คอลัมน์ซ้ายเปิดตลอด | แพ้ — กินพื้นที่กระดาน |
| C Top ribbon | โครง/ชนิดอยู่แถบบน | ลองแล้ว; **A ดีกว่า** (ribbon ใกล้ Figma เกินไป) |
| D Drafting ledge | ตรา Folio + ถาดปากกาล่าง | **ไม่ชอบ** — ปากกา/เส้นแปลก; ลบออก |

ไฟล์ศึกษา (ไม่ผูก Board แล้ว): `src/canvas/prototype/`

### Planning panels (Backstory · climax · checklist)
| Panel | แนวคิด | ผล |
|-------|--------|-----|
| **A Evidence under climax** | roster เดิม + หลักฐานใต้ dropdown | **ชนะ → พับ** |
| B Character-first arcs | Ghost…Need ขยายต่อตัวละคร | ลองใน prototype · **ยังไม่เลือก** |
| C Checklist dock | ตรวจบีต/แบนด์ว่าง | ลอง · **ยังไม่เลือก** |

ไฟล์ศึกษา: `src/components/prototype/`  
Logic TUI: `npm run prototype:planning` → `src/domain/prototype/planningTui.ts`  
Layered board (META/CHAR/MEM/GHOST): `npm run prototype:layers` → `/?layers=A|B|C`  
Story layer field UX: `npm run prototype:layer` → `/?layerField=A|B|C|AC`  
Layer rail study: `npm run prototype:layer-rail` → `/?layerRail=open`

**Production (2026-07-25):** **เลนการเล่า** (`laneMode`) ในแท็บ **โครง** · แท็บ **เลน** · `storyLayer` · ดู `memory/2026-07-25-layered-memory.md`

### สิ่งที่เคยอยู่บนจอแล้วย้าย/ตัด
- StructurePicker + EdgeLegend **ลอยมุมซ้ายบน** → ย้ายเข้า bookmark **โครง** / **ชนิด**  
- ViewModeToggle แยก → รวมเป็นแท็บ **เวลา** / **เล่า**  
- ป้าย Lie/Want บน canvas ค้างตลอด → เปิดจากแท็บ **เส้น**  
- แท็บ **ตรวจ** ใน rail ชั่วคราว → ตัดตอนพับ A (coverage ยังอยู่ใน helper)

### Design notes ที่ได้จากรอบนี้
- ลายเซ็นโปรดักต์ = bookmark ซ้าย ไม่ใช่ ribbon/ถาดเครื่องมือ  
- Minimal พอตอน**ปิด**ใบ; ตอนเปิดใบโครงยังหนา — ตัดซ้ำแกนแล้ว (ชี้ไปแท็บเส้น)  
- อย่าเพิ่ม metaphor เกิน (ปากกา/Folio stamp)

---

## 5. ข้อตกลงการทำงานกับผู้ใช้ (จากบทสนทนา)

- ทำ **/prototype ก่อน** เมื่อฟีเจอร์ใหญ่ยังไม่ชัวร์ UI/logic  
- คู่มือ **Help `?` และ PDF ต้องตามของจริง** ทุกครั้งที่เปลี่ยน flow สำคัญ  
- ชื่อปุ่มในคู่มือ = ชื่อบนจอ (ไทยกับไทย / อังกฤษกับอังกฤษ)  
- เลขในคู่มือใช้ **อาราบิก**  
- Commit + push เมื่อผู้ใช้ขอ («อัพโหลด commit»)  
- โฟลเดอร์ `memory/` = สมองยาวของโปรเจกต์สำหรับรอบถัดไป

---

## 6. จุดต่อที่สมเหตุสมผล (ยังไม่ commit ทำ)

เรียงตามความพร้อมของโค้ดที่มีอยู่แล้ว:

1. **Export telling outline** จากเมนู `⋯` (มี `src/export/tellingOutline.ts`)  
2. ตัดสินใจใหม่เรื่อง **per-character arcs** (panel B) หรือเก็บแค่ project-level Backstory  
3. ตัดสินใจใหม่เรื่อง **ตรวจแผน** (coverage) — bookmark หรือแผงอื่น  
4. AI parser จริงเมื่อมี backend — ตอนนี้ offline parser พอใช้ Scene Bank

---

## 7. คำสั่งที่เกี่ยวกับ memory / prototype

```bash
npm run dev
npm test && npm run typecheck
npm run prototype:planning   # TUI logic helpers
npm run prototype:layers     # 4-lane layered axis UI study
npm run prototype:layer      # story layer field + suggest UX
# PDF regenerate (จาก repo root):
# Chrome headless → public/user-guide.pdf จาก docs/user-guide.html
```
