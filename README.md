# Lottery Insight v5.2.4 — Structured News Intelligence

**โดย TheLegionZ** · GitHub Pages + Private Google Apps Script + Google Sheets

รุ่นนี้เปลี่ยน **แหล่งข้อมูลของการ์ด “เลขดังจากข่าว”** จากการเดาเลขด้วยการอ่านพาดหัว/RSS เป็นการนำเข้า **ชุดเลขที่ระบุประเภทชัดเจน** จากแหล่งที่ผู้ดูแลกำหนด โดยยังแยกออกจาก Algorithm เลข 2/6 หลักเดิม

> **สำคัญ:** v5.2.4 **ไม่ได้ค้นหาและแกะเลขจากทุกเว็บบนอินเทอร์เน็ตได้เองทันที** ต้องมี (ก) JSON feed จากผู้ให้ข้อมูลที่ได้รับอนุญาต หรือ (ข) ข้อมูลที่คุณตรวจสอบแล้ววางใน Sheet `NewsStructured` ก่อน การดึง JSON จะทำงานอัตโนมัติทุก ~6 ชั่วโมงผ่าน Trigger `syncLottery` ที่มีอยู่เมื่อ feed มีการอัปเดต
>
> ตัวเลขจากข่าวเป็นการรายงานคำแนะนำของแหล่งข่าว ไม่ได้หมายความว่ามีโอกาสออกรางวัลเพิ่มขึ้น และการตรวจรูปแบบข้อมูลไม่เท่ากับการยืนยันความถูกต้องของเนื้อหาต้นทาง

## มีอะไรใหม่

- ชีตนำเข้าชุดเลข `NewsStructured` (ไม่ต้องแตะ Sheet `Results`/`Predictions`)
- รองรับ **Structured JSON feed** ที่มี `schemaVersion: 1`, `records` และฟิลด์แยก `featuredDigits`, `twoDigits`, `threeDigits`
- เก็บชื่อสำนักข่าว (`publisher`), ชื่อเจ้าของชุดเลข (`pickSource`), วันที่เผยแพร่, **งวดที่เกี่ยวข้อง** และ URL ต้นฉบับ
- รองรับ `08`, `04`, `081` เป็น **ข้อความ** ห้ามแปลงเป็นเลขตัวเลขธรรมดา
- ไม่ใช้เลขที่ไม่มีหมวดชัดเจน เช่นปี `2569` วันที่ `10/11` หรือเลขในพาดหัว
- กันนำเข้าเลขของงวดผิด / หลังเวลาออกรางวัล / ที่มาข้อมูลไม่ครบ
- Deduplicate ตามงวด + URL + ชื่อเจ้าของชุดเลข
- สถานะ `READY` → `IMPORTED` หรือ `REJECTED` พร้อมเหตุผลในคอลัมน์ `ImportResult`
- แยก Network error ออกจากระบบผลสลากเดิม; ระบบผลสลากและ prize checker ยังใช้งานต่อ
- กัก Snapshot ข่าวเก่าที่อาจรวมเลขวันที่ผิดด้วย `LEGACY_UNVERIFIED` โดย **ไม่ลบประวัติ**
- มี `diagnoseStructuredNews()` เพื่อดูจำนวนข้อมูลและสาเหตุที่ไม่มีเลข โดยไม่เปิดเผย API Token

## วิธี Upgrade จาก v5.2.3

1. **สำรอง Google Sheet และ `Code.gs` เดิม** ก่อน
2. นำ `PRIVATE-backend/Code.gs` รุ่นนี้แทนโค้ดเดิมใน Apps Script แล้ว Save
3. Run **`setupStructuredNews()`** หนึ่งครั้ง ฟังก์ชันนี้ตั้งค่าเฉพาะระบบข่าว **ไม่ต้องรัน `setupSystem()` ซ้ำ** (ต้องเคย setup ระบบหลักจนมี `SPREADSHEET_ID` แล้ว)
4. เลือกแหล่งข้อมูลตามหัวข้อถัดไป และ Run **`syncStructuredLotteryNews()`** หนึ่งครั้ง
5. Run **`diagnoseStructuredNews()`** ดูผลที่ Execution Log
6. Deploy → Manage deployments → Edit → **New version** → Deploy (ใช้ Web app URL เดิมได้)
7. อัปโหลดไฟล์ใน `github-pages-ready/` ขึ้น GitHub Pages ทั้งหมด รวม `assets/` และ **ตั้งค่า `DATA_URL` เดิมของคุณใน `config.js` พร้อม `DEMO_MODE: false`** (ไฟล์ตัวอย่างมีค่า `DATA_URL: ""`, `DEMO_MODE: true`)
8. Refresh หน้าเว็บ (`Ctrl+F5`) แล้วตรวจการ์ดเลขดังจากข่าว

**ไม่ต้องลบ Sheet หรือทับข้อมูล Snapshot เดิม**

## วิธี A — นำเข้าข้อมูลใน NewsStructured Sheet (ใช้ได้ทันที)

หลัง Run `setupStructuredNews()` จะมีชีตชื่อ `NewsStructured` พร้อม 14 คอลัมน์:

| คอลัมน์ | ใส่อะไร | ตัวอย่าง |
|---|---|---|
| A `RecordId` | ID สำหรับอ้างอิงเอง (จะปล่อยว่างก็ได้) | `N-001` |
| B `TargetDrawDate` | วันงวด **ค.ศ.** รูปแบบ YYYY-MM-DD | `2026-11-16` |
| C `PublishedAt` | วันที่เผยแพร่แบบ ISO พร้อมเขตเวลา | `2026-11-09T08:30:00+07:00` |
| D `Publisher` | สำนักข่าว/ผู้เผยแพร่ | `ชื่อสำนักข่าว` |
| E `PickSource` | ผู้ให้เลข / ชื่อชุดเลข | `อ.น๊อตตี้` |
| F `Title` | ชื่อบทความ | `แนวทางเลขเด็ดงวด 16 พ.ย.` |
| G `Url` | HTTPS URL **บทความต้นฉบับจริง** | `https://...` |
| H `FeaturedDigits` | เลขเด่น แยกช่องว่าง/ขีด | `5-6-2-3` |
| I `Numbers2` | **เลข 2 ตัวที่บทความระบุจริง** | `64, 74, 62` |
| J `Numbers3` | **เลข 3 ตัวที่บทความระบุจริง** | `674, 672` |
| K `Status` | ใส่ `READY` เมื่อพร้อมนำเข้า | `READY` |
| L `Notes` | บันทึกภายใน (ไม่แสดงหน้าเว็บ) | ว่างได้ |
| M `ImportedAt` | ระบบเติมให้อัตโนมัติ | ไม่ต้องกรอก |
| N `ImportResult` | ระบบเติมผลการนำเข้า | ไม่ต้องกรอก |

สามารถนำข้อมูล 8 แหล่งจากตารางตัวอย่างที่คุณให้มา **แยกเป็น 8 แถว** ได้ โดยใช้ URL บทความเดียวกันได้ถ้าอยู่ในบทความเดียวกัน แต่ต้องกรอก URL และเวลาตีพิมพ์จริงด้วย **ห้ามใส่ URL สมมติแล้วนำขึ้น Production**

กรณีแถวมีสถานะ `REJECTED` ให้แก้ข้อมูล แล้วเปลี่ยนคอลัมน์ K เป็น `RETRY` หรือ `READY` ก่อนรันใหม่ (ถ้ากด Run ซ้ำโดยไม่เปลี่ยนสถานะ ระบบจะไม่ลองแถวนั้นอีก)

หมายเหตุ: ระบบรองรับงวดปัจจุบันที่แสดงใน `diagnoseStructuredNews()` เท่านั้น ป้องกันการกรอกผลย้อนหลังแล้วอ้างว่าเป็น Prediction ก่อนเวลา

## วิธี B — ดึง Structured JSON อัตโนมัติ

ต้องมี **HTTPS JSON endpoint ที่คุณเป็นเจ้าของหรือได้รับสิทธิให้ใช้** โดยตอบ JSON รูปแบบนี้:

```json
{
  "schemaVersion": 1,
  "records": [
    {
      "targetDrawDate": "2026-11-16",
      "publishedAt": "2026-11-09T08:30:00+07:00",
      "publisher": "ชื่อผู้เผยแพร่",
      "pickSource": "อ.น๊อตตี้",
      "title": "หัวข้อข่าวที่มีชุดเลขแบ่งประเภท",
      "url": "https://publisher.example.org/original-article",
      "featuredDigits": ["6"],
      "twoDigits": ["64", "74", "62"],
      "threeDigits": ["674", "672"]
    }
  ]
}
```

> URL และข้อความในตัวอย่างเป็น **placeholder อธิบายสัญญา API ไม่ใช่ข่าวจริง** ต้องแทนด้วย URL ต้นฉบับจริงก่อนเผยแพร่

ที่ **Apps Script → Project Settings → Script Properties** ตั้งค่า:

| Property | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `NEWS_STRUCTURED_JSON_FEEDS` | `https://USERNAME.github.io/REPO/news-feed.json` | URL feed ต้นทาง; ใส่ได้สูงสุด 3 URL คั่น newline/comma |
| `NEWS_STRUCTURED_ALLOWED_HOSTS` | `USERNAME.github.io` | **Host ต้องตรงตัว** กับ URL ด้านบน; ไม่รวม `https://` |
| `NEWS_STRUCTURED_API_TOKEN` | เว้นว่างได้ | Bearer token สำหรับ feed เอกชนเท่านั้น; ห้ามใส่ใน GitHub frontend |

ตัวอย่างถ้าคุณโฮสต์ไฟล์ JSON บน GitHub Pages ของตัวเอง: ใส่ `news-feed.json` ใน repo แล้วตั้งค่าตามตัวอย่างข้างบน ระบบจะดึงไฟล์ที่ปรับปรุงแล้วอัตโนมัติทุกประมาณ 6 ชั่วโมงเมื่อ Trigger `syncLottery()` ทำงาน **แต่ GitHub Pages ไม่ได้สร้าง/ค้นหาข่าวให้เอง**; ต้องมีผู้ดูแลหรือระบบต้นทางที่ได้รับสิทธิอัปเดต JSON นั้น

ไม่จำเป็นต้องตั้ง `GNEWS_API_KEY`, `NEWS_DIRECT_RSS_FEEDS` หรือ `NEWS_ARTICLE_HOSTS` สำหรับ v5.2.4 เพราะรอบ Sync ปกติ **ไม่พึ่ง RSS/การดึง HTML บทความอีกแล้ว**

### Template ปลอดข้อมูลจริง

มี `templates/news-feed.json` ที่ตั้ง `records: []` เพื่อให้เริ่มต้นใช้งานโดยไม่มีข้อมูลเท็จ และ `templates/NewsStructured-template.csv` สำหรับดูชื่อคอลัมน์

## การทดสอบและแก้ปัญหา

Run ใน Apps Script:

```javascript
setupStructuredNews();
syncStructuredLotteryNews();
diagnoseStructuredNews();
```

**ให้เลือก Run ทีละฟังก์ชันใน Editor** ไม่จำเป็นต้องเรียกทั้งสามในครั้งเดียว

ตัวอย่างการวินิจฉัย **(ไม่ใช่ข้อมูลจริง)**:

```json
{
  "version": "5.2.4",
  "feedCount": 1,
  "allowedHosts": ["USERNAME.github.io"],
  "authConfigured": false,
  "sheetRows": 8,
  "verifiedRows": 8,
  "lastSyncDiagnostics": {
    "targetDrawDate": "2026-11-16",
    "feedOk": 1,
    "sheetRows": 8,
    "insertedRows": 8,
    "rejectedRows": 0
  }
}
```

ความหมายของ error code:

- `configure-structured-source` — ไม่มี JSON feed และไม่มีแถว READY ในชีต
- `wrong-draw` — วันงวดไม่ตรงงวดที่กำลังติดตาม
- `invalid-date` — วันที่ตีพิมพ์ไม่ใช่รูปแบบ ISO ที่มี timezone
- `outside-window` — ตีพิมพ์ก่อนงวดที่ผ่านมา หรือหลัง cutoff หรืออยู่ในอนาคต
- `missing-provenance` — ไม่มี Publisher / PickSource / Title / HTTPS URL
- `no-labeled-numbers` — ไม่มีเลข 2/3 ตัวในฟิลด์ที่แยกประเภทชัดเจน
- `feedErrors > 0` — JSON feed เข้าถึงไม่ได้, รูปแบบผิด, URL ไม่ผ่าน allowlist, HTTP error หรือ redirect
- `duplicateRows > 0` — ชุดเลขที่มาจากแหล่งเดิมถูกนำเข้าแล้ว

**ข้อจำกัด:** แม้ทดสอบออฟไลน์ผ่านแล้ว ยังไม่สามารถยืนยันว่าฟีดที่ตั้งในบัญชีคุณเปิดอ่านสำเร็จจนกว่าจะ Run จริงจาก Apps Script ผู้ใช้งาน

## Security & Ethics

- GitHub Pages เป็น Frontend แบบอ่านอย่างเดียว: **ไม่มี `doPost` และไม่รองรับ public write**
- Token/allowlist อยู่ใน Script Properties ฝั่ง Backend เท่านั้น
- JSON feed จำกัด HTTPS, host ที่อนุญาต, ไม่ตาม Redirect, สูงสุด 3 feeds / 200 records/feed / 250KB ต่อ feed
- รายงาน Diagnostics ไม่เปิดเผย API Token
- ไม่ scrape เว็บไซต์ที่ไม่ได้รับอนุญาต และไม่คัดลอกบทความเต็มมาเผยแพร่ซ้ำ
- คัดเลือกแบบมีโครงสร้าง **ไม่ใช่การตรวจสอบข้อเท็จจริงว่าผู้เผยแพร่ให้เลขนั้นจริง** ควรเปิด URL ต้นฉบับตรวจเมื่อมีข้อสงสัย
- ผลรางวัลทางการให้ยึดสำนักงานสลากกินแบ่งรัฐบาล (GLO) เท่านั้น
- ข่าวเลขเด็ดไม่ได้มีหลักฐานว่าทำให้คาดการณ์การสุ่มงวดถัดไปได้แม่นขึ้น จึงยังไม่ผสมกับโมเดลหลักอัตโนมัติ

## Validation

- `node tests/structured-news.test.js`
- `node --check PRIVATE-backend/Code.gs` (สามารถคัดลอกเป็น `.js` เพื่อเช็ก syntax ใน Node)
- `node --check github-pages-ready/script.js`

ดูผลทดสอบที่ `TEST_REPORT.md`
