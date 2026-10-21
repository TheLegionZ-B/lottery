# Lottery Insight v4.8

## UI
The latest-result card now uses its empty space to show:
- front 3-digit prize numbers
- back 3-digit prize numbers
- first-prize adjacent numbers when the source provides them
- prize amount labels when available

## 6-digit prediction
Each six-digit candidate now visibly shows:
- first 3 digits
- last 3 digits
- last 2 digits

Example:
`257305 → หน้า 257 · ท้าย 305 · ท้าย 2 ตัว 05`

When the next complete draw arrives, the stored candidate is checked against all supported prize categories. This includes:
- full six-digit prizes
- front 3 digits
- back 3 digits
- last 2 digits

The existing Predictions6 audit stores the actual matched prize names.

## Upgrade
1. Replace Code.gs with the v4.8 private backend.
2. Run setupSystem() once.
3. Run syncLottery() once.
4. Deploy a New Version of the Apps Script Web App.
5. Replace GitHub Pages files with v4.8 and keep your DATA_URL.

No Sheet deletion is required.
