(() => {
  "use strict";

  // ---------------------------------------------------------------- helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const byId = new Map(SOUNDS.map((s) => [s.id, s]));
  const esc = (str) => String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const soundUrl = (s) => encodeURI(SOUND_DIR + s.file);

  // Symbols that count as the same answer (ɹ / ɻ).
  const equivalents = (s) => {
    const group = INTERCHANGEABLE.find((g) => g.includes(s.sym));
    return group ? SOUNDS.filter((x) => group.includes(x.sym)) : [s];
  };
  const isCorrect = (chosen, target) => equivalents(target).some((x) => x.id === chosen.id);

  // ---------------------------------------------------------------- audio
  const audio = new Audio();
  audio.preload = "auto";
  let playingBtn = null;
  function play(sound, btn) {
    audio.pause();
    audio.src = soundUrl(sound);
    audio.currentTime = 0;
    if (playingBtn) playingBtn.classList.remove("playing");
    playingBtn = btn || null;
    if (playingBtn) playingBtn.classList.add("playing");
    audio.play().catch(() => { if (playingBtn) playingBtn.classList.remove("playing"); });
  }
  const stopPulse = () => { if (playingBtn) playingBtn.classList.remove("playing"); playingBtn = null; };
  audio.addEventListener("ended", stopPulse);
  audio.addEventListener("pause", stopPulse);
  audio.addEventListener("error", () => {
    stopPulse();
    console.error("Could not load sound:", audio.src);
  });

  // ---------------------------------------------------------------- tooltip
  // Any element with data-tip (text) and optional data-tip-sym (IPA symbol) gets a tooltip.
  const tooltip = $("#tooltip");
  let tipTarget = null;
  function showTip(el) {
    const text = el.dataset.tip;
    if (!text) return hideTip();
    tipTarget = el;
    const sym = el.dataset.tipSym;
    tooltip.innerHTML = (sym ? `<span class="tt-sym">${esc(sym)}</span>` : "") + text;
    tooltip.hidden = false;
    const r = el.getBoundingClientRect();
    const t = tooltip.getBoundingClientRect();
    let left = r.left + r.width / 2 - t.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - t.width - 8));
    let top = r.top - t.height - 8;
    if (top < 8) top = r.bottom + 8;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }
  function hideTip() { tooltip.hidden = true; tipTarget = null; }
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-tip]");
    if (el && el !== tipTarget) showTip(el);
    else if (!el && tipTarget) hideTip();
  });
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest("[data-tip]");
    el ? showTip(el) : hideTip();
  });
  document.addEventListener("focusout", hideTip);
  window.addEventListener("scroll", hideTip, true);

  // ---------------------------------------------------------------- state
  const state = {
    cats: [],        // selected categories
    mode: "chart",   // "chart" | "choice"
    length: "10",    // "10" | "20" | "all" | "endless"
    pool: [],        // every sound in the selected categories (answer options)
    queue: [],       // upcoming questions
    total: 0,        // number of questions (Infinity for endless)
    asked: 0,
    correct: 0,
    current: null,
    selected: null,
    answered: false,
    history: [],     // { sound, chosen, ok }
  };

  // ---------------------------------------------------------------- setup screen
  const form = $("#setup-form");
  const screens = { setup: $("#setup"), quiz: $("#quiz"), results: $("#results"), charts: $("#charts") };
  const show = (name) => {
    for (const [k, el] of Object.entries(screens)) el.hidden = k !== name;
    hideTip();
    window.scrollTo(0, 0);
  };

  const affricateBox = $("#affricates");
  const setCount = (key, n) => { $(`[data-count="${key}"]`).textContent = `(${n})`; };
  setCount("vowel", SOUNDS.filter((s) => s.cat === "vowel").length);
  setCount("nonpulmonic", SOUNDS.filter((s) => s.cat === "nonpulmonic").length);
  setCount("affricate", SOUNDS.filter((s) => s.affricate).length);

  function selectedCats() { return $$('input[name="cat"]:checked', form).map((i) => i.value); }
  // Every sound matching the current setup choices.
  function poolFor(cats, includeAffricates) {
    return SOUNDS.filter((s) => cats.includes(s.cat) && (includeAffricates || !s.affricate));
  }
  function updateAllCount() {
    const cats = selectedCats();
    affricateBox.disabled = !cats.includes("pulmonic");
    setCount("pulmonic", poolFor(["pulmonic"], affricateBox.checked).length);
    const n = poolFor(cats, affricateBox.checked).length;
    $("#all-count").textContent = n ? `(${n})` : "";
    $("#cat-error").hidden = n > 0;
  }
  form.addEventListener("change", updateAllCount);
  updateAllCount();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cats = selectedCats();
    if (!cats.length) { $("#cat-error").hidden = false; return; }
    const fd = new FormData(form);
    const includeAffricates = affricateBox.checked;
    startQuiz({
      cats,
      mode: fd.get("mode"),
      length: fd.get("length"),
      includeAffricates,
      pool: poolFor(cats, includeAffricates),
    });
  });

  // ---------------------------------------------------------------- quiz flow
  // questionSet = the sounds that can be asked (all of the pool, or just missed ones on retry)
  function startQuiz({ cats, mode, length, includeAffricates, pool, questionSet = pool }) {
    Object.assign(state, {
      cats, mode, length, includeAffricates, pool,
      questionSet,
      asked: 0, correct: 0, history: [],
      current: null, selected: null, answered: false,
    });
    if (length === "endless") {
      state.total = Infinity;
      state.queue = shuffle(questionSet);
    } else {
      const n = length === "all" ? questionSet.length : Math.min(Number(length), questionSet.length);
      state.total = n;
      state.queue = shuffle(questionSet).slice(0, n);
    }
    if (mode === "chart") renderChart();
    show("quiz");
    nextQuestion();
  }

  function nextQuestion() {
    if (state.asked >= state.total) return finish();
    if (!state.queue.length) {
      // Endless mode: reshuffle, avoiding an immediate repeat.
      let q = shuffle(state.questionSet);
      if (q.length > 1 && state.current && q[0].id === state.current.id) q.push(q.shift());
      state.queue = q;
    }
    state.current = state.queue.shift();
    state.selected = null;
    state.answered = false;
    state.asked++;

    if (state.mode === "choice") renderChoices();
    resetAnswerButtons();

    $("#feedback").hidden = true;
    $("#submit").hidden = false;
    $("#submit").disabled = true;
    $("#next").hidden = true;
    $("#selected-label").innerHTML = "";
    const playBtn = $("#play");
    delete playBtn.dataset.tip;
    updateTopbar();
    play(state.current, playBtn);
  }

  function updateTopbar() {
    $("#progress").textContent = state.total === Infinity
      ? `Question ${state.asked}`
      : `Question ${state.asked} of ${state.total}`;
    const done = state.history.length;
    $("#score").textContent = done ? `${state.correct} / ${done} correct` : "";
  }

  function select(id) {
    if (state.answered) return;
    state.selected = byId.get(id);
    $$("#answers .sym").forEach((b) => b.classList.toggle("selected", b.dataset.id === id));
    $("#submit").disabled = false;
    $("#selected-label").innerHTML =
      `Selected: <span class="ipa">${esc(state.selected.sym)}</span>`;
  }

  function submit() {
    if (state.answered || !state.selected) return;
    state.answered = true;
    const target = state.current;
    const chosen = state.selected;
    const ok = isCorrect(chosen, target);
    if (ok) state.correct++;
    state.history.push({ sound: target, chosen, ok });

    // Mark buttons.
    const answers = $("#answers");
    answers.classList.add("locked");
    const correctIds = new Set(equivalents(target).map((s) => s.id));
    $$(".sym", answers).forEach((b) => {
      b.classList.remove("selected");
      if (b.dataset.id === target.id || (ok && b.dataset.id === chosen.id)) b.classList.add("correct");
      else if (b.dataset.id === chosen.id) b.classList.add("wrong");
      // Keep the alternative of an interchangeable pair visibly correct too.
      if (correctIds.has(b.dataset.id) && b.dataset.id !== chosen.id && !ok) b.classList.add("correct");
    });

    // Reveal the filename on the main play button (hover / focus).
    $("#play").dataset.tip = `Sound file: <code>${esc(target.file)}</code>`;

    renderFeedback(target, chosen, ok);
    $("#selected-label").innerHTML = "";
    $("#submit").hidden = true;
    $("#next").hidden = false;
    $("#next").textContent = state.asked >= state.total ? "See results" : "Next";
    $("#next").focus({ preventScroll: true });
    hideTip();
    updateTopbar();
  }

  function renderFeedback(target, chosen, ok) {
    const fb = $("#feedback");
    fb.className = "feedback " + (ok ? "good" : "bad");
    let html;
    if (ok) {
      const alt = chosen.id !== target.id
        ? `<p>The recording was <span class="big-ipa">[${esc(target.sym)}]</span>. [ɹ] and [ɻ] are interchangeable for these quizzes.</p>`
        : "";
      html = `<p class="verdict">Correct!</p>
        <p><span class="big-ipa">[${esc(chosen.sym)}]</span> is the ${esc(chosen.name)}.</p>${alt}`;
    } else {
      html = `<p class="verdict">Not quite.</p>
        <p>The correct answer is <span class="big-ipa">[${esc(target.sym)}]</span>, the <strong>${esc(target.name)}</strong>.</p>
        <p>You chose <span class="big-ipa">[${esc(chosen.sym)}]</span>, the ${esc(chosen.name)}.</p>
        <div class="compare">
          <button type="button" class="btn small" data-play="${target.id}" data-tip="Sound file: <code>${esc(target.file)}</code>">▶ Hear [${esc(target.sym)}] again</button>
          <button type="button" class="btn small" data-play="${chosen.id}" data-tip="Sound file: <code>${esc(chosen.file)}</code>">▶ Hear [${esc(chosen.sym)}] to compare</button>
        </div>`;
    }
    fb.innerHTML = html;
    fb.hidden = false;
  }

  function finish() {
    audio.pause();
    const done = state.history.length;
    const pct = done ? Math.round((state.correct / done) * 100) : 0;
    $("#final-score").innerHTML = done
      ? `You got <strong>${state.correct} / ${done}</strong> correct (${pct}%).`
      : "No questions answered.";

    const missed = state.history.filter((h) => !h.ok);
    const missedEl = $("#missed");
    if (missed.length) {
      missedEl.innerHTML = `<h3>Sounds to review</h3><ul class="missed-list">` +
        missed.map((h) => `<li>
          <button type="button" class="mini-play" data-play="${h.sound.id}" aria-label="Play ${esc(h.sound.name)}"
            data-tip="Sound file: <code>${esc(h.sound.file)}</code>">${PLAY_SVG}</button>
          <span class="big-ipa">${esc(h.sound.sym)}</span>
          <span class="detail">${esc(h.sound.name)}
            <small>You chose <span class="ipa">[${esc(h.chosen.sym)}]</span>, ${esc(h.chosen.name)}</small></span>
          <button type="button" class="mini-play" data-play="${h.chosen.id}" aria-label="Play ${esc(h.chosen.name)}"
            data-tip="Hear your answer [${esc(h.chosen.sym)}]<br>Sound file: <code>${esc(h.chosen.file)}</code>">${PLAY_SVG}</button>
        </li>`).join("") + `</ul>`;
    } else {
      missedEl.innerHTML = done ? "<p>No mistakes. Well done!</p>" : "";
    }
    $("#retry-missed").hidden = !missed.length;
    show("results");
  }

  // ---------------------------------------------------------------- rendering answers
  function symButton(s) {
    return `<button type="button" class="sym" data-id="${s.id}" data-tip="${esc(s.name)}" data-tip-sym="${esc(s.sym)}"
      aria-label="${esc(s.sym)}, ${esc(s.name)}">${esc(s.sym)}</button>`;
  }

  function resetAnswerButtons() {
    const answers = $("#answers");
    answers.classList.remove("locked");
    $$(".sym", answers).forEach((b) => b.classList.remove("selected", "correct", "wrong"));
  }

  function renderChart() {
    $("#answers").innerHTML = chartsHtml(state.cats, state.pool);
  }

  // Charts for the given categories, showing only the sounds in `pool`.
  // Used by the quiz (selected sounds) and the chart page (every sound).
  function chartsHtml(cats, pool) {
    const parts = [];
    if (cats.includes("vowel")) parts.push(vowelChart(pool));
    if (cats.includes("pulmonic")) parts.push(pulmonicChart(pool));
    if (cats.includes("nonpulmonic")) parts.push(nonPulmonicChart(pool));
    return parts.join("");
  }

  function pulmonicChart(pool) {
    const sounds = pool.filter((s) => s.cat === "pulmonic" && !s.other);
    const at = (row, col, v) => sounds.find((s) => s.row === row && s.col === col && s.voiced === v);
    const rowShown = (row) => sounds.some((s) => s.row === row);
    let html = `<div class="card chart-block"><h3>Pulmonic consonants</h3><div class="scroll-x"><table class="pulmonic"><thead><tr><th></th>`;
    html += PULMONIC_PLACES.map((p) => `<th colspan="2">${p}</th>`).join("");
    html += `</tr></thead><tbody>`;
    PULMONIC_MANNERS.forEach((manner, row) => {
      if (!rowShown(row)) return; // e.g. affricate rows when switched off
      html += `<tr><th>${manner}</th>`;
      PULMONIC_PLACES.forEach((_, col) => {
        for (const v of [0, 1]) {
          const s = at(row, col, v);
          html += `<td class="${v ? "vd" : "vl"}">${s ? symButton(s) : ""}</td>`;
        }
      });
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    const other = pool.filter((s) => s.cat === "pulmonic" && s.other);
    html += `<div class="other-row"><span class="label">Other symbols</span>${other.map(symButton).join("")}</div>`;
    html += `<p class="hint">Where symbols appear in pairs, the one on the right is voiced.</p></div>`;
    return html;
  }

  function nonPulmonicChart(pool) {
    const np = pool.filter((s) => s.cat === "nonpulmonic");
    const clicks = np.filter((s) => s.type === "click");
    const places = [...new Set(clicks.map((s) => s.placeLabel))];
    let clickRows = places.map((p) => {
      const vl = clicks.find((s) => s.placeLabel === p && !s.nasal);
      const na = clicks.find((s) => s.placeLabel === p && s.nasal);
      return `<tr><th>${p}</th><td>${vl ? symButton(vl) : ""}</td><td>${na ? symButton(na) : ""}</td></tr>`;
    }).join("");
    const simple = (type) => np.filter((s) => s.type === type)
      .map((s) => `<tr><th>${s.placeLabel}</th><td>${symButton(s)}</td></tr>`).join("");
    return `<div class="card chart-block"><h3>Non-pulmonic consonants</h3><div class="np-grid">
      <table class="np"><thead><tr><th>Clicks</th><th>Voiceless</th><th>Nasalized</th></tr></thead><tbody>${clickRows}</tbody></table>
      <table class="np"><thead><tr><th>Implosives</th><th></th></tr></thead><tbody>${simple("implosive")}</tbody></table>
      <table class="np"><thead><tr><th>Ejectives</th><th></th></tr></thead><tbody>${simple("ejective")}</tbody></table>
    </div></div>`;
  }

  // Vowel trapezoid. Coordinates are percentages of the chart box.
  function vowelX(h, b) {
    const front = (h / 6) * 40;
    const back = 100;
    const central = (front + back) / 2;
    switch (b) {
      case 0: return front;
      case 1: return front + (central - front) * 0.45;
      case 2: return central;
      case 3: return back - (back - central) * 0.45;
      default: return back;
    }
  }
  function vowelChart(pool) {
    const vowels = pool.filter((s) => s.cat === "vowel" && !s.other);
    const fx = (h) => (h / 6) * 40;
    const y = (h) => (h / 6) * 100;
    const lines = [
      [0, 0, 100, 0], [fx(6), 100, 100, 100],          // top, bottom
      [0, 0, fx(6), 100], [100, 0, 100, 100],          // front, back
      [50, 0, (fx(6) + 100) / 2, 100],                 // central
      [fx(2), y(2), 100, y(2)], [fx(4), y(4), 100, y(4)], // close-mid, open-mid
    ];
    const points = new Map();
    let buttons = "";
    for (const v of vowels) {
      const x = vowelX(v.h, v.b);
      const yy = y(v.h);
      if (v.r !== -1) points.set(`${v.h},${v.b}`, [x, yy]);
      const offset = v.r === -1 ? "0px" : v.r === 1 ? "17px" : "-17px";
      buttons += symButton(v).replace('class="sym"', `class="sym" style="left:calc(${x}% + ${offset});top:${yy}%"`);
    }
    const dots = [...points.values()].map(([x, yy]) =>
      `<circle cx="${x}" cy="${yy}" r="0.9"/>`).join("");
    const svg = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${lines.map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`).join("")}
      ${dots}</svg>`;
    const axes = `<span class="axis" style="left:0;top:-26px;transform:translateX(-50%)">Front</span>
      <span class="axis" style="left:50%;top:-26px;transform:translateX(-50%)">Central</span>
      <span class="axis" style="left:100%;top:-26px;transform:translateX(-50%)">Back</span>`;
    const other = pool.filter((s) => s.cat === "vowel" && s.other);
    return `<div class="card chart-block"><h3>Vowels</h3><div class="vowel-wrap">
      <div class="vowel-chart">${svg}${axes}${buttons}</div>
      <div class="other-row"><span class="label">Other</span>${other.map(symButton).join("")}</div>
    </div><p class="hint">Where symbols appear in pairs, the one on the right is rounded.</p></div>`;
  }

  // Multiple choice: the answer plus 5 similar-sounding distractors.
  function similarity(a, b) {
    if (a.cat !== b.cat) return -5;
    if (a.cat === "pulmonic") {
      return (a.row === b.row ? 3 : 0) + (Math.abs(a.col - b.col) <= 1 ? 2 : 0) +
        (a.col === b.col ? 1 : 0) + (a.voiced === b.voiced ? 1 : 0);
    }
    if (a.cat === "nonpulmonic") {
      return (a.type === b.type ? 3 : 0) + (Math.abs(a.place - b.place) <= 1 ? 2 : 0) + (a.nasal === b.nasal ? 1 : 0);
    }
    return 6 - (Math.abs(a.h - b.h) + Math.abs(a.b - b.b) * 0.75) + (a.r === b.r ? 0.5 : 0);
  }
  function renderChoices() {
    const target = state.current;
    const exclude = new Set(equivalents(target).map((s) => s.id));
    const ranked = state.pool
      .filter((s) => !exclude.has(s.id))
      .map((s) => ({ s, score: similarity(target, s) + Math.random() * 2.5 }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s);
    // Never offer both members of an interchangeable pair (ɹ / ɻ).
    const distractors = [];
    for (const s of ranked) {
      if (distractors.length === 5) break;
      if (distractors.some((d) => isCorrect(d, s))) continue;
      distractors.push(s);
    }
    const options = shuffle([target, ...distractors]);
    $("#answers").innerHTML = `<div class="choice-grid">${options.map(symButton).join("")}</div>`;
  }

  // ---------------------------------------------------------------- events
  $("#answers").addEventListener("click", (e) => {
    const b = e.target.closest(".sym");
    if (b) select(b.dataset.id);
  });
  $("#answers").addEventListener("dblclick", (e) => {
    if (e.target.closest(".sym")) submit();
  });
  $("#play").addEventListener("click", (e) => { if (state.current) play(state.current, e.currentTarget); });
  $("#submit").addEventListener("click", submit);
  $("#next").addEventListener("click", nextQuestion);
  $("#quit").addEventListener("click", () => {
    // Drop an unanswered current question so it doesn't count.
    finish();
  });
  $("#restart").addEventListener("click", () => { show("setup"); });
  $("#retry-missed").addEventListener("click", () => {
    const seen = new Set();
    const missed = state.history.filter((h) => !h.ok && !seen.has(h.sound.id) && seen.add(h.sound.id)).map((h) => h.sound);
    startQuiz({ cats: state.cats, mode: state.mode, length: "all", includeAffricates: state.includeAffricates,
      pool: state.pool, questionSet: missed });
  });
  // Any [data-play] button plays that sound (feedback + results).
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-play]");
    if (b) play(byId.get(b.dataset.play), b.classList.contains("mini-play") ? b : null);
  });

  document.addEventListener("keydown", (e) => {
    if (screens.quiz.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === " ") {
      // Space always replays, even when a symbol button has focus after being clicked.
      e.preventDefault();
      if (!e.repeat && state.current) play(state.current, $("#play"));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (state.answered) return nextQuestion();
      // Enter on a focused, not-yet-selected symbol selects it (keyboard users);
      // otherwise it submits the current selection.
      const sym = e.target.closest && e.target.closest("#answers .sym");
      if (sym && sym.dataset.id !== (state.selected && state.selected.id)) select(sym.dataset.id);
      else submit();
    }
  });
  // Buttons activate on Space keyup, so block that too or Space would also "click" the focused button.
  document.addEventListener("keyup", (e) => {
    if (!screens.quiz.hidden && e.key === " ") e.preventDefault();
  });

  // ---------------------------------------------------------------- chart page
  // "#charts" shows every sound in chart form; clicking a symbol plays it.
  const chartsEl = $("#charts-content");
  chartsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".sym");
    if (b) play(byId.get(b.dataset.id), b);
  });
  function route() {
    if (location.hash === "#charts") {
      if (!chartsEl.innerHTML) chartsEl.innerHTML = chartsHtml(["vowel", "pulmonic", "nonpulmonic"], SOUNDS);
      audio.pause();
      show("charts");
    } else if (!screens.charts.hidden) {
      audio.pause();
      show("setup");
    }
  }
  window.addEventListener("hashchange", route);
  route();
})();
