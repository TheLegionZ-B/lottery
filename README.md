# Lottery Insight v5.3.2 — Connection Fix & Code Audit

รุ่นนี้แก้ปัญหาเว็บไซต์ GitHub Pages แสดง **“เชื่อมต่อไม่ได้”** โดยรักษา Algorithm v3, Prediction 6 หลัก, Prize Checker, LotteryChecks Auto News, History และ UI เดิมไว้

## สาเหตุที่ตรวจพบจากแพ็กเกจเดิม

1. `config.js` ใน GitHub Pages v5.3.0 ที่แจกไว้มี `DATA_URL: ''` ตั้งต้น หากอัปโหลดไฟล์ทับตัวที่ตั้งค่าแล้ว เว็บไม่มี URL ให้เรียก Backend
2. `load()` แสดง “เชื่อมต่อไม่ได้” แม้บางกรณีเป็น JavaScript render error หรือ Backend ตอบกลับ HTML ไม่ใช่ JSON
3. สร้าง endpoint dashboard เดิมด้วยการต่อ string `DATA_URL + '?mode=...'` ไม่รองรับ URL ที่มี query string อยู่ก่อน
4. `CacheService.put()` สำหรับ Dashboard ไม่ได้ป้องกันเพดาน **100 KB ต่อรายการ** ของ Apps Script; หาก JSON โตมาก API อาจล้มและส่งเพียง `Service unavailable`
5. `doGet()` ซ่อน Exception ทั้งหมดโดยไม่ได้เขียนรายละเอียดลง `SystemLog` ทำให้วินิจฉัยยาก

## v5.3.2 แก้อะไร

### Frontend
- แสดงกล่องแจ้งปัญหาแบบแยกสาเหตุ: ไม่มี URL, URL ผิด, `/dev`, 403, 404, HTML/Login, API error, render error และ Timeout
- ปุ่ม **ลองอีกครั้ง** และ **ตรวจสอบ Backend** (`?mode=health`)
- ประกอบ URL ด้วย `URL.searchParams` ทั้ง Dashboard และตรวจรางวัล
- แยก API error จาก render error
- เก็บรายละเอียด error ใน Browser Console (F12)
- อัปเดต cache buster เป็น `v5.3.2`
- ไม่มี Demo/Dummy fallback

### Backend
- เพิ่ม `GET ?mode=health` สำหรับเช็กเวอร์ชัน, การตั้งค่า Spreadsheet และชื่อชีตที่จำเป็น (ไม่มีการเปิดเผย Spreadsheet ID)
- เพิ่ม `backendVersion: "5.3.2"` ใน Dashboard
- ข้ามการเก็บ Cache หาก JSON เกิน 85 KB เพื่อไม่ให้ Cache ทำระบบหลักล้ม และจัดการ error จาก Cache อย่างปลอดภัย
- บันทึก `doGet` error เข้า Apps Script Executions / `SystemLog` (ฝั่งเจ้าของเท่านั้น)
- Cache version เปลี่ยนเป็น `dashboard-v532`
- คง Parser v5.3.1, Auto News, Algorithm v3 และ Sheets เดิมทั้งหมด

## อัปเดตแบบที่แนะนำ (ไม่ทับ config.js)

1. สำรอง `Code.gs` และ Google Sheet ก่อน
2. ใช้ `Code.gs` ใน **private-backend.zip** แทนสคริปต์เดิมทั้งหมดใน **Apps Script project เดิม** แล้ว Save
3. **Deploy → Manage deployments → Edit (รูปดินสอ) → Version: New version → Deploy**
4. เปิด URL ที่ Deploy ใน Browser (แนะนำ Incognito):
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?mode=health
   ```
   เมื่อพร้อมจะได้ประมาณ:
   ```json
   {"ok":true,"version":"5.3.2","service":"Lottery Insight","code":"READY","missingSheets":[],"newsSheetsReady":true}
   ```
5. อัปโหลดไฟล์จาก **github-pages-update-only.zip** ไปแทนไฟล์บน GitHub Pages โดย **คง `config.js` ที่ใส่ URL จริงไว้**
6. ถ้า `config.js` เดิมเป็นค่าว่าง ให้เปิดแก้ใน GitHub เป็น:
   ```js
   window.APP_CONFIG = {
     DATA_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
   };
   ```
   อย่าใส่ URL `/dev` หรือ URL หน้า Edit ของ Apps Script
7. `Ctrl + F5` หรือเปิด Incognito เพื่อโหลด JS ใหม่

### ใช้ ZIP แบบ Full GitHub Pages

ไฟล์ **github-pages-full.zip** มี `config.js` ที่ตั้งว่างไว้เพื่อไม่เผยแพร่ URL ของคุณ ต้องใส่ URL เองทุกครั้งก่อนอัปโหลด ทั้งนี้ **ห้ามวาง Password/Private Key ใน `config.js`**

## วิธีแปลผล Health Check

| ค่าที่ได้ | ความหมาย | การแก้ไข |
|---|---|---|
| `ok:true`, `code:READY` | Backend เชื่อม Spreadsheet หลักได้ | เปิด `?mode=dashboard` ต่อ แล้วตรวจ GitHub Config |
| `code:SETUP_REQUIRED` | ยังไม่ได้บันทึก Spreadsheet ID ใน Script Properties | Run `setupSystem()` จาก Apps Script ที่ผูกกับ Sheet (หรือยืนยันว่ากำลังแก้ Script Project เดิม) |
| `code:MISSING_SHEETS` | Sheet หลักบางตัวไม่มี | สำรองข้อมูลก่อนแล้วตรวจชื่อชีตที่หาย |
| `code:SPREADSHEET_ACCESS_ERROR` | Backend เปิด Sheet ไม่ได้ | ตรวจสิทธิ์ Execute as: Me และการอนุญาต Apps Script |
| หน้า Google Login/HTML แทน JSON | ไม่ได้เข้าถึง Web App ที่เปิดสาธารณะ | ตั้ง Execute as: Me, Who has access: Anyone และ Deploy New version |
| `?mode=health` ตอบ Dashboard รุ่นเก่า | Deployment ยังเป็นโค้ดรุ่นก่อน | Manage deployments → Edit → New version |
| `?mode=dashboard` ได้ `{ok:false,code:"BACKEND_ERROR"}` | Error ฝั่ง Backend จริง | ดู Apps Script → Executions และ `SystemLog` |
| Health READY แต่เว็บยังขึ้น Error | `config.js` GitHub ชี้ผิด/Cache/CORS/Render | เปิด `https://<site>/config.js` และกด F12 → Network/Console |

> ถ้ามีข้อมูล Sheet และ Script Properties เดิมอยู่แล้ว **ไม่จำเป็นต้อง Run `setupSystem()` ทุกครั้งที่อัปเดต** การ Run อาจดึงและ backfill ข้อมูลซ้ำโดยไม่จำเป็น

## ข้อจำกัดที่ต้องระบุ

การตรวจครั้งนี้ทำจาก **ไฟล์ v5.3.0 GitHub Pages และ Code.gs v5.3.1 ที่เคยส่งให้** ไม่ใช่การเข้าถึง GitHub Repository หรือ Deployment จริงของคุณ เพราะยังไม่มี URL ของเว็บไซต์/Deployment ในแชต การทดสอบ Backend ทำด้วย Google Apps Script mocks และ Browser จำลอง API response; จึงยังไม่ยืนยันสภาพแวดล้อมเครือข่าย/CORS/สิทธิ์จริงในบัญชีคุณ

## Security

`?mode=health` เปิดเผยเฉพาะเวอร์ชันและสถานะพร้อมใช้ ไม่เผยแพร่ Spreadsheet ID, Script Properties หรือรายละเอียด Exception; `GET` ยังคงเป็น read-only โดยไม่เพิ่ม endpoint สำหรับ Sync หรือเขียนข้อมูลสาธารณะ
