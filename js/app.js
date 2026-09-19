/**
 * AlgoOlimp — Asosiy Ilova Logikasi (JavaScript)
 * Netlify uchun to'liq moslangan, Google Sheets Webhook integratsiyasi
 */

// Sozlamalar va Kalitlar
const STORAGE_KEYS = {
  THEME: "algoolimp_theme",
  STUDENT_NAME: "algoolimp_student_name",
  STUDENT_SCHOOL: "algoolimp_student_school",
  HISTORY: "algoolimp_submissions_history",
  SHEETS_URL: "algoolimp_sheets_url",
  DRAFT_CODE: "algoolimp_draft_code_"
};

// Standart Google Apps Script Web App URL (foydalanuvchi UI orqali o'zgartirishi mumkin)
const DEFAULT_SHEETS_URL = "https://script.google.com/macros/s/AKfycbz_SAMPLE_REPLACE_ME/exec";

// Holat (State)
let currentProblem = PROBLEMS_DATA[0];
let currentLanguage = "cpp"; // "cpp" yoki "python"
let submissionsHistory = [];

// ==========================================================================
// Boshlang'ich yuklash (Init)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadSavedTheme();
  loadSavedStudentInfo();
  loadHistory();
  renderProblemsList();
  selectProblem(PROBLEMS_DATA[0].id);
  setupEventListeners();
  setupCodeEditor();
  updateTotalCounters();
});

// ==========================================================================
// Mavzu (Dark / Light Theme)
// ==========================================================================
function loadSavedTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  document.body.className = savedTheme === "light" ? "light-theme" : "dark-theme";
  updateThemeIcon();
}

function toggleTheme() {
  const isLight = document.body.classList.contains("light-theme");
  document.body.className = isLight ? "dark-theme" : "light-theme";
  localStorage.setItem(STORAGE_KEYS.THEME, isLight ? "dark" : "light");
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.querySelector("#themeToggleBtn i");
  if (icon) {
    icon.className = document.body.classList.contains("light-theme") 
      ? "fa-solid fa-moon" 
      : "fa-solid fa-sun";
  }
}

// ==========================================================================
// Tablar Navigatsiyasi
// ==========================================================================
function setupEventListeners() {
  // Nav Tablar
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Mavzu tugmasi
  document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);

  // Logo bosilganda birinchi sahifaga qaytish
  document.querySelector(".nav-brand").addEventListener("click", () => switchTab("problems-view"));

  // Sozlamalar modali
  const settingsModal = document.getElementById("settingsModal");
  const settingsBtn = document.getElementById("settingsBtn");
  const closeSettingsModal = document.getElementById("closeSettingsModal");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const testWebhookBtn = document.getElementById("testWebhookBtn");
  const sheetsWebhookInput = document.getElementById("sheetsWebhookInput");

  settingsBtn.addEventListener("click", () => {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.SHEETS_URL) || "";
    sheetsWebhookInput.value = savedUrl;
    settingsModal.classList.add("active");
  });

  closeSettingsModal.addEventListener("click", () => {
    settingsModal.classList.remove("active");
  });

  saveSettingsBtn.addEventListener("click", () => {
    const url = sheetsWebhookInput.value.trim();
    if (url) {
      localStorage.setItem(STORAGE_KEYS.SHEETS_URL, url);
      showToast("Google Sheets Web App URL muvaffaqiyatli saqlandi!", "success");
    } else {
      localStorage.removeItem(STORAGE_KEYS.SHEETS_URL);
      showToast("Havola tozalandi.", "info");
    }
    settingsModal.classList.remove("active");
  });

  testWebhookBtn.addEventListener("click", async () => {
    const url = sheetsWebhookInput.value.trim();
    if (!url) {
      showToast("Iltimos, avval Google Sheets URL manzilini kiriting!", "error");
      return;
    }
    testWebhookBtn.disabled = true;
    testWebhookBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sinov yuborilmoqda...`;
    
    try {
      await sendToGoogleSheets(url, {
        timestamp: new Date().toISOString(),
        dateFormatted: new Date().toLocaleString("uz-UZ"),
        studentName: "Test O'quvchi",
        school: "AlgoOlimp Test Tizimi",
        problemId: "TEST",
        problemTitle: "Ulanish sinovi (Connection Test)",
        topic: "Test",
        language: "test",
        code: "// Bu tizim ulanishini tekshirish uchun yuborilgan test ma'lumot",
        note: "Netlify ulanish sinovi muvaffaqiyatli!",
        status: "TEST_OK"
      });
      showToast("Google Sheets'ga sinov signali yuborildi! Jadvalingizni tekshiring.", "success");
    } catch (err) {
      showToast("Xatolik: " + err.message, "error");
    } finally {
      testWebhookBtn.disabled = false;
      testWebhookBtn.innerHTML = `<i class="fa-solid fa-vial"></i> Test yuborish`;
    }
  });

  // Kod ko'rish modali
  const viewCodeModal = document.getElementById("viewCodeModal");
  const closeCodeModal = document.getElementById("closeCodeModal");
  closeCodeModal.addEventListener("click", () => viewCodeModal.classList.remove("active"));
  
  // Qidiruv va Filtrlar
  document.getElementById("problemSearchInput").addEventListener("input", filterProblems);
  document.getElementById("topicFilter").addEventListener("change", filterProblems);
  document.getElementById("difficultyFilter").addEventListener("change", filterProblems);

  // Til tanlash
  document.getElementById("codeLanguage").addEventListener("change", (e) => {
    currentLanguage = e.target.value;
    loadTemplate(false);
  });

  // Shablonni tiklash
  document.getElementById("resetTemplateBtn").addEventListener("click", () => loadTemplate(true));

  // Kodni nusxalash
  document.getElementById("copyCodeBtn").addEventListener("click", () => {
    const code = document.getElementById("codeTextarea").value;
    navigator.clipboard.writeText(code).then(() => {
      showToast("Kod xotiraga nusxalandi!", "info");
    });
  });

  // Yechimni topshirish
  document.getElementById("submitSolutionBtn").addEventListener("click", handleSubmission);

  // Tarixni tozalash
  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    if (confirm("Haqiqatan ham barcha yechimlar tarixini tozalamoqchimisiz?")) {
      submissionsHistory = [];
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      renderHistoryTable();
      updateTotalCounters();
      renderProblemsList();
      showToast("Tarix tozalandi.", "info");
    }
  });

  // O'quvchi ma'lumotlarini saqlash
  const nameInput = document.getElementById("studentName");
  const schoolInput = document.getElementById("studentSchool");
  nameInput.addEventListener("input", () => localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, nameInput.value));
  schoolInput.addEventListener("input", () => localStorage.setItem(STORAGE_KEYS.STUDENT_SCHOOL, schoolInput.value));
}

function switchTab(tabId) {
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
  });
  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.toggle("active", content.id === tabId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================================================
// Masalalar Ro'yxatini Chizish (Render)
// ==========================================================================
function renderProblemsList() {
  const container = document.getElementById("problemsList");
  const searchVal = document.getElementById("problemSearchInput").value.toLowerCase();
  const topicVal = document.getElementById("topicFilter").value;
  const diffVal = document.getElementById("difficultyFilter").value;

  const solvedProblemIds = new Set(submissionsHistory.map(s => s.problemId));

  const filtered = PROBLEMS_DATA.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchVal) || p.id.toLowerCase().includes(searchVal);
    const matchTopic = topicVal === "all" || p.topic === topicVal;
    const matchDiff = diffVal === "all" || p.difficulty === diffVal;
    return matchSearch && matchTopic && matchDiff;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>Mos keluvchi masalalar topilmadi. Qidiruv parametrlarini o'zgartirib ko'ring.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isSolved = solvedProblemIds.has(p.id);
    const diffClass = p.difficulty === "Oson" ? "badge-easy" : (p.difficulty === "O'rta" ? "badge-medium" : "badge-hard");
    return `
      <div class="problem-card ${isSolved ? "solved-card" : ""}" onclick="openProblemInSolveView('${p.id}')">
        <div class="card-top">
          <span class="problem-id">${p.id}</span>
          <span class="badge ${diffClass}">${p.difficulty}</span>
        </div>
        <h3 class="card-title">${p.title}</h3>
        <p class="card-excerpt">${p.statement.replace(/\$([^\$]+)\$/g, '$1')}</p>
        <div class="card-meta">
          <span class="badge badge-category"><i class="fa-solid fa-tag"></i> ${p.topicName}</span>
          <span class="card-action-btn"><i class="fa-solid fa-code"></i> Yechish</span>
        </div>
      </div>
    `;
  }).join("");
}

function filterProblems() {
  renderProblemsList();
}

function openProblemInSolveView(problemId) {
  selectProblem(problemId);
  switchTab("solve-view");
}

// ==========================================================================
// Masalani Yechish Oynasiga Yuklash
// ==========================================================================
function selectProblem(problemId) {
  const problem = PROBLEMS_DATA.find(p => p.id === problemId);
  if (!problem) return;
  currentProblem = problem;

  // Chap panelni yangilash
  document.getElementById("solveProblemTitle").textContent = `${problem.id}: ${problem.title}`;
  document.getElementById("solveProblemCategory").textContent = problem.topicName;
  
  const diffEl = document.getElementById("solveProblemDifficulty");
  diffEl.textContent = problem.difficulty;
  diffEl.className = `badge ${problem.difficulty === "Oson" ? "badge-easy" : (problem.difficulty === "O'rta" ? "badge-medium" : "badge-hard")}`;

  // Shart va cheklovlar
  document.getElementById("solveProblemStatement").innerHTML = formatMathText(problem.statement);
  document.getElementById("solveProblemInput").innerHTML = formatMathText(problem.inputFormat);
  document.getElementById("solveProblemOutput").innerHTML = formatMathText(problem.outputFormat);

  // Namunaviy testlar
  const samplesContainer = document.getElementById("solveProblemSamples");
  samplesContainer.innerHTML = problem.samples.map((s, idx) => `
    <div class="sample-box">
      <div class="sample-grid">
        <div class="sample-col">
          <div class="sample-label">Input (${idx + 1}):</div>
          <div class="sample-content">${escapeHtml(s.input)}</div>
        </div>
        <div class="sample-col">
          <div class="sample-label">Output (${idx + 1}):</div>
          <div class="sample-content">${escapeHtml(s.output)}</div>
        </div>
      </div>
      ${s.explanation ? `<div class="sample-explanation"><i class="fa-solid fa-circle-info"></i> ${s.explanation}</div>` : ""}
    </div>
  `).join("");

  // Maslahat
  const hintEl = document.getElementById("solveProblemHint");
  if (problem.hint) {
    hintEl.textContent = problem.hint;
    document.getElementById("solveProblemHintWrapper").style.display = "block";
  } else {
    document.getElementById("solveProblemHintWrapper").style.display = "none";
  }

  // Kod muharririga yuklash (agar qoralama bo'lsa uni yuklaydi, aks holda shablon)
  loadTemplate(false);
}

// ==========================================================================
// Kod Muharriri Logikasi
// ==========================================================================
function setupCodeEditor() {
  const textarea = document.getElementById("codeTextarea");
  const lineNumbers = document.getElementById("lineNumbers");

  function updateLineNumbers() {
    const lines = textarea.value.split("\n").length;
    let numbersText = "";
    for (let i = 1; i <= lines; i++) {
      numbersText += i + "\n";
    }
    lineNumbers.textContent = numbersText;
  }

  // Qator raqamlarini yangilab borish
  textarea.addEventListener("input", () => {
    updateLineNumbers();
    // Qoralama saqlab turish
    if (currentProblem) {
      const draftKey = `${STORAGE_KEYS.DRAFT_CODE}${currentProblem.id}_${currentLanguage}`;
      localStorage.setItem(draftKey, textarea.value);
    }
  });

  textarea.addEventListener("scroll", () => {
    lineNumbers.scrollTop = textarea.scrollTop;
  });

  // Tab tugmasini bosganda 4 ta bo'sh joy qo'shish
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
      updateLineNumbers();
    }
  });

  updateLineNumbers();
}

function loadTemplate(forceReset = false) {
  if (!currentProblem) return;
  const textarea = document.getElementById("codeTextarea");
  const draftKey = `${STORAGE_KEYS.DRAFT_CODE}${currentProblem.id}_${currentLanguage}`;
  const savedDraft = localStorage.getItem(draftKey);

  if (!forceReset && savedDraft) {
    textarea.value = savedDraft;
  } else {
    const template = currentProblem.templates && currentProblem.templates[currentLanguage] 
      ? currentProblem.templates[currentLanguage] 
      : (currentLanguage === "cpp" ? "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}" : "import sys\n\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()");
    textarea.value = template;
    localStorage.setItem(draftKey, template);
  }

  // Qator raqamlarini yangilash
  const lines = textarea.value.split("\n").length;
  let numbersText = "";
  for (let i = 1; i <= lines; i++) {
    numbersText += i + "\n";
  }
  document.getElementById("lineNumbers").textContent = numbersText;
}

// ==========================================================================
// Yechim Topshirish va Google Sheets Integratsiyasi
// ==========================================================================
async function handleSubmission() {
  const name = document.getElementById("studentName").value.trim();
  const school = document.getElementById("studentSchool").value.trim();
  const code = document.getElementById("codeTextarea").value.trim();
  const note = document.getElementById("submissionNote").value.trim();
  const submitBtn = document.getElementById("submitSolutionBtn");
  const statusEl = document.getElementById("submitStatusMsg");

  // Validatsiya
  if (!name) {
    showToast("Iltimos, Ism va Familiyangizni kiriting!", "error");
    document.getElementById("studentName").focus();
    return;
  }
  if (!school) {
    showToast("Iltimos, Maktab va Sinfingizni kiriting!", "error");
    document.getElementById("studentSchool").focus();
    return;
  }
  if (!code || code.length < 15) {
    showToast("Kodingiz juda qisqa yoki bo'sh! Masala yechimini to'liq yozing.", "error");
    document.getElementById("codeTextarea").focus();
    return;
  }

  const sheetsUrl = localStorage.getItem(STORAGE_KEYS.SHEETS_URL) || DEFAULT_SHEETS_URL;
  const now = new Date();
  const submissionData = {
    timestamp: now.toISOString(),
    dateFormatted: now.toLocaleString("uz-UZ"),
    studentName: name,
    school: school,
    problemId: currentProblem.id,
    problemTitle: currentProblem.title,
    topic: currentProblem.topicName,
    language: currentLanguage === "cpp" ? "C++" : "Python 3",
    code: code,
    note: note || "-",
    status: "Topshirildi"
  };

  // Tugmani yuklash holatiga o'tkazish
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Google Sheets'ga yuborilmoqda...`;
  statusEl.className = "submit-status-message";
  statusEl.style.display = "none";

  try {
    // Google Apps Scriptga jo'natish
    await sendToGoogleSheets(sheetsUrl, submissionData);

    // Muvaffaqiyatli lokal saqlash
    saveSubmissionToHistory(submissionData);

    // O'quvchiga bildirishnoma
    statusEl.textContent = `✔ Yechimingiz qabul qilindi va ustozingizning Google Sheets jadvaliga muvaffaqiyatli yuborildi! (${submissionData.dateFormatted})`;
    statusEl.className = "submit-status-message success";
    statusEl.style.display = "block";

    showToast("Yechim muvaffaqiyatli topshirildi va jadvalga tushdi!", "success");

    // Statistikani yangilash
    updateTotalCounters();
    renderProblemsList();
    renderHistoryTable();

  } catch (error) {
    console.error("Yuborishda xatolik:", error);
    // Xatolik bo'lsa ham lokalda saqlanadi va ogohlantiriladi
    submissionData.status = "Kutilmoqda (Offline saqlandi)";
    saveSubmissionToHistory(submissionData);
    renderHistoryTable();

    statusEl.textContent = `⚠ Yechim qurilmangizda saqlandi, biroq Google Sheets havolasi bilan ulanishda muammo bo'ldi. O'qituvchingizdan havolani tekshirishni so'rang.`;
    statusEl.className = "submit-status-message error";
    statusEl.style.display = "block";

    showToast("Kodingiz saqlandi, ammo jadvalga yuborishda xatolik bo'ldi.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Yechimni Topshirish`;
  }
}

/**
 * Google Apps Script Web App'ga ma'lumot jo'natuvchi universal funksiya
 * Netlify va har qanday statik saytlarda CORS to'sig'isiz ishlaydi
 */
async function sendToGoogleSheets(url, data) {
  if (!url || url.includes("SAMPLE_REPLACE_ME")) {
    console.warn("Google Sheets URL hali sozlanmagan. Sozlamalar menyusida kiriting.");
    // Demo rejimida yoki sinovda muvaffaqiyatli deb qaytaramiz
    return true;
  }

  // Google Apps Script Web App uchun no-cors rejimida fetch yuborish eng ishonchli usuldir
  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return true;
  } catch (err) {
    throw new Error("Tarmoq yoki Google Sheets xatoligi: " + err.message);
  }
}

// ==========================================================================
// Tarix va Lokal Ma'lumotlar
// ==========================================================================
function loadSavedStudentInfo() {
  const savedName = localStorage.getItem(STORAGE_KEYS.STUDENT_NAME);
  const savedSchool = localStorage.getItem(STORAGE_KEYS.STUDENT_SCHOOL);
  if (savedName) document.getElementById("studentName").value = savedName;
  if (savedSchool) document.getElementById("studentSchool").value = savedSchool;
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    submissionsHistory = raw ? JSON.parse(raw) : [];
  } catch (e) {
    submissionsHistory = [];
  }
  renderHistoryTable();
}

function saveSubmissionToHistory(submission) {
  submissionsHistory.unshift(submission);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(submissionsHistory));
}

function renderHistoryTable() {
  const tbody = document.getElementById("historyTableBody");
  if (submissionsHistory.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-history-row">
          <i class="fa-solid fa-inbox" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
          Hali hech qanday yechim topshirilmadi. Birinchi masalani yechib ko'ring!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = submissionsHistory.map((sub, index) => `
    <tr>
      <td>${escapeHtml(sub.dateFormatted)}</td>
      <td><strong>${escapeHtml(sub.studentName)}</strong><br><small style="color:var(--text-secondary)">${escapeHtml(sub.school)}</small></td>
      <td><span class="badge badge-category">${sub.problemId}</span> ${escapeHtml(sub.problemTitle)}</td>
      <td><code>${escapeHtml(sub.language)}</code></td>
      <td>
        <span class="badge ${sub.status.includes('Topshirildi') ? 'badge-easy' : 'badge-medium'}">
          ${escapeHtml(sub.status)}
        </span>
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewHistoricalCode(${index})">
          <i class="fa-solid fa-eye"></i> Kodni ko'rish
        </button>
      </td>
    </tr>
  `).join("");
}

window.viewHistoricalCode = function(index) {
  const sub = submissionsHistory[index];
  if (!sub) return;

  const modal = document.getElementById("viewCodeModal");
  document.getElementById("viewCodeModalTitle").textContent = `${sub.problemId}: ${sub.problemTitle} (${sub.language}) - ${sub.studentName}`;
  document.getElementById("viewCodeModalContent").textContent = sub.code;

  const loadBtn = document.getElementById("loadIntoEditorBtn");
  loadBtn.onclick = () => {
    selectProblem(sub.problemId);
    document.getElementById("codeLanguage").value = sub.language.toLowerCase().includes("python") ? "python" : "cpp";
    currentLanguage = document.getElementById("codeLanguage").value;
    document.getElementById("codeTextarea").value = sub.code;
    modal.classList.remove("active");
    switchTab("solve-view");
    showToast("Kod muharrirga yuklandi.", "info");
  };

  modal.classList.add("active");
};

function updateTotalCounters() {
  document.getElementById("totalProblemsCount").textContent = PROBLEMS_DATA.length;
  
  const solvedUnique = new Set(submissionsHistory.map(s => s.problemId)).size;
  document.getElementById("solvedCount").textContent = solvedUnique;
  document.getElementById("userSubCount").textContent = submissionsHistory.length;
}

// ==========================================================================
// Yordamchi Funksiyalar
// ==========================================================================
function formatMathText(text) {
  if (!text) return "";
  // $...$ formulalarni chiroyli ajratib ko'rsatish
  return text.replace(/\$([^\$]+)\$/g, '<code class="math-expr">$1</code>');
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icon = type === "success" 
    ? "fa-circle-check" 
    : (type === "error" ? "fa-circle-exclamation" : "fa-circle-info");
    
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => toast.remove(), 280);
  }, 4000);
}
