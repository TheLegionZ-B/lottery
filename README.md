# 🎯 Lottery Insight v5.1

> Personal lottery statistics experiment by **TheLegionZ**

Lottery Insight เป็นเว็บสำหรับดูผลสลากย้อนหลัง วิเคราะห์สถิติ ตรวจรางวัลหลายหมายเลข และทดลองระบบ Prediction แบบเก็บ Snapshot เพื่อตรวจสอบย้อนหลังได้ว่า Algorithm ที่ใช้เคยทำนายตรงจริงหรือไม่

> [!WARNING]
> ระบบนี้จัดทำเพื่อการศึกษา ทดลองสถิติ และความบันเทิงเท่านั้น  
> **Stat score ไม่ใช่ Probability และไม่มี Algorithm ใดรับประกันผลสลากงวดถัดไปได้**  
> ผลรางวัลอย่างเป็นทางการให้ยึดข้อมูลจาก **สำนักงานสลากกินแบ่งรัฐบาล (GLO)** เป็นหลัก

---

## ✨ Features

### ผลสลากล่าสุด

แสดงข้อมูลหลักของงวดล่าสุด ได้แก่

- รางวัลที่ 1
- เลขท้าย 2 ตัว
- เลขหน้า 3 ตัว
- เลขท้าย 3 ตัว
- รางวัลข้างเคียงรางวัลที่ 1 เมื่อมีข้อมูล
- เวลาอัปเดตล่าสุด

---

### ตรวจรางวัลย้อนหลัง

รองรับการตรวจหลายใบในงวดเดียว

- กรอกเลขสลาก 6 หลักทีละช่อง
- กด `+ เพิ่มเลข` เพื่อเพิ่มสลากหลายใบ
- รองรับเลขซ้ำ เช่น มีเลขเดียวกัน 2 ใบ
- เลือกงวดจาก Dropdown เฉพาะงวดที่ระบบมีข้อมูล
- ตรวจทุกหมายเลขพร้อมกัน
- Modal แสดงผลแบบ Animated
- สรุปจำนวนใบที่ถูกรางวัล
- แสดงรางวัลที่ตรงของแต่ละหมายเลข
- คำนวณยอดเงินรางวัลรวมเมื่อข้อมูลจำนวนเงินพร้อมใช้งาน

---

## 🔮 Prediction

ระบบ Prediction ปัจจุบันแบ่งเป็น 2 ส่วน

### เลขท้าย 2 ตัว — Algorithm v3

v5.1 เปลี่ยนจากสูตรเดียวมาเป็น **Walk-forward Ensemble**

โมเดลที่ใช้ใน Algorithm Arena:

1. **Exact Frequency**
2. **Digit Position**
3. **Recent Weighted**
4. **Balanced Hybrid**

แต่ละโมเดลจะถูกทดสอบย้อนหลังแบบ Walk-forward โดยห้ามใช้ข้อมูลของงวดที่กำลังทดสอบหรือข้อมูลในอนาคต

ตัวอย่าง:

```text
Training: งวด 1–29
Prediction: งวด 30
ตรวจผลจริง: งวด 30

Training: งวด 1–30
Prediction: งวด 31
ตรวจผลจริง: งวด 31

...
```

จากนั้นระบบนำผลงาน Out-of-sample ของแต่ละโมเดลมาคำนวณน้ำหนักสำหรับ Ensemble

```text
Exact Frequency   × Weight
Digit Position    × Weight
Recent Weighted   × Weight
Balanced Hybrid   × Weight
                       ↓
                 Ensemble Score
                       ↓
                   Top 5
```

การเลือก Top 5 ยังมี Diversity re-ranking แบบเบา ๆ เพื่อไม่ให้ Candidate ทั้งชุดกระจุกอยู่กับรูปแบบเดียวมากเกินไป

> Ensemble score เป็น **Ranking Score** ไม่ใช่โอกาสถูกรางวัล

---

## 🧪 Algorithm Performance

หน้าเว็บสามารถแสดงผล Walk-forward Backtest ของ Algorithm ได้ เช่น

- Ensemble Top-5 Hit Rate
- จำนวนงวดที่ใช้ทดสอบ
- Random Top-5 Baseline
- Best Model
- Hit Rate ของแต่ละ Model
- Ensemble Weight ของแต่ละ Model

สำหรับเลขท้าย 2 ตัวมีค่าที่เป็นไปได้ทั้งหมด 100 ค่า (`00–99`)

หากเลือก Candidate จำนวน 5 ตัว ค่า theoretical random baseline คือประมาณ

```text
5 / 100 = 5%
```

ดังนั้น Performance ของ Algorithm ต้องเปรียบเทียบกับ baseline นี้ ไม่ใช่ดูเพียงจำนวนครั้งที่ทายถูกอย่างเดียว

> Performance ในอดีตไม่ได้รับประกันผลในอนาคต และ Sample Size ที่น้อยสามารถเกิดผลลัพธ์สูง/ต่ำกว่าค่าเฉลี่ยจาก Random Noise ได้

---

## 🎟️ Prediction เลข 6 หลัก

ระบบสร้าง Candidate เลข 6 หลักจำนวน 5 ชุดจากข้อมูลย้อนหลัง

ตัวอย่าง:

```text
257305
804712
231968
576024
109483
```

แต่ละ Candidate จะถูกมองเหมือนสลากจริง 1 ใบ เช่น

```text
257305

เลขเต็ม 6 หลัก : 257305
เลขหน้า 3 ตัว   : 257
เลขท้าย 3 ตัว   : 305
เลขท้าย 2 ตัว   : 05
```

เมื่อผลของงวดถัดไปเข้าระบบ Candidate ที่ถูก Snapshot ไว้จะถูกตรวจอัตโนมัติกับรางวัลที่เกี่ยวข้องทั้งหมด

- รางวัลเลขเต็ม 6 หลัก
- เลขหน้า 3 ตัว
- เลขท้าย 3 ตัว
- เลขท้าย 2 ตัว

ผลจะถูกบันทึกไว้ใน **Prediction Audit**

### Algorithm เลข 6 หลัก

ปัจจุบันใช้แนวทาง Coverage + Diversity v2 ภายในระบบ โดยพิจารณาจาก

- Digit position ของรางวัลที่ 1
- Adjacent digit pair
- สถิติเลขหน้า 3 ตัว
- สถิติเลขท้าย 3 ตัว
- สถิติเลขท้าย 2 ตัว
- Recency weighting
- Candidate diversification

ระบบไม่ใช้ Random ในการสร้าง Candidate

---

## 📋 Prediction Audit

Prediction ทุกชุดจะถูกบันทึกเป็น Snapshot ก่อนผลของงวดถัดไปออก

```text
สร้าง Prediction
       ↓
Status = OPEN
       ↓
รอผลสลากงวดถัดไป
       ↓
ตรวจ Candidate กับผลจริง
       ↓
Status = CLOSED
       ↓
บันทึก Hit / Miss
       ↓
สร้าง Snapshot ใหม่
```

ระบบจะไม่คำนวณ Prediction หลังเห็นผลแล้วนำกลับมาอ้างว่าเป็น Prediction ก่อนหน้า

หน้า History แสดงสถานะด้วยสี

- 🟢 **ถูกรางวัล**
- ⚪ **ไม่ตรง**

ทำให้ตรวจสอบย้อนหลังได้ว่า Algorithm เคยทำงานอย่างไรจริง

---

## 📊 Statistics

รองรับการดูสถิติย้อนหลัง

- 10 งวด
- 20 งวด
- 50 งวด
- ทั้งหมดที่ระบบมี

ข้อมูลที่แสดง เช่น

- เลขท้าย 2 ตัวที่ออกบ่อย
- เลขท้าย 2 ตัวที่ออกน้อย
- ความถี่ตัวเลข 0–9
- ประวัติผลย้อนหลัง

ระบบสามารถสะสมข้อมูลย้อนหลังมากกว่า 20 งวด และมี History Backfill สำหรับเพิ่มข้อมูลเก่าเข้าสู่ฐานข้อมูล

---

## 🏗️ Architecture

```text
                   ┌──────────────────────┐
                   │  Scheduled Updater   │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Lottery Result Feed │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   Private Backend    │
                   │                      │
                   │ Results              │
                   │ Predictions          │
                   │ Predictions6         │
                   │ SystemLog            │
                   └──────────┬───────────┘
                              │
                         Read-only API
                              │
                              ▼
                   ┌──────────────────────┐
                   │    GitHub Pages      │
                   │                      │
                   │ index.html           │
                   │ style.css            │
                   │ script.js            │
                   │ config.js            │
                   └──────────────────────┘
```

Frontend เป็น Static Website และไม่มีคำสั่ง Sync / Write / Update / Delete ข้อมูลจาก Public Website

---

## 📁 Project Structure

```text
lottery-insight-v5.1/
│
├── github-pages-ready/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── config.js
│
├── PRIVATE-backend/
│   └── Code.gs
│
├── google-apps-script/
│   └── Code.gs
│
├── README.md
└── CODE_REVIEW.md
```

> แนะนำให้อัปโหลดขึ้น Public GitHub เฉพาะไฟล์ใน `github-pages-ready/`

---

## 🚀 Installation

### 1. เตรียม Backend

สร้าง Google Sheet ใหม่หรือใช้ Sheet เดิมของ Lottery Insight

เปิด

```text
Extensions
→ Apps Script
```

นำไฟล์

```text
PRIVATE-backend/Code.gs
```

ไปวางแทน Code เดิม

---

### 2. Setup System

Run Function

```javascript
setupSystem()
```

ครั้งแรกระบบจะสร้าง/ตรวจสอบ Sheet ที่ต้องใช้ เช่น

```text
Results
Predictions
Predictions6
SystemLog
```

รวมถึงทำ Migration ข้อมูลจาก Version ก่อนหน้าเมื่อจำเป็น

---

### 3. Sync ข้อมูล

Run

```javascript
syncLottery()
```

เพื่อตรวจสอบว่าระบบสามารถดึงข้อมูลและสร้าง Prediction ได้สำเร็จ

---

### 4. Install Automation

Run

```javascript
installAutomation()
```

ระบบจะสร้าง Time Trigger สำหรับอัปเดตข้อมูลอัตโนมัติ

---

### 5. Deploy Backend

ไปที่

```text
Deploy
→ New deployment
→ Web app
```

ตั้งค่า

```text
Execute as:
Me

Who has access:
Anyone
```

จากนั้น Deploy และ Copy URL ที่ลงท้ายด้วย

```text
/exec
```

---

### 6. ตั้งค่า Frontend

เปิด

```text
github-pages-ready/config.js
```

ใส่ Backend URL

```javascript
window.APP_CONFIG = {
  DATA_URL: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec",
  DEMO_MODE: false
};
```

> ห้ามใส่ Password, Private Key, OAuth Secret หรือ Secret Token ลงใน `config.js`

---

### 7. Deploy GitHub Pages

Upload ไฟล์ใน

```text
github-pages-ready/
```

ขึ้น GitHub Repository

ไฟล์ที่จำเป็น:

```text
index.html
style.css
script.js
config.js
```

จากนั้นเปิด

```text
Repository
→ Settings
→ Pages
```

และเลือก Branch ที่ต้องการ Publish

---

## 🔄 Upgrade from v5.0

เมื่อ Upgrade เป็น v5.1

1. Replace `Code.gs`
2. Run

```javascript
setupSystem()
```

3. Run

```javascript
syncLottery()
```

4. Deploy Backend เป็น **New Version**
5. Replace GitHub Pages files
6. ตรวจสอบ `DATA_URL` ใน `config.js`

Prediction 2 ตัวที่ยังเป็น Algorithm รุ่นเก่าและมีสถานะ `OPEN` จะถูกเปลี่ยนเป็น

```text
SUPERSEDED
```

จากนั้นระบบจะสร้าง Snapshot ใหม่ด้วย Algorithm v3

ข้อมูลเดิมจะยังคงเก็บไว้เพื่อ Audit

---

## 🗃️ Backend Data

### Results

เก็บข้อมูลผลสลาก เช่น

```text
DrawDate
DisplayName
FirstPrize
Last2
FetchedAt
Source
PrizeJson
PrizeComplete
```

### Predictions

เก็บ Snapshot ของ Prediction เลขท้าย 2 ตัว

### Predictions6

เก็บ Snapshot ของ Candidate เลข 6 หลักและผล Audit

### SystemLog

เก็บ Log ของการทำงาน เช่น

- Sync success
- Backfill
- Algorithm upgrade
- Migration
- Error

---

## 🔐 Security Notes

Public Website ใช้ Backend สำหรับ **Read-only request**

Frontend ไม่สามารถสั่ง

- Sync
- Insert
- Update
- Delete
- Backfill

การแก้ไขข้อมูลและ Scheduled Sync ทำภายใน Private Backend เท่านั้น

อย่างไรก็ตาม URL ที่ Browser เรียกสามารถถูกดูผ่าน Developer Tools ได้ตามธรรมชาติของ Web Application

ดังนั้น:

- อย่าเก็บ Secret ใน Frontend
- อย่าใส่ Credential ใน `config.js`
- อย่า Upload `PRIVATE-backend/` ขึ้น Public Repository
- Public endpoint ควรทำเฉพาะ Read-only operation

---

## 🛠️ Troubleshooting

### หน้าเว็บยังเป็น Version เก่า

ลอง

```text
Ctrl + F5
```

หรือเปิด Private / Incognito Window

GitHub Pages และ Browser อาจ Cache `style.css` และ `script.js` รุ่นเก่า

---

### หน้าเว็บโหลดข้อมูลไม่ได้

ตรวจสอบ

```javascript
DATA_URL
```

ใน `config.js`

และตรวจว่า Backend Deployment เป็น Version ล่าสุด

---

### Prediction ไม่เปลี่ยนหลัง Upgrade

Run

```javascript
setupSystem()
syncLottery()
```

จากนั้นตรวจ `SystemLog`

---

### `RangeError: Invalid time value`

v5.1 รวม Safe Date handling จาก Hotfix ก่อนหน้าแล้ว

หาก Upgrade จาก Version เก่า ให้ Run

```javascript
setupSystem()
```

เพื่อให้ระบบซ่อม Format ของข้อมูลที่ Migration ได้

---

### Candidate แสดง Scientific Notation

ตัวอย่าง

```text
2.57305257302257e+29
```

Version ปัจจุบันเก็บ Candidate 6 หลักเป็น JSON Text และบังคับ Column ที่เกี่ยวข้องเป็น Plain Text แล้ว

หากมี Snapshot เก่าที่เสีย ระบบจะไม่ใช้ Candidate นั้นในการ Prediction ใหม่

---

## 🧠 Development Philosophy

Lottery Insight ไม่ได้พยายามสร้างภาพว่า “สามารถทำนายหวยได้แน่นอน”

แนวทางของ Project คือ

```text
สร้างสมมติฐาน
      ↓
สร้าง Algorithm
      ↓
Backtest แบบไม่เห็นอนาคต
      ↓
เปรียบเทียบกับ Baseline
      ↓
ใช้งานจริง
      ↓
เก็บ Snapshot
      ↓
Audit ผลจริง
      ↓
ปรับ Algorithm
```

Algorithm ใหม่ควรพิสูจน์ว่าทำงานดีกว่า Algorithm เดิมด้วย Out-of-sample Performance ก่อนนำขึ้นใช้งานจริง

---

## 🗺️ Possible Future Features

- Backtest Lab แบบ Interactive
- Algorithm Arena สำหรับปรับ/เปรียบเทียบสูตร
- Prediction performance chart
- Ticket Wallet
- Number Explorer
- Pair / Position Heatmap
- Candidate stability / turnover
- Confidence interval ของ Hit Rate
- Algorithm version comparison
- Export Prediction Audit

---

## ⚠️ Disclaimer

Lottery Insight เป็น Project ทดลองด้านข้อมูลและสถิติ

ผลสลากเป็นเหตุการณ์สุ่ม และผลย้อนหลังไม่สามารถรับประกันผลในอนาคต

ระบบ Prediction, Stat Score, Backtest และ Ensemble Weight ไม่ควรถูกตีความเป็นคำแนะนำในการซื้อสลากหรือการรับประกันผลตอบแทน

สำหรับผลรางวัลและการขึ้นเงินรางวัล กรุณาตรวจสอบกับสำนักงานสลากกินแบ่งรัฐบาลโดยตรง

---

## 👤 Author

**TheLegionZ**

Lottery Insight v5.1  
Personal Statistics Experiment

---

## 📌 Version

```text
Current Version : 5.1
Prediction 2D   : Algorithm v3 — Walk-forward Ensemble
Prediction 6D   : Algorithm v2
Frontend        : GitHub Pages
Update Mode     : Automated
```
