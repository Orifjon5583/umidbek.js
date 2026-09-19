# 📊 Google Sheets va Netlify Integratsiyasi Qo'llanmasi

Ushbu platforma hech qanday backend server talab qilmaydi. O'quvchilar yechgan barcha masalalar va ularning yozgan kodlari bevosita sizning **Google Sheets (Google Jadval)** faylingizga avtomatik tarzda tushadi.

Quyidagi 4 ta oddiy qadamni bajaring:

---

## 1-Qadam: Yangi Google Sheets jadvali oching

1. [Google Drive](https://drive.google.com) yoki [Google Sheets](https://sheets.new) ga kiring.
2. Yangi jadval yarating va nomini masalan **"AlgoOlimp_Natijalar"** deb qo'ying.
3. 1-qatorga (sarlavhalar uchun) quyidagi ustun nomlarini yozing:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **Sana va Vaqt** | **O'quvchi Ismi** | **Maktab va Sinf** | **Masala ID** | **Masala Nomi** | **Mavzu** | **Dasturlash Tili** | **Yechim Kodi** | **Izoh** | **Holat** |

---

## 2-Qadam: Apps Script kodini joylashtirish

1. Google Jadvalingizning yuqori menyusidan **Kengaytmalar (Расширения / Extensions)** -> **Apps Script** bo'limiga kiring.
2. Ochilgan kod tahrirlagichidagi barcha eski kodni o'chirib, o'rniga quyidagi tayyor kodni to'liq nusxalab qo'ying:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // Yangi qatorga ma'lumotlarni qo'shish
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

    // Formatlash: kod ustunini to'g'ri ko'rinishda saqlash
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 8).setWrap(true);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "row": lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Brauzer orqali tekshirish uchun GET funksiyasi
function doGet(e) {
  return ContentService.createTextOutput("AlgoOlimp Google Sheets Web App faol ishlamoqda!");
}
```

3. Yuqoridagi **Saqlash (дискета / Save)** tugmasini bosing (Ctrl + S).

---

## 3-Qadam: Web App sifatida ishga tushirish (Deploy)

1. O'ng yuqori burchakdagi ko'k **Deploy (Внедрить)** tugmasini bosing -> **New deployment (Новое развертывание)** ni tanlang.
2. Chapdagi tishli g'ildirak (sozlama) belgisini bosib, **Web app (Веб-приложение)** turini tanlang.
3. Quyidagi parametrlarni o'rnating:
   - **Description:** `AlgoOlimp Submissions`
   - **Execute as:** `Me (mening nomimdan)`
   - **Who has access:** `Anyone (Hamma / Все)` — *(DIQQAT: Bu yerda albatta "Anyone" tanlanishi shart, shunda o'quvchilar login qilmasdan ham kodi jadvalga tushadi)*.
4. **Deploy** tugmasini bosing.
5. Google sizdan ruxsat (Authorize access) so'raydi:
   - O'z Google profilingizni tanlang.
   - *"Google hasn't verified this app"* chiqsa, pastdagi **Advanced** -> **Go to (unsafe)** ni bosing.
   - **Allow (Разрешить)** tugmasini bosing.
6. Ekranda **Web app URL** chiqadi (masalan: `https://script.google.com/macros/s/AKfycb.../exec`). Ushbu havolani **Copy** qilib oling!

---

## 4-Qadam: Saytga ulash

Sizda 2 xil qulay usul bor:

### Variant A (Sayt interfeysining o'zidan - eng osoni):
1. Saytni oching (yoki Netlify'ga yuklagandan keyin).
2. Yuqoridagi o'ng burchakdagi **⚙ Sozlamalar (Tishli g'ildirak)** tugmasini bosing.
3. O'zingiz nusxalagan Google Web App havolasini qo'ying va **"Saqlash"** ni bosing.
4. **"Test yuborish"** tugmasini bossangiz, jadvalingizga avtomatik sinov qatori tushadi!

### Variant B (Kodni o'zida doimiy qilib qo'yish):
`js/app.js` faylining 17-qatoridagi:
```javascript
const DEFAULT_SHEETS_URL = "https://script.google.com/macros/s/AKfycbz_SAMPLE_REPLACE_ME/exec";
```
qatoriga o'zingizning havolangizni qo'yib qo'ysangiz, har qanday foydalanuvchi kirganda avtomatik shu havola orqali ishlaydi.

---

## 🚀 Netlify'ga joylashtirish (Deploy) bo'yicha yo'riqnoma

1. [https://www.netlify.com/](https://www.netlify.com/) ga kiring va ro'yxatdan o'ting.
2. Bosh sahifada **"Add new site"** -> **"Deploy manually"** bo'limiga kiring.
3. Ushbu papkani (ichida `index.html`, `css`, `js` bo'lgan butun jildni) shunchaki sichqoncha bilan ushlab Netlify oynasiga tashlang (Drag & Drop).
4. Bir necha soniyada saytingiz butun dunyo bo'ylab bepul internet domenida (masalan, `algoolimp.netlify.app`) ishga tushadi!
