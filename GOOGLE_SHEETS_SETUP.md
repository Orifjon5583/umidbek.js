# 📊 Sizning Google Sheets Jadvalingiz bilan Bog'lash Qo'llanmasi

Siz taqdim etgan Google Jadval havolasi:
👉 **[Sizning Jadvalingiz](https://docs.google.com/spreadsheets/d/1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg/edit?usp=sharing)**

Ushbu jadval **o'quvchilarga mutlaqo ko'rinmaydi**. O'quvchi saytga kirganda ism-familiyasi va maktabini kiritadi. Topshirgan har bir yechimi (vaqt, masala nomi, masala sharti, kodi va kodni tekshirish xulosasi) avtomatik ravishda jadvalingizga kelib tushadi.

---

## 🛠 Jadvalni 2 daqiqada faollashtirish (Qadamma-qadam):

### 1-Qadam: Jadvalga sarlavhalarni yozing
Jadvalingizning 1-qatoriga quyidagi 9 ta ustun nomini yozib qo'ying:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| **Sana va Vaqt** | **O'quvchi Ism Familiyasi** | **Maktab va Sinf** | **Masala ID va Nomi** | **Topshiriq Sharti** | **Dasturlash Tili** | **O'quvchi Kodi** | **Kodni Tekshirish Xulosasi** | **Izoh** |

---

### 2-Qadam: Apps Script kodini joylashtiring
1. [Sizning Jadvalingiz](https://docs.google.com/spreadsheets/d/1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg/edit?usp=sharing) ga kiring.
2. Yuqori menyudan **Kengaytmalar (Extensions / Расширения)** -> **Apps Script** bo'limiga kiring.
3. Eskirgan kodlarni o'chirib, o'rniga quyidagi tayyor kodni qo'ying:

```javascript
function doPost(e) {
  try {
    var SPREADSHEET_ID = "1UzfTgjN47KEItinomUqdnz89CQ9N6Oq7nXIGrpJJEXg";
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Yangi yechimni jadvalga qator qilib qo'shish
    sheet.appendRow([
      data.dateFormatted || new Date().toLocaleString("uz-UZ"),
      data.studentName || "Noma'lum",
      data.school || "Noma'lum",
      (data.problemId ? data.problemId + ": " : "") + (data.problemTitle || ""),
      data.problemStatement || "-",
      data.language || "-",
      data.code || "-",
      data.testVerdict || "AC (Barcha testlardan o'tdi)",
      data.note || "-"
    ]);

    // Topshiriq sharti, Kod va Xulosa ustunlarini matnini qatorma-qator qilib moslash (wrap)
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 5).setWrap(true);
    sheet.getRange(lastRow, 7).setWrap(true);
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

### 4-Qadam: Web App URL ni menga yuboring
O'sha chiqqan `https://script.google.com/macros/s/.../exec` havolani shu yerga chatga tashlasangiz, men uni sayt ichiga bir marta ulab, GitHub'ga push qilib qo'yaman.

Shundan so'ng, saytda hech qanday sozlama tugmasi ko'rinmaydi, o'quvchilar jadvalingiz borligini ham bilishmaydi, lekin ular yozgan har bitta kod va tekshiruv xulosasi to'g'ridan-to'g'ri sizning jadvalingizga tushaveradi!
