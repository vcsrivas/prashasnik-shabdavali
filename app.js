/* प्रशासनिक शब्दावली — 5 official Hindi words a day.
 * The word list is shuffled once with a fixed seed, so every visitor sees the
 * same 5 words on the same day, and no word repeats until all have been shown.
 */
(function () {
  "use strict";

  // The word list is read straight from this Excel file in the repository.
  // To update the words, upload a new file with the same name.
  const EXCEL_FILE = "Official_Hindi_Words_English_Meanings.xlsx";
  const SHEET_NAME = "Glossary";       // falls back to the first sheet

  const WORDS_PER_DAY = 5;
  const SEED = 20261106;
  const START = Date.UTC(2026, 0, 1);   // day 0 of the cycle
  const DAY_MS = 86400000;
  const IST_OFFSET_MS = 5.5 * 3600000;  // days change at midnight India time
  const LEARNED_KEY = "prashasnik-shabdavali:learned";

  const cardsEl = document.getElementById("cards");
  cardsEl.innerHTML = '<p class="loading">शब्द लोड हो रहे हैं… <span lang="en">Loading words…</span></p>';

  // Find the Hindi / English / Category columns by their headings, so columns
  // can be reordered or added in Excel. Falls back to columns B, C, D.
  function rowsToWords(rows) {
    let hdr = rows.findIndex(r => r.some(c => /hindi|हिंदी/i.test(c)) && r.some(c => /english|अंग्रेज़ी|अंग्रेजी/i.test(c)));
    const find = (re, dflt) => {
      if (hdr < 0) return dflt;
      const i = rows[hdr].findIndex(c => re.test(c));
      return i < 0 ? dflt : i;
    };
    const hCol = find(/hindi|हिंदी/i, 1), eCol = find(/english|अंग्रेज़ी|अंग्रेजी/i, 2), cCol = find(/categor|विषय|श्रेणी/i, 3);
    const out = [], seen = new Set();
    rows.slice(hdr + 1).forEach(r => {
      const h = (r[hCol] || "").trim(), e = (r[eCol] || "").trim();
      if (!h || !e || seen.has(h)) return;   // skip blank rows and repeated Hindi terms
      seen.add(h);
      out.push({ h, e, c: (r[cCol] || "").trim() });
    });
    return out;
  }

  function showLoadError(err) {
    console.error(err);
    const local = location.protocol === "file:";
    cardsEl.innerHTML = "";
    const p = document.createElement("div");
    p.className = "load-error";
    p.innerHTML =
      "<strong>शब्द सूची लोड नहीं हो सकी।</strong> " +
      (local
        ? "Excel फ़ाइल पढ़ने के लिए ऐप को वेबसाइट (GitHub Pages) से खोलें, सीधे फ़ाइल डबल-क्लिक करके नहीं।"
        : "कृपया जाँचें कि रिपॉज़िटरी में <code></code> फ़ाइल मौजूद है।") +
      '<br><span lang="en">' +
      (local
        ? "Excel can only be read when the app is served from a website (e.g. GitHub Pages), not opened as a local file."
        : "Could not read the Excel file. Check that <code></code> is in the repository.") +
      '</span><br><small lang="en"></small>';
    p.querySelectorAll("code").forEach(c => (c.textContent = EXCEL_FILE));
    p.querySelector("small").textContent = "Details: " + (err && err.message ? err.message : err);
    cardsEl.appendChild(p);
  }

  fetch(EXCEL_FILE, { cache: "no-cache" })
    .then(r => { if (!r.ok) throw new Error("HTTP " + r.status + " for " + EXCEL_FILE); return r.arrayBuffer(); })
    .then(buf => XlsxReader.readSheet(buf, SHEET_NAME))
    .then(({ rows }) => {
      const words = rowsToWords(rows);
      if (!words.length) throw new Error("No rows with both a Hindi term and an English meaning were found");
      main(words);
    })
    .catch(showLoadError);

  function main(words) {

  // ---- deterministic shuffle (mulberry32 + Fisher–Yates) ----
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const order = words.map((_, i) => i);
  const rand = mulberry32(SEED);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const cycleDays = Math.ceil(order.length / WORDS_PER_DAY);

  function todayIndex() {
    return Math.floor((Date.now() + IST_OFFSET_MS - START) / DAY_MS);
  }
  function wordsForDay(day) {
    const slot = ((day % cycleDays) + cycleDays) % cycleDays;
    const out = [];
    for (let k = 0; k < WORDS_PER_DAY; k++) {
      out.push(words[order[(slot * WORDS_PER_DAY + k) % order.length]]);
    }
    return out;
  }
  function dateForDay(day) {
    return new Date(START + day * DAY_MS);
  }

  // ---- learned words (stored only in this browser) ----
  let learned = new Set();
  try { learned = new Set(JSON.parse(localStorage.getItem(LEARNED_KEY) || "[]")); } catch (e) {}
  function saveLearned() {
    try { localStorage.setItem(LEARNED_KEY, JSON.stringify([...learned])); } catch (e) {}
  }

  // ---- rendering ----
  const today = todayIndex();
  let current = today;
  const hiDigits = n => String(n).replace(/\d/g, d => "०१२३४५६७८९"[d]);

  function render() {
    const date = dateForDay(current);
    const opts = { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
    document.getElementById("dateHi").textContent = date.toLocaleDateString("hi-IN", opts);
    document.getElementById("dateEn").textContent =
      (current === today ? "Today · " : "") + date.toLocaleDateString("en-IN", opts);
    document.getElementById("nextDay").disabled = current >= today;
    document.getElementById("prevDay").disabled = current <= 0;
    document.getElementById("todayBtn").hidden = current === today;

    cardsEl.innerHTML = "";
    wordsForDay(current).forEach((w, i) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML =
        '<div class="card-num">' + hiDigits(i + 1) + "</div>" +
        '<h2 class="word"></h2>' +
        '<p class="meaning" lang="en"><span class="meaning-label">Meaning:</span><span class="m"></span></p>' +
        '<div class="card-foot"><span class="tag" lang="en"></span>' +
        '<div class="card-actions">' +
        '<button class="icon-btn speak" title="उच्चारण सुनें">🔊 सुनें</button>' +
        '<button class="icon-btn learn"></button></div></div>';
      card.querySelector(".word").textContent = w.h;
      card.querySelector(".m").textContent = w.e;
      card.querySelector(".tag").textContent = w.c;

      const learnBtn = card.querySelector(".learn");
      const paint = () => {
        const done = learned.has(w.h);
        learnBtn.textContent = done ? "✓ सीख लिया" : "सीख लिया?";
        learnBtn.classList.toggle("done", done);
      };
      paint();
      learnBtn.addEventListener("click", () => {
        learned.has(w.h) ? learned.delete(w.h) : learned.add(w.h);
        saveLearned(); paint(); renderProgress();
      });

      const speakBtn = card.querySelector(".speak");
      if (!("speechSynthesis" in window)) speakBtn.remove();
      else speakBtn.addEventListener("click", () => {
        const u = new SpeechSynthesisUtterance(w.h);
        u.lang = "hi-IN"; u.rate = 0.85;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      });

      cardsEl.appendChild(card);
    });
    renderProgress();
  }

  function renderProgress() {
    const n = learned.size;
    document.getElementById("progressLabel").textContent =
      "आपने अब तक " + n.toLocaleString("hi-IN") + " / " + words.length.toLocaleString("hi-IN") +
      " शब्द सीखे हैं";
    document.getElementById("progressBar").style.width = (100 * n / words.length).toFixed(1) + "%";
  }

  document.getElementById("prevDay").addEventListener("click", () => { if (current > 0) { current--; render(); } });
  document.getElementById("nextDay").addEventListener("click", () => { if (current < today) { current++; render(); } });
  document.getElementById("todayBtn").addEventListener("click", () => { current = today; render(); });

  // ---- search across the full list ----
  const searchEl = document.getElementById("search");
  const resultsEl = document.getElementById("results");
  const MAX_RESULTS = 30;
  const isDevanagari = s => /[ऀ-ॿ]/.test(s);
  const norm = s => s.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();
  // Pre-split each English meaning into its senses: "Sanction; Approval" -> ["sanction", "approval"]
  const senses = words.map(w => w.e.split(";").map(s => norm(s.replace(/\(.*?\)/g, " "))).filter(Boolean));
  const fullText = words.map(w => norm(w.e));

  // Higher score = better match. 0 = no match.
  function scoreEnglish(i, q) {
    let best = 0;
    for (const s of senses[i]) {
      if (s === q) return 100 - senses[i].length;                // exact sense: "approval" (single-sense words first)
      if (s.startsWith(q + " ") || s.endsWith(" " + q)) best = Math.max(best, 80 - s.length / 10);
      else if (new RegExp("\\b" + q.replace(/[-]/g, "\\-") + "\\b").test(s)) best = Math.max(best, 60 - s.length / 10);
      else if (s.startsWith(q)) best = Math.max(best, 40 - s.length / 10); // prefix: "approv"
    }
    if (!best && fullText[i].includes(q)) best = 10;            // anywhere: "prov" in "approval"
    return best;
  }
  function scoreHindi(w, q) {
    if (w.h === q) return 100;
    if (w.h.startsWith(q)) return 60 - w.h.length / 10;
    if (w.h.includes(q)) return 30 - w.h.length / 10;
    return 0;
  }

  let timer;
  searchEl.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(runSearch, 120); });

  function runSearch() {
    const raw = searchEl.value.trim();
    resultsEl.innerHTML = "";
    const hindi = isDevanagari(raw);
    const q = hindi ? raw : norm(raw);
    if (q.length < (hindi ? 1 : 2)) return;

    const scored = [];
    words.forEach((w, i) => {
      const s = hindi ? scoreHindi(w, q) : scoreEnglish(i, q);
      if (s > 0) scored.push([s, i]);
    });
    scored.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const hits = scored.slice(0, MAX_RESULTS).map(([, i]) => words[i]);

    const head = document.createElement("li");
    head.className = "r-note";
    if (!hits.length) {
      head.textContent = "कोई शब्द नहीं मिला। कृपया कोई दूसरा या छोटा शब्द लिखें। (No match found — try a shorter or different word.)";
      resultsEl.appendChild(head);
      return;
    }
    head.textContent = (scored.length > MAX_RESULTS
      ? "सबसे निकट के " + hiDigits(MAX_RESULTS) + " परिणाम (कुल " + hiDigits(scored.length) + ")"
      : hiDigits(scored.length) + " परिणाम") + (hindi ? "" : " · English → हिंदी");
    resultsEl.appendChild(head);

    hits.forEach(w => {
      const li = document.createElement("li");
      const h = document.createElement("span"); h.className = "r-h"; h.textContent = w.h;
      const e = document.createElement("span"); e.className = "r-e"; e.lang = "en"; e.textContent = w.e;
      const c = document.createElement("span"); c.className = "r-c"; c.lang = "en"; c.textContent = w.c;
      li.append(h, e, c);
      resultsEl.appendChild(li);
    });
  }

  document.getElementById("totalWords").textContent =
    "कुल " + words.length.toLocaleString("hi-IN") + " शब्द";

  render();
  }
})();
