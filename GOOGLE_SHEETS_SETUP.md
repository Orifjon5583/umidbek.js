# 📊 Sizning Google Sheets Jadvalingiz bilan Bog'lash Qo'llanmasi

Siz taqdim etgan Google Jadval havolasi:
👉 **[Sizning Jadvalingiz](https://docs.google.com/spreadsheets/d/1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg/edit?usp=sharing)**

Ushbu jadval **o'quvchilarga mutlaqo ko'rinmaydi**. O'quvchi saytda faqat masalani ko'radi va kodini topshiradi. Uning yozgan kodi to'g'ridan-to'g'ri sizning jadvalingizga kelib tushadi.

---

## 🛠 Jadvalni 2 daqiqada faollashtirish (Qadamma-qadam):

### 1-Qadam: Jadvalga sarlavhalarni yozing
Jadvalingizning 1-qatoriga quyidagi 10 ta ustun nomini yozib qo'ying:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **Sana va Vaqt** | **O'quvchi Ismi** | **Maktab va Sinf** | **Masala ID** | **Masala Nomi** | **Mavzu** | **Dasturlash Tili** | **Yechim Kodi** | **Izoh** | **Holat** |

---

### 2-Qadam: Apps Script kodini joylashtiring
1. [Sizning Jadvalingiz](https://docs.google.com/spreadsheets/d/1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg/edit?usp=sharing) ga kiring.
2. Yuqori menyudan **Kengaytmalar (Extensions / Расширения)** -> **Apps Script** bo'limiga kiring.
3. Eskirgan kodlarni o'chirib, o'rniga quyidagi tayyor kodni qo'ying:

```javascript
function doPost(e) {
  try {
    // Sizning shaxsiy Google Jadvalingiz ID raqami
    var SPREADSHEET_ID = "1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg";
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Yangi yechimni jadvalga qator qilib qo'shish
    sheet.appendRow([
      data.dateFormatted || new Date().toLocaleString("uz-UZ"),
      data.studentName || "Noma'lum",
      data.school || "Noma'lum",
      data.problemId || "-",
      data.problemTitle || "-",
      data.topic || "-",
      data.language || "-",
      data.code || "-",
      data.note || "-",
      data.status || "Topshirildi"
    ]);

    // Kod ustunini chiroyli ko'rsatish
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 8).setWrap(true);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("AlgoOlimp Google Sheets qabul qiluvchisi ishlamoqda!");
}
```

4. Saqlash tugmasini bosing (**Ctrl + S**).

---

### 3-Qadam: Web App sifatida ishga tushirish (Deploy)
1. O'ng yuqori burchakdagi ko'k **Deploy (Внедрить)** tugmasini bosing -> **New deployment** ni tanlang.
2. Chapdagi tishli g'ildirak belgisidan **Web app** ni tanlang:
   - **Execute as:** `Me` (mening nomimdan)
   - **Who has access:** `Anyone` (Hamma / Все) — *shunda o'quvchilar login qilmasdan yubora oladi*.
3. **Deploy** tugmasini bosing va Google so'ragan ruxsatni bering (**Advanced** -> **Go to (unsafe)** -> **Allow**).
4. Ekranda hosil bo'lgan **Web app URL** havolasini nusxalab oling (masalan: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### 4-Qadam: Web App URL ni menga yuboring yoki `js/app.js` ga qo'ying
O'sha chiqqan `https://script.google.com/macros/s/.../exec` havolani shu yerga chatga tashlasangiz, men uni sayt ichiga bir marta ulab, GitHub'ga push qilib qo'yaman.

Shundan so'ng, saytda hech qanday sozlama tugmasi ko'rinmaydi, o'quvchilar jadvalingiz borligini ham bilishmaydi, lekin ular yozgan har bitta kod to'g'ridan-to'g'ri sizning jadvalingizga tushaveradi!
