# 📊 Sizning Google Sheets Jadvalingiz uchun Google Apps Script Kodi

Siz taqdim etgan Google Jadval:
👉 **[Sizning Jadvalingiz (1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg)](https://docs.google.com/spreadsheets/d/1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg/edit?usp=sharing)**

Ushbu jadval **o'quvchilarga ko'rinmaydi**. O'quvchi saytga kirganda ism-familiyasi va maktabini kiritadi. Topshiriqni yechib **"Yechimni Topshirish"** tugmasini bosganda, kodi va test xulosasi avtomatik tarzda sizning jadvalingizga tushadi.

---

## 📋 1-Qadam: Jadvalingizning 1-qatoriga sarlavhalarni yozing

Jadvalingizning **1-qatoriga (Row 1)** quyidagi 9 ta ustun nomlarini yozing:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| **Sana va Vaqt** | **O'quvchi Ism Familiyasi** | **Maktab va Sinf** | **Topshiriq (ID va Nomi)** | **Topshiriq Sharti** | **Dasturlash Tili** | **O'quvchi Kodi** | **Tekshirish Xulosasi** | **Izoh** |

---

## 💻 2-Qadam: Google Apps Script Kodini qo'ying

1. [Google Jadvalingiz](https://docs.google.com/spreadsheets/d/1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg/edit?usp=sharing) ga kiring.
2. Yuqori menyudan **Kengaytmalar (Extensions / Расширения)** -> **Apps Script** bo'limiga kiring.
3. Eskirgan barcha kodlarni o'chirib, o'rniga quyidagi kodingizni joylashtiring:

```javascript
function doPost(e) {
  try {
    var SPREADSHEET_ID = "1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg";
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Qator qo'shish (Sana, Ism, Maktab, Topshiriq, Sharti, Til, Kod, Xulosa, Izoh)
    sheet.appendRow([
      data.dateFormatted || new Date().toLocaleString("uz-UZ"),
      data.studentName || "Noma'lum",
      data.school || "Noma'lum",
      (data.problemId ? data.problemId + ": " : "") + (data.problemTitle || ""),
      data.problemStatement || "-",
      data.language || "-",
      data.code || "-",
      data.testVerdict || data.status || "AC (Testlardan o'tdi)",
      data.note || "-"
    ]);

    var lastRow = sheet.getLastRow();
    // Kataklar sig'imini moslash (Wrap Text)
    sheet.getRange(lastRow, 5).setWrap(true); // Topshiriq Sharti
    sheet.getRange(lastRow, 7).setWrap(true); // O'quvchi Kodi
    sheet.getRange(lastRow, 8).setWrap(true); // Tekshirish Xulosasi

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("AlgoOlimp Google Sheets Web App faol ishlamoqda!");
}
```

4. Saqlash tugmasini bosing (**Ctrl + S**).

---

## 🚀 3-Qadam: Web App sifatida ishga tushirish (Deploy)

1. O'ng yuqoridagi ko'k **Deploy (Внедрить)** tugmasini bosing -> **New deployment** ni tanlang.
2. Tishli g'ildirak belgisidan **Web app** ni tanlang:
   - **Execute as:** `Me` (mening nomimdan)
   - **Who has access:** `Anyone` (Hamma / Все)
3. **Deploy** tugmasini bosing va Google so'ragan ruxsatlarni bering (**Advanced** -> **Go to (unsafe)** -> **Allow**).
4. Chiqqan **Web app URL** havolasini (masalan: `https://script.google.com/macros/s/.../exec`) nusxalab menga chatga yuboring!
