# Lane vs Paradigm Y (PROTOTYPE)

**Question:** เปิด「เลนการเล่า」ควรแทนแกน Y ของบอร์ดหลัก หรือซ้อน metadata อย่างเดียว?

| Variant | แนว | สรุป |
|---------|-----|------|
| **A** | สลับมุมมอง | = prod ตอนนี้ · Paradigm ซ่อน · snap Y เข้าเลน |
| **B** | Metadata | Paradigm อยู่ · `storyLayer` = chip + แท็บ เลน · ไม่ snap Y |
| **C** | ซ้อน | Paradigm ขับ Y · เส้นเลนจาง guide · layer = สีขอบ |

```bash
npm run prototype:lane-paradigm   # → /?laneParadigm=A
```

สลับ `?laneParadigm=A|B|C` หรือ ← → · DEV only · ไม่เขียน store
