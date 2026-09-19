# 🏆 AlgoOlimp — Dasturlash Musobaqalariga Tayyorgarlik Platformasi

Maktab va litsey o'quvchilarini dasturlash olimpiadalari (IOI, RoboContest, Fan olimpiadalari)ga tayyorlash uchun mo'ljallangan zamonaviy platforma.

Tizim to'liq **Frontend (HTML5, CSS3, JavaScript)** texnologiyalarida yaratilgan, server talab qilmaydi va to'g'ridan-to'g'ri **Netlify** orqali ishlaydi. O'quvchilarning yechimlari esa avtomatik tarzda sizning **Google Sheets (Google Jadval)** faylingizga kelib tushadi.

---

## ✨ Imkoniyatlar

- 🚀 **Server talab qilmaydi:** Netlify va GitHub Pages uchun 100% moslangan.
- 📊 **Google Sheets Integratsiyasi:** O'quvchi kodi, ism-familiyasi, maktabi va vaqti to'g'ridan-to'g'ri jadvalga yoziladi.
- 🎯 **Saralangan Masalalar:**
  - Chiziqli algoritmlar
  - Shart operatorlari (`if-else`)
  - Sikllar (`for`, `while`)
  - Massivlar (Arrays)
  - Satrlar (Strings)
  - Saralash va Qidiruv (Binary Search, Sorting)
- 💻 **Interaktiv Kod Muharriri:**
  - C++ (G++ 17/20) va Python 3 qo'llab-quvvatlanadi.
  - Qator raqamlari, avtomatik `Tab` kiritish, Fast I/O shablonlari.
  - O'quvchining yozgan kodi brauzer xotirasida (`localStorage`) saqlanadi.
- 📚 **Olimpiada Cheat-Sheet:** Musobaqa hukmlari (AC, WA, TLE, MLE, CE, RE) va C++/Python sirlari.
- 🌓 **Qorong'i va Yorug' Rejim:** Zamonaviy va ko'zga yoqimli UI.

---

## 🚀 Netlify'ga GitHub orqali ulash

1. Ushbu loyihani o'zingizning GitHub hisobingizga yuklang (push qiling):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AlgoOlimp platform"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```
2. [Netlify.com](https://www.netlify.com/) ga kiring:
   - **"Add new site"** -> **"Import an existing project"** ni bosing.
   - **"GitHub"** ni tanlang va o'zingiz yaratgan omborni (repository) tanlang.
   - Sozlamalar avtomatik aniqlanadi (`publish directory = .`).
   - **"Deploy site"** tugmasini bosing.
3. Har safar GitHub'ga yangi kod yuklaganingizda, Netlify avtomatik ravishda saytingizni yangilab boradi!

---

## 📊 Google Sheets bilan integratsiya qilish

O'quvchilar yechimlarini o'zingizning Google Jadvalingizga qabul qilish uchun [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) faylidagi qisqa yo'riqnomani bajaring.
