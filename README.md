# Lottery Insight v5.3.1 — News Publisher Parser Hotfix

แก้ Error:

```
Error: Publisher response is not a Thai-government lucky-picks page
newsParsePublisherPage_ (LotteryV2.gs)
```

## สาเหตุที่ตรวจพบจาก Code.gs v5.3.0

ฟังก์ชัน `newsParsePublisherPage_()` ใช้ regex แบบตรงตัว (`เลขเด็ดหวยรัฐบาล`) กับข้อความที่ดึงจาก **120,000 ตัวอักษรแรกของ HTML** เท่านั้น ทำให้มีโอกาสปฏิเสธหน้าเว็บที่ถูกต้องถ้า HTML ส่วนหัวใหญ่หรือข้อความมีตัวคั่น/ช่องว่าง แม้หน้าเว็บสาธารณะจะมีเนื้อหาข่าวจริง

ยังมีสาเหตุอื่นที่เป็นไปได้ เช่น เว็บต้นทางส่งหน้า Cloudflare/Access Denied แทนหน้าเนื้อหา ไม่อาจตัดสินจาก Error เดิมเพียงอย่างเดียวได้

## สิ่งที่แก้

1. อ่าน title/H1 จาก **HTML เต็มที่ได้รับ** โดยไม่ตัดแค่ 120,000 ตัวอักษรแรก
2. ตรวจว่ามี `เลขเด็ด`, `หวยรัฐบาล` และ **งวดเป้าหมายตรงกัน**; ยอมรับช่องว่าง/จุด/ตัวคั่นระหว่างคำ
3. จำกัดการดึงเลขให้อยู่ใต้ H2 `สำนักแต่ละแห่งให้เลขอะไรไว้` และ H3 สำนักที่มีรายการ `สองตัว` / `สามตัว` ชัดเจนเท่านั้น
4. ยังคงรักษาเลขศูนย์นำหน้า (`01`, `081`) และตัดชุดเลขที่ใหญ่ผิดปกติ
5. ตรวจแยกหน้า Block/CAPTCHA; ไม่พยายามหลบเลี่ยงมาตรการป้องกันของผู้เผยแพร่
6. เพิ่ม `newsInspectPublisherPage_()` สำหรับ diagnostic ภายใน
7. ปรับ `probeLotteryNewsSource()` ให้ **คืนรายงานแทนการ throw ทันที** พร้อม `httpStatus`, `contentType`, `inspection.title`, `inspection.h1`, `inspection.correctHeading`, `inspection.sectionFound`, `inspection.h3Count`, `inspection.blocked` และ `reason`
8. Backend cache version เปลี่ยนเป็น `dashboard-v531` และ Engine version เป็น `5.3.1`

## ติดตั้ง

1. **สำรอง** `Code.gs` และ Google Sheet
2. นำ `Code.gs` จากแพ็กเกจนี้ไปแทน Backend v5.3.0 **ทั้งหมด** (ไฟล์นี้เป็น Backend เต็ม ไม่ใช่ patch บางส่วน)
3. Save แล้วรัน **`probeLotteryNewsSource()`** ก่อน — ไม่เขียน Sheet
4. ดูใน Execution Log:

```json
{
  "version": "5.3.1",
  "ok": true,
  "httpStatus": 200,
  "inspection": {
    "correctHeading": true,
    "sectionFound": true,
    "blocked": false
  },
  "groupCount": 4
}
```

ตัวเลข `groupCount: 4` เป็นเพียงตัวอย่าง ผลจริงเปลี่ยนตามหน้าเว็บ

5. ถ้า `ok:true` ให้รัน **`syncLotteryNews()`** แล้ว **`diagnoseLotteryNews()`** และตรวจชีต `NewsArticles`
6. เมื่อสำเร็จ จึง **Deploy > Manage deployments > Edit > New version > Deploy** เพื่อให้หน้าเว็บใช้ Backend รุ่นล่าสุด
7. **ไม่ต้องแก้ GitHub Pages** และ **ไม่ต้องลบ Sheet**

## ถ้า Probe ยังไม่ผ่าน

- `httpStatus` != 200: ปัญหาเครือข่าย/การเข้าถึงหน้า
- `inspection.blocked: true`: ต้นทางส่งหน้า Block/Challenge — หยุด retry ถี่ ๆ; ต้องใช้ช่องทางที่ได้รับอนุญาตจากผู้ให้บริการ
- `inspection.correctHeading: false`: เปรียบเทียบ `inspection.title`, `inspection.h1`, `inspection.visibleSample` ว่าได้หน้าอะไรมาจริง
- `inspection.sectionFound: false`: หน้าแสดงหัวข้อหลัก แต่ไม่มีตารางเลขตามสำนักใน HTML ตอบกลับ อาจเปลี่ยน layout หรือโหลดด้วย JavaScript
- `inspection.sectionFound: true` แต่ `ok:false`: รายการเลขใน HTML อาจเปลี่ยนรูปแบบ; ดู `reason`

**ข้อจำกัด:** การทดสอบ 12/12 เป็น unit/regression test โดยใช้ HTML จำลองเพื่อทดสอบ Parser ไม่ได้ทดสอบ `UrlFetchApp` จริงในบัญชี Google Apps Script ของคุณ และไม่รับรองว่าจะ bypass การจำกัดเข้าถึงของผู้เผยแพร่ได้

โปรดปฏิบัติตามเงื่อนไขการเข้าถึงและเผยแพร่ข้อมูลจาก LotteryChecks และใส่เครดิต/ลิงก์ต้นทางตามเดิม
