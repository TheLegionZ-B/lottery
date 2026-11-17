# Lottery Insight v5.4.1 — Warm Edition

![Frontend](https://img.shields.io/badge/Frontend-v5.4.1-A15132)
![Backend](https://img.shields.io/badge/Backend-v5.3.2-795548)
![Hosting](https://img.shields.io/badge/Hosting-GitHub%20Pages-24292f)

> Personal Lottery Statistics Experiment by **TheLegionZ**

Lottery Insight เป็นเว็บไซต์สำหรับดูผลสลากกินแบ่งรัฐบาล ตรวจรางวัลหลายใบ รวบรวมเลขดังจากข่าวโดยอัตโนมัติ และทดลองการวิเคราะห์สถิติพร้อมบันทึกผลการคาดการณ์ย้อนหลัง ภายใต้แนวคิด User-first Design: สิ่งที่ผู้ใช้ต้องการอยู่ด้านบน ส่วนรายละเอียดทางเทคนิคอยู่ด้านท้าย

> [!IMPORTANT]
> เว็บไซต์นี้จัดทำเพื่อการศึกษาและทดลองสถิติ ไม่ใช่คำแนะนำในการซื้อสลาก คะแนน Stat score เป็นคะแนนจัดอันดับ ไม่ใช่ความน่าจะเป็นในการถูกรางวัล ผลย้อนหลังและเลขดังจากข่าวไม่สามารถรับประกันผลในอนาคตได้ ผลรางวัลทางการให้ยึด [สำนักงานสลากกินแบ่งรัฐบาล (GLO)](https://www.glo.or.th/mission/reward-payment/check-reward) เป็นหลัก

## What's new — v5.4.1

- เปลี่ยนธีมจาก Navy Blue เป็น Warm Edition: ครีม ทองอ่อน Terracotta และน้ำตาล Espresso
- ย้ายการทดลองและติดตามผลระบบ รวมถึงผลการคาดการณ์ที่ผ่านมา มาอยู่ต่อจากเลขดังจากข่าวและก่อนประวัติผลสลาก
- ปรับเมนูนำทางให้สอดคล้องกับลำดับเนื้อหาใหม่
- รองรับ Light Mode / Dark Mode โดยคงสีเขียวสำหรับรายการที่ตรงรางวัล
- ปรับสีช่องกรอกเลขใน Dark Mode ให้อ่านได้ชัดเจน
- คงโลโก้และ Favicon เดิม พร้อมการแสดงผลบนคอมพิวเตอร์และมือถือ

รุ่นนี้เป็น **Frontend-only update** ไม่เปลี่ยนสูตรคาดการณ์ โครงสร้าง Google Sheets แหล่งข่าว หรือ Backend v5.3.2

### Color palette

| Color | HEX |
|---|---|
| Warm Cream | `#F8F3EB` |
| Soft Gold | `#F7DFB4` |
| Terracotta | `#A15132` |
| Espresso | `#543021` |

## Layout

1. ผลสลากงวดล่าสุด
2. ตรวจรางวัลหลายใบ
3. เลขดังจากข่าว
4. การทดลองและติดตามผลระบบ (Prediction)
5. ผลการคาดการณ์ที่ผ่านมา (Audit)
6. ประวัติผลสลาก
7. สถิติเลขออกมาก / ออกน้อย
8. Algorithm Performance — Walk-forward Backtest
9. รายละเอียดสถานะระบบข่าว

บน Desktop ส่วนผลล่าสุดและตรวจรางวัลจะแสดงคู่กัน ส่วน Mobile จะแสดงเรียงตามลำดับ

## Features

### ผลสลากและตรวจรางวัล

- แสดงรางวัลที่ 1 เลขหน้า 3 ตัว เลขท้าย 3 ตัว เลขท้าย 2 ตัว และรางวัลข้างเคียงรางวัลที่ 1 เมื่อมีข้อมูล
- เลือกงวดที่มีข้อมูลและกรอกเลขสลาก 6 หลักได้หลายใบ สูงสุด 100 ช่อง
- รองรับหมายเลขซ้ำและนับจำนวนใบแยกกัน รวมยอดเงินรางวัลเมื่อข้อมูลพร้อม
- แสดงผลด้วย Modal และแจ้งเตือนเมื่อไม่มีข้อมูลรางวัลครบถ้วน แทนการสรุปว่าไม่ถูกรางวัล
- เก็บเลขศูนย์นำหน้า เช่น `06` และ `081`

### News Intelligence

ระบบรวบรวมเลข 2 ตัวและ 3 ตัวจากหน้ารวมเลขดังของ [LotteryChecks](https://lotterychecks.com/lucky-picks) สำหรับงวดเป้าหมาย โดยแยกชุดเลขตามสำนักที่ระบุในต้นทาง

- อัปเดตผ่าน Scheduled Sync ประมาณทุก 6 ชั่วโมงเมื่อ Trigger ทำงานตามปกติ
- แสดงชื่อสำนัก ชุดเลข และลิงก์อ้างอิง
- แสดงข้อมูลที่ผ่านเกณฑ์ของระบบเท่านั้น ไม่ใช้ Demo หรือ Dummy fallback
- เก็บ Snapshot เพื่อเทียบกับผลจริงย้อนหลัง และแสดงเลขที่ตรงกันระหว่างข่าวกับการคาดการณ์เมื่อมีข้อมูล
- หากแหล่งข้อมูลไม่พร้อมหรือไม่พบชุดเลขที่ผ่านเกณฑ์ ระบบอาจไม่มีเลขข่าวให้แสดง

ความถี่ที่ถูกกล่าวถึงในข่าวไม่ใช่ความน่าจะเป็นในการออกรางวัล และไม่ได้นำมาปรับคะแนน Algorithm หลักโดยตรง

### Prediction & Audit

| ระบบ | Algorithm |
|---|---|
| เลขท้าย 2 ตัว | v3 — Walk-forward Ensemble |
| เลขสลาก 6 หลัก | v2 — Coverage + Diversity |

เลขท้าย 2 ตัวใช้หลายโมเดลที่อาศัยความถี่เลข ตำแหน่งหลักสิบ/หลักหน่วย และน้ำหนักตามช่วงเวลา ทดสอบย้อนหลังแบบ Walk-forward โดยใช้เฉพาะข้อมูลก่อนงวดที่ทดสอบ แล้วรวมคะแนนตามน้ำหนักของโมเดล

เลข 6 หลักใช้สถิติแยกตำแหน่ง คู่เลขติดกัน และข้อมูลรางวัลย่อย เพื่อจัดอันดับและลดความซ้ำซ้อนในชุด Candidate เมื่อผลออก ระบบตรวจเลขเต็ม 6 หลัก เลขหน้า 3 ตัว เลขท้าย 3 ตัว และเลขท้าย 2 ตัวตามข้อมูลรางวัลที่มี

- ใช้ข้อมูลย้อนหลังสูงสุด 80 งวดในการวิเคราะห์ตามการตั้งค่า Backend ปัจจุบัน
- แสดง Top 5 และเก็บ Snapshot สำหรับตรวจสอบกับผลจริง
- คงกติกาตัดเลขที่ออกงวดล่าสุดของแต่ละโมเดลตามเดิม
- แสดงสถานะและแถบสีเขียวเมื่อผลตรวจตรงรางวัลในประวัติ
- แยกการตรวจผลจริงออกจาก Backtest

การบันทึก Snapshot และผลตรวจย้อนหลังมีไว้ประเมินระบบ ไม่ได้ยืนยันว่าโมเดลสามารถทำนายเหนือการสุ่มได้

### Historical Statistics & Backtest

แสดงประวัติผลสลากย้อนหลังสูงสุด 100 งวดบนหน้าเว็บตามข้อมูลที่ได้รับ รองรับตัวเลือกช่วงสถิติ 10 / 20 / 50 งวด และทั้งหมดที่โหลดมา พร้อมความถี่เลข 0–9 เลขออกบ่อยและออกน้อย

Algorithm Performance แสดงจำนวนงวดที่ทดสอบ, Ensemble Top-5 Hit Rate, ผลรายโมเดลและน้ำหนักของโมเดล โดยเปรียบเทียบกับ theoretical random baseline 5% สำหรับการเลือกเลขท้าย 2 ตัวจำนวน 5 หมายเลขที่ไม่ซ้ำจาก 100 ผลลัพธ์ ภายใต้สมมติฐานการสุ่มเท่าเทียมกัน

## Architecture

```text
Lottery result / news source
            │
            ▼
Scheduled private backend
            │
            ▼
       Data storage
            │
       Read-only API
            │
            ▼
       GitHub Pages
```

หน้าเว็บไซต์เป็น Static Website เรียกอ่านข้อมูลจาก API เท่านั้น การ Sync และประมวลผลทำใน Backend โดยใช้ Trigger เดิม

## Project structure

```text
repository/
├── index.html
├── style.css
├── script.js
├── config.js                 # ใช้ไฟล์เดิมที่ตั้ง DATA_URL แล้ว
├── README.md
└── assets/
    ├── lottery-insight-logo.png
    ├── favicon.ico
    ├── favicon-16.png
    ├── favicon-32.png
    ├── favicon-192.png
    ├── favicon-512.png
    └── apple-touch-icon.png
```

> Update-only ZIP ไม่ได้บรรจุ `config.js` หรือ `Code.gs` เพื่อรักษาการเชื่อมต่อเดิมและแยก Backend ออกจาก Public Repository

## Upgrade from v5.4.0

1. สำรองไฟล์เว็บไซต์เดิม
2. แตกไฟล์ `lottery-insight-v5.4.1-github-pages-update-only.zip`
3. อัปโหลด `index.html`, `style.css`, `script.js` และโฟลเดอร์ `assets/` ทับไฟล์เดิมใน GitHub Pages
4. คง `config.js` เดิมไว้ แล้วนำ README นี้ไปวางที่ root ของ Repository ในชื่อ `README.md`
5. Commit และรอ GitHub Pages เผยแพร่ตามปกติ จากนั้นกด `Ctrl + F5`

**ไม่ต้องแก้ Code.gs, ไม่ต้อง Deploy Apps Script ใหม่, ไม่ต้องแก้ Google Sheet และไม่ต้องสร้าง Trigger ใหม่** หาก Backend v5.3.2 เดิมทำงานปกติ

## Configuration (กรณีติดตั้งใหม่)

ต้องมี Backend v5.3.2 ที่ Deploy และตั้งค่าครบแล้ว จากนั้นสร้าง `config.js` ในโฟลเดอร์เดียวกับ `index.html` ดังนี้

```javascript
window.APP_CONFIG = {
  DATA_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
```

แทน URL ตัวอย่างด้วย Web App URL จริงที่ลงท้าย `/exec` แล้วตั้ง GitHub Pages ให้เผยแพร่จาก Branch และ Folder ที่เก็บไฟล์ดังกล่าว

ห้ามใส่ Password, Private Key หรือ Secret Token ใน `config.js` เพราะไฟล์ Frontend และ URL ที่เบราว์เซอร์เรียกสามารถถูกตรวจดูได้ ไม่ควรอัปโหลด `Code.gs` ของ Private Backend ขึ้น Public Repository

## Troubleshooting

| อาการ | วิธีตรวจสอบ |
|---|---|
| หน้าเว็บยังเป็นธีมเดิม | ตรวจ GitHub Pages deployment และกด `Ctrl + F5` |
| เชื่อมต่อไม่ได้ | ตรวจ `DATA_URL` ใน `config.js` และปุ่มตรวจสอบ Backend |
| Backend ไม่ตอบ JSON | ตรวจ URL `/exec` และสิทธิ์ Web App |
| เลขดังไม่แสดง | ตรวจสถานะข่าวและงวดเป้าหมาย รัน `diagnoseLotteryNews()` ฝั่ง Backend หากจำเป็น |
| ต้องตรวจแหล่งข่าวโดยตรง | ใช้ `probeLotteryNewsSource()` เพื่อดู HTTP status และผลอ่านชุดเลขจากต้นทาง |
| ประวัติรางวัลเก่าไม่ครบ | ตรวจว่าข้อมูลรางวัลของงวดนั้นครบหรือไม่ และยืนยันกับ GLO |

สำหรับ Backend v5.3.2 สามารถตรวจความพร้อมเบื้องต้นจาก URL `/exec?mode=health` หาก `ok: true` และ `code: READY` ให้ตรวจ Dashboard และหน้าเว็บต่อ ไม่จำเป็นต้องลบข้อมูลใน Sheet เพื่อแก้ปัญหา UI

## Validation & limitations

การทดสอบรุ่น UI ที่รายงานไว้ครอบคลุม Desktop 1440px, Mobile 390px/320px, Light/Dark Mode, การตรวจสลากหลายใบและเลขซ้ำ, สถานะประวัติที่ตรงรางวัล และ JavaScript/HTML IDs โดยใช้ Chromium กับ API จำลองสำหรับการทดสอบเท่านั้น ไม่ได้บรรจุ Dummy data ในแพ็กเกจใช้งานจริง

ยังไม่ได้ยืนยันผลบน GitHub Repository และ Apps Script Deployment จริงของผู้ดูแล และแหล่งข้อมูลภายนอกอาจเปลี่ยนโครงสร้างหรือจำกัดการเข้าถึงได้

## Data sources & credits

- Official results verification: [สำนักงานสลากกินแบ่งรัฐบาล (GLO)](https://www.glo.or.th/)
- Data and lucky picks: [LotteryChecks](https://lotterychecks.com/)

การใช้งานข้อมูลภายนอกต้องเป็นไปตามเงื่อนไขของผู้ให้บริการ และควรตรวจสอบข้อมูลรางวัลกับแหล่งทางการก่อนนำไปใช้

## Version information

| Component | Version |
|---|---|
| Frontend | v5.4.1 — Warm Edition |
| Backend | v5.3.2 — Connection Fix |
| Prediction 2D | Algorithm v3 — Walk-forward Ensemble |
| Prediction 6D | Algorithm v2 — Coverage + Diversity |
| Hosting | GitHub Pages |

## Author

**TheLegionZ**

Lottery Insight · Personal Statistics Experiment
