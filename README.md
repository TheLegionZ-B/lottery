# Lottery Insight v5.4.3 — Warm Edition + Visual Algorithm Lab

![Frontend](https://img.shields.io/badge/Frontend-v5.4.3-A15132)
![Backend](https://img.shields.io/badge/Backend-v5.3.2-795548)
![Hosting](https://img.shields.io/badge/Hosting-GitHub%20Pages-24292f)

> Personal Lottery Statistics Experiment by **TheLegionZ**

Lottery Insight เป็นเว็บไซต์สำหรับดูผลสลากกินแบ่งรัฐบาล ตรวจรางวัลหลายใบ รวบรวมเลขดังจากข่าวโดยอัตโนมัติ และทดลองการวิเคราะห์สถิติพร้อมบันทึกผลการคาดการณ์ย้อนหลัง ภายใต้แนวคิด User-first Design: สิ่งที่ผู้ใช้ต้องการอยู่ด้านบน ส่วนรายละเอียดทางเทคนิคอยู่ด้านท้าย

> [!IMPORTANT]
> เว็บไซต์นี้จัดทำเพื่อการศึกษาและทดลองสถิติ ไม่ใช่คำแนะนำในการซื้อสลาก คะแนน Stat score เป็นคะแนนจัดอันดับ ไม่ใช่ความน่าจะเป็นในการถูกรางวัล ผลย้อนหลังและเลขดังจากข่าวไม่สามารถรับประกันผลในอนาคตได้ ผลรางวัลทางการให้ยึด [สำนักงานสลากกินแบ่งรัฐบาล (GLO)](https://www.glo.or.th/mission/reward-payment/check-reward) เป็นหลัก

## What's new — v5.4.3

- Labs UI v0.2.1 เพิ่มกราฟแท่งเปรียบเทียบผลย้อนหลังทั้ง 5 หมวด ร่วมกับตารางเดิม
- แสดงสูตรเดิมหรือสูตรความถี่อ้างอิง, Multi-window Lab, จำนวนงวดที่ตรงรางวัลและ Baseline สุ่มตามทฤษฎี (เฉพาะหมวดที่มี)
- กราฟใช้สเกลเดียวกันภายในหมวด แสดงจุดสิ้นสุดสเกลกำกับไว้ แต่ต่างหมวดอาจมีสเกลต่างกัน ไม่ควรเปรียบเทียบความยาวแท่งข้ามหมวด
- สรุปอัตโนมัติว่าผลย้อนหลังเท่ากันหรือสูตรใดตรงรางวัลมากกว่า พร้อมเตือนเมื่อทดสอบน้อยกว่า 20 งวด (เกณฑ์แจ้งเตือน UI ไม่ใช่เกณฑ์นัยสำคัญทางสถิติ)
- แยก 0% (ทดสอบแล้วไม่ตรง) จากข้อมูลไม่พอ (—) และไม่คำนวณตัวเปรียบเทียบเมื่อไม่มีจำนวนงวดร่วมกัน
- กราฟสร้างจากผล Worker จริงทุกครั้ง ไม่มีตัวเลขตัวอย่างฝังในหน้าเว็บ แสดงใหม่เมื่อทดสอบสำเร็จ และล้างเมื่อเริ่มใหม่หรือเกิดข้อผิดพลาด
- ไม่เปลี่ยน engine.js, legacy-models.js, worker.js, ระบบข่าว, Backend หรือ Google Sheets

## Upgrade from v5.4.2 (แนะนำ)

1. แตกไฟล์ `lottery-insight-v5.4.3-github-pages-update-only.zip`
2. อัปโหลด `index.html`, `README.md` ที่ root และไฟล์ภายใน `labs/` ทับในโฟลเดอร์เดิม โดยไม่ลบไฟล์อื่น
3. **คง `config.js`, `labs/labs-config.js`, `style.css`, `script.js` และ `assets/` เดิม**
4. เมื่อ GitHub Pages เผยแพร่แล้ว กด `Ctrl + F5` เปิด Labs และเลือก 20/40/60 งวด จากนั้นกดทดสอบกับข้อมูลจริง กราฟจะปรากฏเหนือผลตาราง

หากใช้งาน v5.4.2 แล้ว สามารถอัปเดตเฉพาะ `labs/index.html`, `labs/algorithm.js` และ `labs/labs.css` ได้เช่นกัน แต่ Footer ของเว็บหลักและ README จะยังเป็นเวอร์ชันเดิมหากไม่ได้อัปเดตไฟล์ root

ไม่ต้อง Deploy Apps Script ใหม่หรือแก้ Trigger

## What's new — v5.4.2

- เพิ่มลิงก์ `Labs` ขนาดเล็กใน Footer ต่อจาก Lottery Insight · TheLegionZ เท่านั้น ไม่เพิ่มเมนู Labs ใน Header ของเว็บไซต์หลัก
- รวม Algorithm Lab และ News Lab ใน `labs/index.html` หน้าเดียว วาง Algorithm ก่อนข่าว และรายละเอียดระบบแบบพับ/ขยายไว้ด้านล่าง
- ใช้ `style.css` โลโก้ Favicon สี และรูปแบบองค์ประกอบเดียวกับ Warm Edition ของเว็บหลัก
- Light/Dark Mode ใช้ค่า `lottery-theme` ร่วมกันบน Origin เดียวกัน
- ผลทดสอบย้อนหลังมีสรุปจำนวนหมวดที่สูตรใหม่ตรงมากกว่า/เท่ากัน/น้อยกว่า/เปรียบเทียบไม่ได้ โดยไม่เปลี่ยนสูตรหรือตีความว่าเป็นผลคาดการณ์อนาคต
- ลิงก์ `labs/news.html` และ `labs/algorithm.html` เดิมพาไปยังหัวข้อเดิมภายในหน้า Labs ใหม่
- คง Backend หลัก v5.3.2 และ Labs Backend v0.1.3, ไม่เปลี่ยนแหล่งข่าวหรือสูตร ไม่แก้ Google Sheets, ไม่เปลี่ยน Trigger

## What's new — v5.4.1

- เปลี่ยนธีมจาก Navy Blue เป็น Warm Edition: ครีม ทองอ่อน Terracotta และน้ำตาล Espresso
- ย้ายการทดลองและติดตามผลระบบ รวมถึงผลการคาดการณ์ที่ผ่านมา มาอยู่ต่อจากเลขดังจากข่าวและก่อนประวัติผลสลาก
- ปรับเมนูนำทางให้สอดคล้องกับลำดับเนื้อหาใหม่
- รองรับ Light Mode / Dark Mode โดยคงสีเขียวสำหรับรายการที่ตรงรางวัล
- ปรับสีช่องกรอกเลขใน Dark Mode ให้อ่านได้ชัดเจน
- คงโลโก้และ Favicon เดิม พร้อมการแสดงผลบนคอมพิวเตอร์และมือถือ

v5.4.1 เป็น **Frontend-only update** ไม่เปลี่ยนสูตรคาดการณ์ โครงสร้าง Google Sheets แหล่งข่าว หรือ Backend v5.3.2

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
├── labs/
│   ├── index.html           # Algorithm + News Lab
│   ├── labs-config.js       # คง URL ของ Labs เดิม
│   ├── labs.css             # ส่วนเสริมของ ../style.css
│   ├── theme.js
│   ├── common.js
│   ├── algorithm.js
│   ├── news.js
│   ├── engine.js           # สูตรเดิมของ Lab
│   ├── legacy-models.js
│   ├── worker.js
│   ├── algorithm.html      # ลิงก์เดิมไป index.html#algorithm
│   └── news.html           # ลิงก์เดิมไป index.html#news
└── assets/
    ├── lottery-insight-logo.png
    ├── favicon.ico
    ├── favicon-16.png
    ├── favicon-32.png
    ├── favicon-192.png
    ├── favicon-512.png
    └── apple-touch-icon.png
```

> ZIP รุ่นนี้เป็นแพตช์สำหรับ Repository ที่ติดตั้ง Frontend v5.4.1 และ Labs 0.1 หรือ v5.4.2 แล้ว ไม่ใช่แพ็กเกจสำหรับติดตั้งใหม่ ไม่บรรจุ `config.js`, `labs/labs-config.js`, `Code.gs` หรือ API Key รวมถึงไม่ทับ `style.css`, `script.js` และ `assets/` ของเว็บหลัก

## Upgrade from v5.4.1 + Labs 0.1

1. สำรอง Repository ก่อนอัปเดต
2. แตกไฟล์ `lottery-insight-v5.4.3-github-pages-update-only.zip`
3. อัปโหลด `index.html` และ `README.md` ที่ root และไฟล์ภายใน `labs/` ลงในโฟลเดอร์ `labs/` เดิม (ไม่สร้าง `labs/labs/` หรือ ลบโฟลเดอร์เดิมทั้งโฟลเดอร์)
4. **คง `config.js` และ `labs/labs-config.js` เดิมไว้ทั้งสองไฟล์** รวมถึง `style.css`, `script.js` และ `assets/` ที่มีอยู่
5. Commit และเมื่อ GitHub Pages เผยแพร่แล้ว กด `Ctrl + F5` ที่หน้าหลัก คลิกลิงก์ `Labs ↗` ท้ายเว็บ
6. ใน Labs ทดลองเลือก 20/40/60 งวด กดทดสอบ และตรวจเมนู News Lab, Theme และลิงก์กลับหน้าหลัก

ไม่ต้องแก้ Code.gs, Deploy Apps Script, แก้ Google Sheet หรือสร้าง Trigger ใหม่ หาก Backend เดิมทำงานอยู่แล้ว

## Lottery Insight Labs — UI 0.2.1

Labs เป็นพื้นที่ทดลองแยกจาก Production ใช้ API เดิม 3 โหมดเท่านั้น:

| API | Mode | Function |
|---|---|---|
| Production | `dashboard` | อ่านชุดเลขจาก LotteryChecks ที่ระบบหลักเก็บไว้ |
| Labs | `history` | อ่านผลสลากย้อนหลังจาก Results เพื่อทดสอบแบบ Walk-forward ใน Worker |
| Labs | `news` | อ่านข่าวเพิ่มเติมที่เคยรวบรวมไว้และสถานะ Provider |

ผลที่แสดงไม่ใช่ Snapshot ที่ประกาศจริง และยังไม่ Promote สูตรใดเข้า Production. แหล่งข่าว RANLOTTO และ GNews ยังไม่ได้ข้อมูลข่าวตรงหัวข้อจากการทดสอบที่ผ่านมา การรวม UI ไม่ได้แก้ข้อจำกัดของผู้ให้บริการหรือเพิ่มข่าวใหม่

หากต้องตั้ง `labs/labs-config.js` ใหม่ ให้ใช้ **Web App URL ของ Project LotteryLabs** ไม่ใช่ URL ของระบบหลัก:

```javascript
window.LOTTERY_LABS_CONFIG = {
  DATA_URL: 'https://script.google.com/macros/s/YOUR_LABS_DEPLOYMENT_ID/exec'
};
```

ตรวจ `?mode=health` และ `?mode=history` ของ Labs Web App ใน Browser หากติดปัญหา และใช้ `config.js` ของระบบหลักแยกต่างหาก. ห้ามใส่ API Key ลงในไฟล์ Frontend ทั้งสอง

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

## Validation & limitations — v5.4.3

- ตรวจ JavaScript Syntax ของ Labs ทุกไฟล์ และตรวจ HTML IDs / initial hidden state
- ทดสอบ render ด้วย DOM จำลอง โดยใช้ตัวเลขผลตัวอย่างที่ผู้ใช้รายงาน: 1/40, 0/2, 5/22, 2/22; ตรวจกราฟครบ 5 หมวด, การคำนวณเปอร์เซ็นต์, ความกว้างแท่ง, Baseline 0.0005%, กรณีไม่มีข้อมูล, จำนวนงวดไม่เท่ากัน, การล้างกราฟ และ DATA_URL ว่าง
- ทดสอบ Chromium โดยโหลด HTML/CSS และเรียก render ด้วยผลทดสอบจำลอง: Desktop 1440px, Mobile 390px/320px, Dark Mode ไม่พบหน้าเว็บล้นแนวนอนในสามขนาดที่ทดสอบ
- ตรวจเทียบ engine.js, legacy-models.js, worker.js, common.js, news.js, theme.js กับ v5.4.2 ตรงกันทุกไบต์
- ไม่มีข้อมูลตัวอย่างใน ZIP; ภาพ preview ใช้ผลย้อนหลังที่ผู้ใช้ส่งมาเป็น fixture เท่านั้น

**ข้อจำกัด:** การทดสอบ Browser รอบนี้เป็นการตรวจการแสดงผลโดยส่งผลทดสอบเข้า render โดยตรง ไม่ได้ทดสอบ Worker, fetch, GitHub Pages หรือ Apps Script Deployment จริง; ไม่ได้คำนวณ Backtest ใหม่จากชีตของผู้ใช้ และไม่ใช่การพิสูจน์ประสิทธิภาพของสูตร

### Previous validation — v5.4.2

- ตรวจ HTML: ID ไม่ซ้ำ, ลิงก์ไฟล์ CSS/JS/รูปภาพและลิงก์กลับหน้าหลักถูกต้อง
- เปรียบเทียบ `index.html` หลักกับรุ่น 5.4.1: ต่างเฉพาะ Footer และป้ายเวอร์ชัน
- ตรวจ JavaScript Syntax ทุกไฟล์ของ Labs
- เปรียบเทียบ `engine.js`, `legacy-models.js`, `worker.js`, `common.js` กับแพ็กเกจเดิม: ตรงกันทุกไบต์
- ทดสอบ JavaScript ด้วย DOM/API/Worker จำลอง: Theme, เลขศูนย์นำหน้า, ตัวกรองข่าว, การรักษาข่าวเดิมเมื่อ API ขัดข้อง, ผลทดสอบ 5 แถว, สรุปผล, กรณี History API ล้มเหลวและ DATA_URL ว่าง
- ไม่ใส่ Dummy data ในแพ็กเกจจริง

**ข้อจำกัดของ v5.4.2:** Chromium เปิดหน้าเว็บทดสอบไม่ได้ (`ERR_BLOCKED_BY_ADMINISTRATOR`) จึงยังไม่รับรองหน้าตาจริงบน Desktop/Mobile หรือการทำงานของ Worker ผ่าน Browser ในรุ่นนี้ ไม่ได้ทดสอบกับ GitHub Pages/Apps Script Deployment จริง และไม่ได้ตรวจความพร้อมของผู้ให้บริการข่าวใหม่ ผลการทดสอบ UI 5.4.1 ก่อนหน้านี้ไม่ใช่ผลการทดสอบ Browser ของแพตช์นี้

## Data sources & credits

- Official results verification: [สำนักงานสลากกินแบ่งรัฐบาล (GLO)](https://www.glo.or.th/)
- Data and lucky picks: [LotteryChecks](https://lotterychecks.com/)

การใช้งานข้อมูลภายนอกต้องเป็นไปตามเงื่อนไขของผู้ให้บริการ และควรตรวจสอบข้อมูลรางวัลกับแหล่งทางการก่อนนำไปใช้

## Version information

| Component | Version |
|---|---|
| Frontend | v5.4.3 — Warm Edition + Visual Algorithm Lab |
| Labs UI | v0.2.1 — Visual Comparison |
| Labs Backend | v0.1.3 — unchanged |
| Backend | v5.3.2 — Connection Fix |
| Prediction 2D | Algorithm v3 — Walk-forward Ensemble |
| Prediction 6D | Algorithm v2 — Coverage + Diversity |
| Hosting | GitHub Pages |

## Author

**TheLegionZ**

Lottery Insight · Personal Statistics Experiment
