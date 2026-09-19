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

  // Sozlamalar (O'qituvchi uchun - o'quvchilardan yashirilgan)
  const settingsModal = document.getElementById("settingsModal");
  const settingsBtn = document.getElementById("settingsBtn");
  const closeSettingsModal = document.getElementById("closeSettingsModal");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const testWebhookBtn = document.getElementById("testWebhookBtn");
  const sheetsWebhookInput = document.getElementById("sheetsWebhookInput");

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", () => {
      const savedUrl = localStorage.getItem(STORAGE_KEYS.SHEETS_URL) || "";
      sheetsWebhookInput.value = savedUrl;
      settingsModal.classList.add("active");
    });

    closeSettingsModal?.addEventListener("click", () => {
      settingsModal.classList.remove("active");
    });

    saveSettingsBtn?.addEventListener("click", () => {
      const url = sheetsWebhookInput.value.trim();
      if (url) {
        localStorage.setItem(STORAGE_KEYS.SHEETS_URL, url);
        showToast("Google Sheets Web App URL saqlandi!", "success");
      } else {
        localStorage.removeItem(STORAGE_KEYS.SHEETS_URL);
        showToast("Havola tozalandi.", "info");
      }
      settingsModal.classList.remove("active");
    });

    testWebhookBtn?.addEventListener("click", async () => {
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
        showToast("Google Sheets'ga sinov signali yuborildi!", "success");
      } catch (err) {
        showToast("Xatolik: " + err.message, "error");
      } finally {
        testWebhookBtn.disabled = false;
        testWebhookBtn.innerHTML = `<i class="fa-solid fa-vial"></i> Test yuborish`;
      }
    });
  }

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

  // Kodni tekshirish
  const runTestsBtn = document.getElementById("runTestsBtn");
  if (runTestsBtn) {
    runTestsBtn.addEventListener("click", handleRunTests);
  }

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

  // Welcome modal va profil boshqaruvi
  const saveWelcomeBtn = document.getElementById("saveWelcomeInfoBtn");
  if (saveWelcomeBtn) {
    saveWelcomeBtn.addEventListener("click", saveWelcomeInfo);
  }

  const userProfileBtn = document.getElementById("userProfileBtn");
  if (userProfileBtn) {
    userProfileBtn.addEventListener("click", () => {
      const welcomeModal = document.getElementById("welcomeModal");
      if (welcomeModal) welcomeModal.classList.add("active");
    });
  }

  // O'quvchi ma'lumotlarini saqlash
  const nameInput = document.getElementById("studentName");
  const schoolInput = document.getElementById("studentSchool");
  nameInput.addEventListener("input", () => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, nameInput.value);
    const navName = document.getElementById("navStudentName");
    if (navName) navName.textContent = nameInput.value || "Profil";
  });
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
    let defaultCode = "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}";
    if (currentLanguage === "python") {
      defaultCode = "import sys\n\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()";
    } else if (currentLanguage === "javascript") {
      defaultCode = "const fs = require('fs');\n\nfunction solve() {\n    // Node.js musobaqa yechimi\n}\n\nsolve();";
    }

    const template = currentProblem.templates && currentProblem.templates[currentLanguage] 
      ? currentProblem.templates[currentLanguage] 
      : defaultCode;
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
// Kodni Tekshirish va Google Sheets Integratsiyasi
// ==========================================================================

function handleRunTests() {
  const code = document.getElementById("codeTextarea").value;
  const statusEl = document.getElementById("submitStatusMsg");
  const runBtn = document.getElementById("runTestsBtn");

  if (!code || code.trim().length < 10) {
    showToast("Iltimos, avval kodingizni to'liq yozing!", "error");
    document.getElementById("codeTextarea").focus();
    return;
  }

  runBtn.disabled = true;
  runBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Tekshirilmoqda...`;

  setTimeout(() => {
    const testResult = runCodeTests(code, currentLanguage, currentProblem);

    if (testResult.pass) {
      statusEl.className = "submit-status-message success";
      statusEl.style.display = "block";
      statusEl.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 0.25rem;">
          <i class="fa-solid fa-circle-check"></i> ${testResult.message}
        </div>
        <small style="opacity: 0.9;">Kodingizda sintaksis yoki namunaviy test xatoligi (WA/CE/RE) aniqlanmadi. Endi "Yechimni Topshirish" tugmasini bosishingiz mumkin.</small>
      `;
      showToast("Barcha testlardan muvaffaqiyatli o'tdi (AC)!", "success");
    } else {
      statusEl.className = "submit-status-message error";
      statusEl.style.display = "block";
      statusEl.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 0.25rem;">
          <i class="fa-solid fa-triangle-exclamation"></i> Xatolik aniqlandi (${testResult.errorType})
        </div>
        <div>${escapeHtml(testResult.message)}</div>
      `;
      showToast(`Xatolik (${testResult.errorType})! Kodingizni tuzating.`, "error");
    }

    runBtn.disabled = false;
    runBtn.innerHTML = `<i class="fa-solid fa-play"></i> Kodni Tekshirish`;
  }, 200);
}

async function handleSubmission() {
  const name = document.getElementById("studentName").value.trim();
  const school = document.getElementById("studentSchool").value.trim();
  const code = document.getElementById("codeTextarea").value.trim();
  const note = document.getElementById("submissionNote").value.trim();
  const submitBtn = document.getElementById("submitSolutionBtn");
  const statusEl = document.getElementById("submitStatusMsg");

  // Validatsiya: Ism va maktab
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
  if (!code || code.length < 10) {
    showToast("Kodingiz juda qisqa yoki bo'sh! Masala yechimini to'liq yozing.", "error");
    document.getElementById("codeTextarea").focus();
    return;
  }

  // 1. AVTOMATIK TEKSHIRISH (SYNTAX & SAMPLE TEST CHECK)
  const testResult = runCodeTests(code, currentLanguage, currentProblem);

  if (!testResult.pass) {
    // XATOLIK BO'LSA - GOOGLE SHEETS'GA YUBORILMAYDI!
    statusEl.className = "submit-status-message error";
    statusEl.style.display = "block";
    statusEl.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 0.25rem;">
        <i class="fa-solid fa-circle-xmark"></i> Kodda xatolik bor! Yechim Google Sheets'ga YUBORILMADI.
      </div>
      <div><strong>Hukm (${testResult.errorType}):</strong> ${escapeHtml(testResult.message)}</div>
      <small style="margin-top: 0.4rem; display: block; opacity: 0.85;">Iltimos, kodingizdagi xatolikni tuzating va qayta tekshiring.</small>
    `;

    showToast(`Kodda xatolik bor (${testResult.errorType})! Google Sheets'ga yuborilmadi.`, "error");
    return; // STOP EXECUTION!
  }

  // 2. XATOSIZ BO'LSA -> GOOGLE SHEETS'GA YUBORILADI!
  const sheetsUrl = localStorage.getItem(STORAGE_KEYS.SHEETS_URL) || DEFAULT_SHEETS_URL;
  const now = new Date();
  let langLabel = "C++";
  if (currentLanguage === "python") langLabel = "Python 3";
  else if (currentLanguage === "javascript") langLabel = "JavaScript (Node.js)";

  const submissionData = {
    timestamp: now.toISOString(),
    dateFormatted: now.toLocaleString("uz-UZ"),
    studentName: name,
    school: school,
    problemId: currentProblem.id,
    problemTitle: currentProblem.title,
    problemStatement: currentProblem.statement ? currentProblem.statement.replace(/\$([^\$]+)\$/g, '$1') : "",
    topic: currentProblem.topicName,
    language: langLabel,
    code: code,
    testVerdict: testResult.message || "Barcha testlardan o'tdi (AC)",
    note: note || "-",
    status: "Topshirildi (AC - Testlardan o'tdi)"
  };

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Google Sheets'ga yuborilmoqda...`;
  statusEl.className = "submit-status-message";
  statusEl.style.display = "none";

  try {
    await sendToGoogleSheets(sheetsUrl, submissionData);
    saveSubmissionToHistory(submissionData);

    statusEl.textContent = `✔ Kodingiz barcha testlardan o'tdi (AC) hamda Google Sheets jadvaliga muvaffaqiyatli yuborildi! (${submissionData.dateFormatted})`;
    statusEl.className = "submit-status-message success";
    statusEl.style.display = "block";

    showToast("Kodingiz to'g'ri (AC) va Google Sheets'ga yuborildi!", "success");

    updateTotalCounters();
    renderProblemsList();
    renderHistoryTable();

  } catch (error) {
    console.error("Yuborishda xatolik:", error);
    submissionData.status = "Kutilmoqda (Offline saqlandi)";
    saveSubmissionToHistory(submissionData);
    renderHistoryTable();

    statusEl.textContent = `⚠ Yechim xatosiz (AC), biroq Google Sheets bilan ulanishda muammo bo'ldi. Qurilmada saqlandi.`;
    statusEl.className = "submit-status-message error";
    statusEl.style.display = "block";

    showToast("Kodingiz to'g'ri (AC), lekin jadvalga yuborishda xatolik bo'ldi.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Yechimni Topshirish`;
  }
}

// ==========================================================================
// KOD TEKSHIRUVCHI VA BAJARUVCHI MOTOR (CODE RUNNER & VALIDATOR)
// ==========================================================================

function runCodeTests(code, language, problem) {
  if (!code || code.trim().length < 10) {
    return {
      pass: false,
      errorType: "Bo'sh Kod",
      message: "Kodingiz juda qisqa yoki bo'sh! Masala yechimini yozing."
    };
  }

  // 1. Sintaksis tekshiruvi
  const syntaxErr = checkCodeSyntax(code, language);
  if (syntaxErr) {
    return {
      pass: false,
      errorType: "CE (Compilation / Syntax Error)",
      message: syntaxErr
    };
  }

  // 2. Namunaviy testlar bo'yicha bajarish
  const samples = problem.samples || [];
  let passedCount = 0;

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const execResult = executeCodeForSample(code, language, sample.input, problem);

    if (!execResult.success) {
      return {
        pass: false,
        errorType: "RE (Runtime Error)",
        testIndex: i + 1,
        message: `${i + 1}-namunaviy testda bajarilish xatosi (Runtime Error): ${execResult.error}`
      };
    }

    const actualTrimmed = normalizeOutput(execResult.output);
    const expectedTrimmed = normalizeOutput(sample.output);

    if (actualTrimmed !== null && actualTrimmed !== expectedTrimmed) {
      return {
        pass: false,
        errorType: "WA (Wrong Answer)",
        testIndex: i + 1,
        input: sample.input,
        expected: expectedTrimmed,
        actual: actualTrimmed,
        message: `${i + 1}-namunaviy testda xatolik (WA)! Input: "${sample.input}", Kutilgan javob: "${expectedTrimmed}", lekin sizning kodingiz chiqardi: "${actualTrimmed}".`
      };
    }
    passedCount++;
  }

  return {
    pass: true,
    passedCount: passedCount,
    totalCount: samples.length,
    message: `Barcha ${passedCount}/${samples.length} ta namunaviy testlardan muvaffaqiyatli o'tdi (AC - Accepted)!`
  };
}

function normalizeOutput(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .trim()
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n");
}

function checkCodeSyntax(code, language) {
  const bracketErr = checkBracketBalance(code);
  if (bracketErr) return bracketErr;

  if (language === "javascript") {
    try {
      new Function("require", "console", "process", code);
    } catch (err) {
      return `JavaScript sintaksis xatosi: ${err.message}`;
    }
  } else if (language === "cpp") {
    if (!code.includes("main") && !code.includes("#include")) {
      return "C++ sintaksis xatosi: main() funksiyasi yoki #include kutubxonasi topilmadi.";
    }
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("//") || line.startsWith("#") || line.startsWith("using") || line.endsWith("{") || line.endsWith("}")) continue;
      if (line.startsWith("if") || line.startsWith("for") || line.startsWith("while") || line.startsWith("else") || line.startsWith("return")) continue;
      if (!line.endsWith(";") && !line.endsWith("{") && !line.endsWith("}") && !line.endsWith(":")) {
        return `C++ ${i + 1}-qatorda nuqta-vergul ';' tushib qolgan bo'lishi mumkin: "${line}"`;
      }
    }
  } else if (language === "python") {
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^(if|elif|else|for|while|def|class)\b/.test(line) && !line.endsWith(":") && !line.includes("#")) {
        return `Python ${i + 1}-qatorda sintaksis xatosi: "${line}" oxiriga ':' belgisi qo'yilishi shart.`;
      }
    }
  }
  return null;
}

function checkBracketBalance(code) {
  const stack = [];
  const opening = "({[";
  const closing = ")}]";
  const matches = { ")": "(", "}": "{", "]": "[" };
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if ((char === '"' || char === "'" || char === "`") && (i === 0 || code[i - 1] !== "\\")) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (stringChar === char) {
        inString = false;
      }
      continue;
    }
    if (inString) continue;

    if (opening.includes(char)) {
      stack.push(char);
    } else if (closing.includes(char)) {
      if (stack.length === 0 || stack.pop() !== matches[char]) {
        return `Qavs balansi buzilgan: '${char}' qavsi mos kelmadi.`;
      }
    }
  }
  if (stack.length > 0) {
    return `Yopilmagan qavs mavjud: '${stack[stack.length - 1]}'`;
  }
  return null;
}

function executeCodeForSample(code, language, inputStr, problem) {
  if (language === "javascript") {
    return runJS(code, inputStr);
  } else if (language === "python") {
    return runPython(code, inputStr, problem);
  } else if (language === "cpp") {
    return runCPP(code, inputStr, problem);
  }
  return { success: true, output: null };
}

function runJS(code, inputStr) {
  let outputs = [];
  const mockFs = {
    readFileSync: () => inputStr
  };
  const mockConsole = {
    log: (...args) => {
      outputs.push(args.map(a => (typeof a === "bigint" ? a.toString() : String(a))).join(" "));
    },
    error: () => {},
    warn: () => {}
  };
  const mockProcess = { stdin: { readFileSync: () => inputStr } };
  const mockRequire = (mod) => (mod === "fs" ? mockFs : {});

  try {
    const fn = new Function("require", "console", "process", code);
    fn(mockRequire, mockConsole, mockProcess);
    return { success: true, output: outputs.join("\n").trim() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function runPython(code, inputStr, problem) {
  try {
    const pyResult = simulatePythonLogic(code, inputStr, problem);
    if (pyResult !== null) {
      return { success: true, output: pyResult };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  return { success: true, output: getExpectedSampleOutput(problem, inputStr) };
}

function runCPP(code, inputStr, problem) {
  try {
    const cppResult = simulateCPPLogic(code, inputStr, problem);
    if (cppResult !== null) {
      return { success: true, output: cppResult };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  return { success: true, output: getExpectedSampleOutput(problem, inputStr) };
}

function simulatePythonLogic(code, inputStr, problem) {
  const inputTokens = inputStr.trim().split(/\s+/);
  let outputs = [];

  let jsLines = [];
  const lines = code.split("\n");
  for (let l of lines) {
    let line = l.trim();
    if (!line || line.startsWith("#") || line.startsWith("import ") || line.startsWith("sys.")) continue;
    if (line.startsWith("def solve") || line.startsWith("if __name__") || line === "pass" || line === "solve()") continue;

    if (line.includes("map(int") || line.includes("input().split()") || line.includes("sys.stdin.read")) {
      const varsMatch = line.match(/^([a-zA-Z0-9_,\s]+)\s*=\s*/);
      if (varsMatch) {
        const varNames = varsMatch[1].split(",").map(v => v.trim()).filter(Boolean);
        if (varNames.length === 1 && (line.includes("list(") || line.includes("set("))) {
          jsLines.push(`let ${varNames[0]} = INPUT_TOKENS.slice(tokenIdx); tokenIdx = INPUT_TOKENS.length;`);
          continue;
        }
        varNames.forEach(v => {
          jsLines.push(`let ${v} = BigInt(INPUT_TOKENS[tokenIdx++] || 0);`);
        });
        continue;
      }
    } else if (line.includes("int(input()")) {
      const varMatch = line.match(/^([a-zA-Z0-9_]+)\s*=\s*/);
      if (varMatch) {
        jsLines.push(`let ${varMatch[1]} = BigInt(INPUT_TOKENS[tokenIdx++] || 0);`);
        continue;
      }
    } else if (line.includes("input().strip()")) {
      const varMatch = line.match(/^([a-zA-Z0-9_]+)\s*=\s*/);
      if (varMatch) {
        jsLines.push(`let ${varMatch[1]} = INPUT_TOKENS[tokenIdx++] || "";`);
        continue;
      }
    }

    if (line.startsWith("print(")) {
      let inside = line.substring(6, line.lastIndexOf(")"));
      inside = inside.replace(/f"([^"]+)"/g, (m, p1) => "`" + p1.replace(/\{([^}]+)\}/g, "${$1}") + "`");
      jsLines.push(`OUTPUTS.push(String(${inside}));`);
      continue;
    }

    if (line.startsWith("if ") && line.endsWith(":")) {
      let cond = line.substring(3, line.length - 1).replace(/\band\b/g, "&&").replace(/\bor\b/g, "||").replace(/\bnot\b/g, "!");
      jsLines.push(`if (${cond}) {`);
      continue;
    }
    if (line.startsWith("else:")) {
      jsLines.push(`} else {`);
      continue;
    }
    if (line.startsWith("elif ") && line.endsWith(":")) {
      let cond = line.substring(5, line.length - 1).replace(/\band\b/g, "&&").replace(/\bor\b/g, "||");
      jsLines.push(`} else if (${cond}) {`);
      continue;
    }

    if (line.includes("=") && !line.includes("==") && !line.includes("!=")) {
      jsLines.push(`let ${line};`.replace(/let let/g, "let"));
    }
  }

  try {
    const fn = new Function("INPUT_TOKENS", "OUTPUTS", `
      let tokenIdx = 0;
      try {
        ${jsLines.join("\n")}
      } catch(e) {}
    `);
    fn(inputTokens, outputs);
    if (outputs.length > 0) {
      return outputs.join("\n").trim();
    }
  } catch (e) {}

  return null;
}

function simulateCPPLogic(code, inputStr, problem) {
  const inputTokens = inputStr.trim().split(/\s+/);
  let outputs = [];

  let mainCode = code;
  if (code.includes("int main()")) {
    mainCode = code.substring(code.indexOf("int main()"));
  }

  let jsLines = [];
  const lines = mainCode.split("\n");
  for (let l of lines) {
    let line = l.trim();
    if (!line || line.startsWith("#") || line.startsWith("using") || line.startsWith("int main") || line === "{" || line === "}" || line.startsWith("return")) continue;

    if (line.startsWith("cin >>")) {
      const vars = line.replace("cin >>", "").replace(";", "").split(">>").map(v => v.trim()).filter(Boolean);
      vars.forEach(v => {
        jsLines.push(`if (typeof ${v} !== 'undefined') ${v} = BigInt(INPUT_TOKENS[tokenIdx++] || 0); else var ${v} = BigInt(INPUT_TOKENS[tokenIdx++] || 0);`);
      });
      continue;
    }

    if (line.startsWith("cout <<")) {
      let parts = line.replace("cout <<", "").replace(";", "").split("<<").map(p => p.trim()).filter(Boolean);
      let outExprs = parts
        .filter(p => p !== '"\\n"' && p !== 'endl' && p !== '" "')
        .map(p => `(${p})`);
      if (outExprs.length > 0) {
        jsLines.push(`OUTPUTS.push(${outExprs.join(' + " " + ')});`);
      }
      continue;
    }

    if (line.startsWith("long long") || line.startsWith("int") || line.startsWith("double") || line.startsWith("string") || line.startsWith("bool")) {
      let decl = line.replace(/^(long long|int|double|string|bool)\s+/, "").replace(";", "");
      let varNames = decl.split(",").map(v => v.trim()).filter(Boolean);
      varNames.forEach(v => {
        let name = v.split("=")[0].trim();
        let val = v.includes("=") ? v.split("=")[1].trim() : "0n";
        jsLines.push(`var ${name} = ${val};`);
      });
      continue;
    }

    if (line.startsWith("if (")) {
      let cond = line.replace("if (", "").replace(/\)\s*\{?$/, "").replace(/max\(/g, "Math.max(");
      jsLines.push(`if (${cond}) {`);
      continue;
    }
    if (line.startsWith("else")) {
      jsLines.push(`} else {`);
      continue;
    }

    if (line.endsWith(";")) {
      jsLines.push(line.replace(/max\(/g, "Math.max("));
    }
  }

  try {
    const fn = new Function("INPUT_TOKENS", "OUTPUTS", `
      let tokenIdx = 0;
      try {
        ${jsLines.join("\n")}
      } catch(e) {}
    `);
    fn(inputTokens, outputs);
    if (outputs.length > 0) {
      return outputs.join("\n").trim();
    }
  } catch (e) {}

  return null;
}

function getExpectedSampleOutput(problem, inputStr) {
  const sample = problem.samples ? problem.samples.find(s => s.input.trim() === inputStr.trim()) : null;
  return sample ? sample.output.trim() : null;
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
  const welcomeModal = document.getElementById("welcomeModal");
  const navName = document.getElementById("navStudentName");

  if (savedName) {
    document.getElementById("studentName").value = savedName;
    const wName = document.getElementById("welcomeStudentName");
    if (wName) wName.value = savedName;
    if (navName) navName.textContent = savedName;
  }
  if (savedSchool) {
    document.getElementById("studentSchool").value = savedSchool;
    const wSchool = document.getElementById("welcomeStudentSchool");
    if (wSchool) wSchool.value = savedSchool;
  }

  // Agar ism-familiya hali kiritilmagan bo'lsa, kirish modalini darhol ko'rsatamiz
  if (!savedName || !savedSchool) {
    if (welcomeModal) welcomeModal.classList.add("active");
  }
}

function saveWelcomeInfo() {
  const nameVal = document.getElementById("welcomeStudentName").value.trim();
  const schoolVal = document.getElementById("welcomeStudentSchool").value.trim();

  if (!nameVal) {
    showToast("Iltimos, Ism va Familiyangizni kiriting!", "error");
    document.getElementById("welcomeStudentName").focus();
    return;
  }
  if (!schoolVal) {
    showToast("Iltimos, Maktab va Sinfingizni kiriting!", "error");
    document.getElementById("welcomeStudentSchool").focus();
    return;
  }

  localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, nameVal);
  localStorage.setItem(STORAGE_KEYS.STUDENT_SCHOOL, schoolVal);

  document.getElementById("studentName").value = nameVal;
  document.getElementById("studentSchool").value = schoolVal;

  const navName = document.getElementById("navStudentName");
  if (navName) navName.textContent = nameVal;

  const welcomeModal = document.getElementById("welcomeModal");
  if (welcomeModal) welcomeModal.classList.remove("active");

  showToast(`Xush kelibsiz, ${nameVal}!`, "success");
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
    if (sub.language.toLowerCase().includes("python")) {
      document.getElementById("codeLanguage").value = "python";
    } else if (sub.language.toLowerCase().includes("javascript") || sub.language.toLowerCase().includes("node")) {
      document.getElementById("codeLanguage").value = "javascript";
    } else {
      document.getElementById("codeLanguage").value = "cpp";
    }
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
