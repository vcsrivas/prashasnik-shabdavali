/* प्रशासनिक शब्दावली
 * - Reads the word list from the Excel file: column B = Hindi, C = English meaning, D = category.
 * - Picks 6 random words each day (no repeats until the whole list has been shown).
 * - Keeps a day-wise history on the device; tap a word in history to recall its meaning.
 * - English search with live suggestions.
 */
(function () {
  "use strict";

  const EXCEL_FILE = "Official_Hindi_Words_English_Meanings.xlsx";
  const SHEET_NAME = "Glossary";          // falls back to the first sheet
  const COL_HINDI = 1, COL_ENGLISH = 2, COL_CATEGORY = 3;   // columns B, C, D
  const WORDS_PER_DAY = 6;
  const STORE_KEY = "prashasnik-shabdavali:history:v1";
  const MAX_SUGGESTIONS = 8;

  const $ = id => document.getElementById(id);
  const hiDigits = n => String(n).replace(/\d/g, d => "०१२३४५६७८९"[d]);

  let words = [];                 // [{h, e, c}]
  let byHindi = new Map();        // h -> word (current list)
  let history = { days: [] };     // [{date: "YYYY-MM-DD", words: [{h,e,c}]}], newest first

  // ---------- storage (falls back to memory if the browser blocks it) ----------
  let memoryStore = null;
  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) { const h = JSON.parse(raw); if (h && Array.isArray(h.days)) return h; }
    } catch (e) { if (memoryStore) return memoryStore; }
    return { days: [] };
  }
  function saveHistory() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(history)); }
    catch (e) { memoryStore = history; }
  }

  // ---------- dates (device's local calendar day) ----------
  const pad = n => String(n).padStart(2, "0");
  const dateKey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const keyToDate = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmtHi = d => d.toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtEn = d => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  function dayLabel(key) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((today - keyToDate(key)) / 86400000);
    if (diff === 0) return "आज";
    if (diff === 1) return "कल";
    return fmtHi(keyToDate(key));
  }

  // ---------- reading the Excel file ----------
  function rowsToWords(rows) {
    const out = [], seen = new Set();
    rows.slice(1).forEach(r => {                       // row 1 = headings
      const h = (r[COL_HINDI] || "").trim(), e = (r[COL_ENGLISH] || "").trim();
      if (!h || !e || seen.has(h)) return;             // skip blanks and repeated Hindi words
      seen.add(h);
      out.push({ h, e, c: (r[COL_CATEGORY] || "").trim() });
    });
    return out;
  }

  // ---------- picking today's words ----------
  function randomInt(n) {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n;
    }
    return Math.floor(Math.random() * n);
  }
  function pickRandom(pool, n) {
    const arr = pool.slice(), out = [];
    while (out.length < n && arr.length) out.push(arr.splice(randomInt(arr.length), 1)[0]);
    return out;
  }
  function ensureToday() {
    const key = dateKey(new Date());
    if (history.days.some(d => d.date === key)) return;
    const shown = new Set();
    history.days.forEach(d => d.words.forEach(w => shown.add(w.h)));
    let pool = words.filter(w => !shown.has(w.h));
    if (pool.length < WORDS_PER_DAY) {
      // Whole list covered: start a new round (avoid repeating yesterday's words).
      const last = new Set((history.days[0] ? history.days[0].words : []).map(w => w.h));
      pool = words.filter(w => !last.has(w.h));
      if (pool.length < WORDS_PER_DAY) pool = words.slice();
    }
    history.days.unshift({ date: key, words: pickRandom(pool, WORDS_PER_DAY).map(w => ({ h: w.h, e: w.e, c: w.c })) });
    history.days.sort((a, b) => (a.date < b.date ? 1 : -1));
    saveHistory();
  }
  // Prefer the current spreadsheet's meaning (if a word was corrected), else the saved copy.
  const current = w => byHindi.get(w.h) || w;

  // ---------- word card ----------
  function cardEl(word, num) {
    const w = current(word);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML =
      (num ? '<span class="num"></span>' : "") +
      '<h3 class="hindi"></h3>' +
      '<p class="meaning" lang="en"><small>English meaning</small><span></span></p>' +
      '<div class="foot"><span class="tag" lang="en"></span></div>';
    if (num) card.querySelector(".num").textContent = hiDigits(num);
    card.querySelector(".hindi").textContent = w.h;
    card.querySelector(".meaning span").textContent = w.e;
    const tag = card.querySelector(".tag");
    if (w.c) tag.textContent = w.c; else tag.remove();
    if ("speechSynthesis" in window && window.SpeechSynthesisUtterance) {
      const b = document.createElement("button");
      b.className = "speak"; b.type = "button"; b.textContent = "🔊 सुनें"; b.title = "उच्चारण सुनें";
      b.addEventListener("click", () => {
        const u = new SpeechSynthesisUtterance(w.h); u.lang = "hi-IN"; u.rate = 0.85;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      });
      card.querySelector(".foot").appendChild(b);
    }
    return card;
  }

  // ---------- views ----------
  function renderToday() {
    const now = new Date();
    $("todayDate").innerHTML = "";
    $("todayDate").append(fmtHi(now) + " · ");
    const en = document.createElement("span"); en.lang = "en"; en.textContent = fmtEn(now);
    $("todayDate").append(en);
    const box = $("todayCards"); box.innerHTML = "";
    const today = history.days.find(d => d.date === dateKey(now));
    (today ? today.words : []).forEach((w, i) => box.appendChild(cardEl(w, i + 1)));
  }

  function renderHistory() {
    const list = $("historyList"); list.innerHTML = "";
    if (!history.days.length) {
      list.innerHTML = '<p class="empty">अभी इतिहास खाली है।</p>';
      return;
    }
    history.days.forEach(day => {
      const box = document.createElement("section"); box.className = "day";
      const title = document.createElement("div"); title.className = "day-title";
      const t = document.createElement("strong"); t.textContent = dayLabel(day.date);
      const s = document.createElement("span"); s.lang = "en"; s.textContent = fmtEn(keyToDate(day.date));
      title.append(t, s);
      const chips = document.createElement("div"); chips.className = "word-chips";
      day.words.forEach(w => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "word-chip"; b.textContent = w.h;
        b.addEventListener("click", () => openSheet(w, dayLabel(day.date) + " · " + fmtEn(keyToDate(day.date))));
        chips.appendChild(b);
      });
      box.append(title, chips);
      list.appendChild(box);
    });
  }

  function renderAbout() {
    const shown = new Set(); history.days.forEach(d => d.words.forEach(w => shown.add(w.h)));
    $("aboutStats").textContent =
      "शब्द-सूची में कुल " + words.length.toLocaleString("en-IN") + " शब्द · अब तक " +
      history.days.length + " दिनों में " + shown.size + " शब्द देखे गए।";
  }

  // ---------- bottom sheet (word pop-up) ----------
  const sheet = $("sheet");
  function openSheet(word, fromText) {
    const body = $("sheetBody"); body.innerHTML = "";
    if (fromText) { const p = document.createElement("p"); p.className = "sheet-from"; p.textContent = fromText; body.appendChild(p); }
    const card = cardEl(word); card.querySelector(".hindi").id = "sheetWord";
    body.appendChild(card);
    if (sheet.hidden) { sheet.hidden = false; history_push(); }
    sheet.querySelector(".sheet-close").focus();
  }
  function closeSheet(fromPop) {
    if (sheet.hidden) return;
    sheet.hidden = true;
    if (!fromPop && window.history.state && window.history.state.sheet) window.history.back();
  }
  // Opening the sheet adds a browser-history entry, so the phone's Back button closes it.
  function history_push() { try { window.history.pushState({ sheet: 1 }, "", location.hash || "#today"); } catch (e) {} }
  sheet.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeSheet(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
  window.addEventListener("popstate", () => closeSheet(true));

  // ---------- tabs ----------
  const TABS = ["today", "history", "search", "about"];
  function showTab() {
    const tab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "today";
    TABS.forEach(t => { $("view-" + t).hidden = t !== tab; });
    document.querySelectorAll(".tab-bar a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
    if (tab === "history") renderHistory();
    if (tab === "about") renderAbout();
    if (tab === "search") setTimeout(() => $("searchInput").focus(), 50);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", () => { closeSheet(true); showTab(); });

  // ---------- English search with suggestions ----------
  const input = $("searchInput"), sugg = $("suggestions");
  const isDevanagari = s => /[ऀ-ॿ]/.test(s);
  const norm = s => s.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();
  let senses = [], fullText = [];
  function indexWords() {
    senses = words.map(w => w.e.split(";").map(s => norm(s.replace(/\(.*?\)/g, " "))).filter(Boolean));
    fullText = words.map(w => norm(w.e));
  }
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function scoreEnglish(i, q) {
    let best = 0;
    const re = new RegExp("\\b" + esc(q) + "\\b");
    for (const s of senses[i]) {
      if (s === q) return 100 - senses[i].length;                 // exact meaning
      if (s.startsWith(q + " ") || s.endsWith(" " + q)) best = Math.max(best, 80 - s.length / 10);
      else if (re.test(s)) best = Math.max(best, 60 - s.length / 10);
      else if (s.startsWith(q)) best = Math.max(best, 45 - s.length / 10);   // "approv" -> approval
      else if (s.split(" ").some(t => t.startsWith(q))) best = Math.max(best, 35 - s.length / 10);
    }
    if (!best && fullText[i].includes(q)) best = 10;
    return best;
  }
  function scoreHindi(w, q) {
    if (w.h === q) return 100;
    if (w.h.startsWith(q)) return 60 - w.h.length / 10;
    if (w.h.includes(q)) return 30 - w.h.length / 10;
    return 0;
  }
  function search(raw) {
    const hindi = isDevanagari(raw), q = hindi ? raw.trim() : norm(raw);
    if (!q || (!hindi && q.length < 2)) return [];
    const scored = [];
    words.forEach((w, i) => { const s = hindi ? scoreHindi(w, q) : scoreEnglish(i, q); if (s > 0) scored.push([s, i]); });
    scored.sort((a, b) => b[0] - a[0] || words[a[1]].e.length - words[b[1]].e.length);
    return scored.slice(0, MAX_SUGGESTIONS).map(([, i]) => words[i]);
  }
  function highlight(el, text, q) {
    if (!q || isDevanagari(q)) { el.textContent = text; return; }
    const m = text.toLowerCase().indexOf(q.toLowerCase());
    if (m < 0) { el.textContent = text; return; }
    const mark = document.createElement("mark"); mark.textContent = text.slice(m, m + q.length);
    el.append(text.slice(0, m), mark, text.slice(m + q.length));
  }

  let current_suggestions = [], active = -1;
  function showSuggestions() {
    const raw = input.value;
    current_suggestions = search(raw); active = -1;
    sugg.innerHTML = "";
    if (!raw.trim() || (!isDevanagari(raw) && norm(raw).length < 2)) { sugg.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
    if (!current_suggestions.length) {
      const li = document.createElement("li"); li.className = "s-none";
      li.textContent = "कोई सुझाव नहीं — कोई दूसरा शब्द लिखें"; sugg.appendChild(li);
    }
    current_suggestions.forEach((w, i) => {
      const li = document.createElement("li"); li.role = "option"; li.id = "sg-" + i;
      const en = document.createElement("span"); en.className = "s-en"; highlight(en, w.e, raw.trim());
      const hi = document.createElement("span"); hi.className = "s-hi"; hi.textContent = w.h;
      li.append(en, hi);
      li.addEventListener("mousedown", e => e.preventDefault());       // keep focus in the box
      li.addEventListener("click", () => choose(i));
      sugg.appendChild(li);
    });
    sugg.hidden = false; input.setAttribute("aria-expanded", "true");
  }
  function setActive(i) {
    const items = sugg.querySelectorAll("li[role=option]");
    if (!items.length) return;
    active = (i + items.length) % items.length;
    items.forEach((li, k) => li.setAttribute("aria-selected", k === active ? "true" : "false"));
    input.setAttribute("aria-activedescendant", "sg-" + active);
    items[active].scrollIntoView({ block: "nearest" });
  }
  function choose(i) {
    const w = current_suggestions[i]; if (!w) return;
    input.value = w.e.split(";")[0].trim();
    sugg.hidden = true; input.setAttribute("aria-expanded", "false");
    const box = $("searchResult"); box.innerHTML = ""; box.appendChild(cardEl(w));
    $("searchHint").hidden = true;
    input.blur();
  }
  let timer;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(showSuggestions, 90); });
  input.addEventListener("focus", () => { if (input.value.trim()) showSuggestions(); });
  input.addEventListener("blur", () => setTimeout(() => { sugg.hidden = true; input.setAttribute("aria-expanded", "false"); }, 150));
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") { e.preventDefault(); if (current_suggestions.length) choose(active >= 0 ? active : 0); }
  });
  document.querySelectorAll(".chip-btn[data-q]").forEach(b => b.addEventListener("click", () => {
    input.value = b.dataset.q; input.focus(); showSuggestions();
  }));

  // ---------- start ----------
  function showError(err) {
    console.error(err);
    const box = $("todayCards"); box.innerHTML = "";
    const d = document.createElement("div"); d.className = "load-error";
    d.innerHTML = "<strong>शब्द-सूची लोड नहीं हो सकी।</strong><br>" +
      (location.protocol === "file:"
        ? '<span lang="en">Open the app from its website or the installed app — a page opened directly from a file cannot read the Excel file.</span>'
        : '<span lang="en">The Excel word list could not be read.</span>') + "<small></small>";
    d.querySelector("small").textContent = "Details: " + (err && err.message ? err.message : err);
    box.appendChild(d);
  }
  function refreshDay() { if (!words.length) return; ensureToday(); renderToday(); if (location.hash === "#history") renderHistory(); }

  $("todayCards").innerHTML = '<p class="loading">शब्द लोड हो रहे हैं…</p>';
  history = loadHistory();
  showTab();

  fetch(EXCEL_FILE, { cache: "no-cache" })
    .then(r => { if (!r.ok) throw new Error("HTTP " + r.status + " — " + EXCEL_FILE); return r.arrayBuffer(); })
    .then(buf => XlsxReader.readSheet(buf, SHEET_NAME))
    .then(({ rows }) => {
      words = rowsToWords(rows);
      if (!words.length) throw new Error("No words found in columns B and C");
      byHindi = new Map(words.map(w => [w.h, w]));
      indexWords();
      refreshDay();
      showTab();
    })
    .catch(showError);

  // New day while the app stays open in the background.
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshDay(); });

  // On the GitHub Pages website, offer the Android APK from this repository's latest release.
  const gh = location.hostname.match(/^([^.]+)\.github\.io$/);
  if (gh) {
    const repo = location.pathname.split("/").filter(Boolean)[0] || (gh[1] + ".github.io");
    $("apkLink").href = "https://github.com/" + gh[1] + "/" + repo + "/releases/latest/download/prashasnik-shabdavali.apk";
    $("apkBox").hidden = false;
  }

  // Offline support for the website version (the Android app already has the files built in).
  if ("serviceWorker" in navigator && location.protocol === "https:" && !/androidplatform\.net$/.test(location.hostname)) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
