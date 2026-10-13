const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function scoreFor(model, bench) {
  if (model.unreleased) {
    const lift = bench.id === "overclaim" ? -6 : 0;
    return clamp(model.base + 1 + (hash(model.id + bench.id) - 0.5) * 3 + lift, 0, 99.9);
  }
  const bias = bench.bias[model.creator] || 0;
  const reasoningPenalty = bench.id === "bullshit" && model.reasoning ? -5 : 0;
  const open = model.open ? -1.5 : 0;
  const v = model.base + bench.offset + bias + reasoningPenalty + open + (hash(model.id + bench.id) - 0.5) * bench.spread;
  return clamp(v, 2, 99.4);
}

MODELS.forEach((m) => {
  m.scores = {};
  BENCHMARKS.forEach((b) => (m.scores[b.id] = scoreFor(m, b)));
  const wsum = BENCHMARKS.reduce((a, b) => a + b.weight, 0);
  m.index = BENCHMARKS.reduce((a, b) => a + b.weight * m.scores[b.id], 0) / wsum;
  m.time = 4200 / m.tps;
  m.vibes = m.scores.vibes;
});

const fmt = (v, d = 1) => v.toFixed(d);
const money = (v) => (v < 0.01 ? "$" + v.toFixed(4) : "$" + v.toFixed(2));
const monthLabel = (t) => new Date(t).toLocaleString("en", { month: "short", year: "2-digit", timeZone: "UTC" }).replace(" ", " '");

function dot(color) {
  return `<span class="dot" style="background:${color}"></span>`;
}

function badges(m) {
  const out = [];
  if (m.unreleased) out.push('<span class="badge warn" title="No publicly available API, weights, paper, or evidence">Trust me, it exists</span>');
  if (m.open) out.push('<span class="badge">Open weights</span>');
  return out.join("");
}

/* ---------- tooltip ---------- */
const tip = $("#tip");
document.addEventListener("mousemove", (e) => {
  const el = e.target.closest("[data-tip]");
  if (!el) {
    tip.hidden = true;
    return;
  }
  tip.innerHTML = el.dataset.tip;
  tip.hidden = false;
  const r = tip.getBoundingClientRect();
  let x = e.clientX + 14;
  let y = e.clientY + 14;
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14;
  if (y + r.height > innerHeight - 8) y = e.clientY - r.height - 14;
  tip.style.left = x + "px";
  tip.style.top = y + "px";
});

/* ---------- horizontal bar chart ---------- */
function barChart(el, rows, opts = {}) {
  const max = opts.max || 100;
  el.innerHTML = rows
    .map((r, i) => {
      const w = clamp((r.value / max) * 100, 0, 100);
      const ci = Math.min(w, (r.value + 2.5) / max * 100);
      const tipHtml = `<b>${esc(r.name)}</b><br>${esc(opts.label || "Score")}: ${fmt(r.value)}${r.unreleased ? "*" : ""}<br>95% CI: ±∞<br>Methodology: bro`;
      return `<div class="bar-row" style="--d:${i * 25}ms" data-tip="${esc(tipHtml)}">
        <div class="bar-label">${dot(r.color)}<span>${esc(r.name)}</span></div>
        <div class="bar-track">
          <div class="bar-fill ${r.unreleased ? "hatched" : ""}" style="width:${w}%;background:${r.color}"></div>
          <div class="whisker" style="left:${clamp(w - 1.2, 0, 100)}%;width:${clamp(ci - w + 2.4, 0, 100)}%"></div>
        </div>
        <div class="bar-value">${fmt(r.value)}${r.unreleased ? "*" : ""}</div>
      </div>`;
    })
    .join("");
}

/* ---------- scatter ---------- */
function niceTicks(lo, hi, n = 6) {
  const step0 = (hi - lo) / n;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 5, 10].map((k) => k * mag).find((s) => s >= step0) || mag * 10;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(v);
  return out;
}

function scatter(el, pts, o) {
  const W = 960, H = 500, m = { l: 62, r: 30, t: 24, b: 56 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const xs = pts.map((p) => p.x);
  let xmin = Math.min(...xs), xmax = Math.max(...xs);
  const log = o.scale === "log";
  const tx = (v) => (log ? Math.log10(v) : v);
  let lo = tx(xmin), hi = tx(xmax);
  const padx = (hi - lo) * 0.07 || 1;
  lo -= padx;
  hi += padx;
  const ymin = Math.floor((Math.min(...pts.map((p) => p.y)) - 4) / 5) * 5;
  const ymax = Math.min(100, Math.ceil((Math.max(...pts.map((p) => p.y)) + 3) / 5) * 5);
  const X = (v) => m.l + ((tx(v) - lo) / (hi - lo)) * iw;
  const Y = (v) => m.t + ih - ((v - ymin) / (ymax - ymin)) * ih;

  let xticks;
  if (o.scale === "time") {
    xticks = [];
    const d = new Date(lo + 0);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMonth(Math.floor(d.getUTCMonth() / 2) * 2);
    for (; d.getTime() <= hi; d.setUTCMonth(d.getUTCMonth() + 2)) if (d.getTime() >= lo) xticks.push(d.getTime());
  } else if (log) {
    xticks = [];
    for (let e = Math.floor(lo); e <= Math.ceil(hi); e++) [1, 3].forEach((k) => {
      const v = k * Math.pow(10, e);
      if (tx(v) >= lo && tx(v) <= hi) xticks.push(v);
    });
  } else xticks = niceTicks(lo, hi);
  const yticks = niceTicks(ymin, ymax, 6);

  const better = o.better;
  const sorted = [...pts].sort((a, b) => (better === "low" ? a.x - b.x : b.x - a.x));
  let best = -Infinity;
  const front = [];
  sorted.forEach((p) => {
    if (p.y > best) {
      best = p.y;
      front.push(p);
    }
  });
  front.sort((a, b) => a.x - b.x);
  let path = "";
  if (front.length) {
    if (better === "low") {
      path = `M${X(front[0].x)},${Y(front[0].y)}`;
      for (let i = 1; i < front.length; i++) path += `H${X(front[i].x)}V${Y(front[i].y)}`;
      path += `H${m.l + iw}`;
    } else {
      path = `M${m.l},${Y(front[0].y)}H${X(front[0].x)}`;
      for (let i = 1; i < front.length; i++) path += `V${Y(front[i].y)}H${X(front[i].x)}`;
    }
  }

  const medY = [...pts.map((p) => p.y)].sort((a, b) => a - b)[Math.floor(pts.length / 2)];
  const medX = [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  let quad = "";
  if (o.quadrant) {
    const qx = better === "low" ? m.l : X(medX);
    const qw = better === "low" ? X(medX) - m.l : m.l + iw - X(medX);
    quad = `<rect class="quad" x="${qx}" y="${m.t}" width="${qw}" height="${Y(medY) - m.t}"/><text class="quad-label" x="${qx + 10}" y="${Y(medY) - 10}">Most attractive quadrant</text>`;
  }

  const grid =
    yticks.map((v) => `<line class="grid" x1="${m.l}" x2="${m.l + iw}" y1="${Y(v)}" y2="${Y(v)}"/><text class="tick" x="${m.l - 10}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("") +
    xticks.map((v) => `<line class="grid v" x1="${X(v)}" x2="${X(v)}" y1="${m.t}" y2="${m.t + ih}"/><text class="tick" x="${X(v)}" y="${m.t + ih + 20}" text-anchor="middle">${o.fmtX(v)}</text>`).join("");

  const placed = [];
  const labelOk = new Set();
  [...pts]
    .sort((a, b) => (front.includes(b) || b.unreleased) - (front.includes(a) || a.unreleased) || b.y - a.y)
    .forEach((p) => {
      const w = p.name.replace(/ \(.*\)/, "").length * 6 + 18;
      const r = { x1: X(p.x) + 6, x2: X(p.x) + 6 + w, y1: Y(p.y) - 8, y2: Y(p.y) + 8 };
      const hitDot = pts.some((q) => q !== p && X(q.x) + 10 > r.x1 && X(q.x) - 10 < r.x2 && Y(q.y) + 10 > r.y1 && Y(q.y) - 10 < r.y2);
      const hit = hitDot || placed.some((q) => r.x1 < q.x2 && r.x2 > q.x1 && r.y1 < q.y2 && r.y2 > q.y1);
      const out = r.x2 > W - 4;
      if (!hit && !out) {
        placed.push(r);
        labelOk.add(p);
      }
    });

  const dots = pts
    .map((p) => {
      const cx = X(p.x), cy = Y(p.y);
      const onFront = front.includes(p);
      const tipHtml = `<b>${esc(p.name)}</b><br>${esc(p.creator)}<br>${esc(o.xLabel)}: ${esc(o.fmtX(p.x))}<br>${esc(o.yLabel)}: ${fmt(p.y)}${p.unreleased ? "*" : ""}`;
      return `<g class="pt" data-tip="${esc(tipHtml)}">
        <circle cx="${cx}" cy="${cy}" r="${p.unreleased ? 8 : 6.5}" fill="${p.color}" ${p.unreleased ? 'stroke="#fff" stroke-width="2" stroke-dasharray="3 2"' : 'stroke="var(--bg)" stroke-width="1.5"'}/>
        ${labelOk.has(p) ? `<text class="plabel ${onFront || p.unreleased ? "strong" : ""}" x="${cx + 11}" y="${cy + 4}">${esc(p.name.replace(/ \(.*\)/, ""))}${p.unreleased ? "*" : ""}</text>` : ""}
      </g>`;
    })
    .join("");

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.yLabel)} versus ${esc(o.xLabel)}">
    ${quad}${grid}
    <line class="axis" x1="${m.l}" x2="${m.l + iw}" y1="${m.t + ih}" y2="${m.t + ih}"/>
    <line class="axis" x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${m.t + ih}"/>
    <path class="pareto" d="${path}"/>
    ${dots}
    <text class="axis-title" x="${m.l + iw / 2}" y="${H - 10}" text-anchor="middle">${esc(o.xLabel)}</text>
    <text class="axis-title" transform="translate(16 ${m.t + ih / 2}) rotate(-90)" text-anchor="middle">${esc(o.yLabel)}</text>
  </svg>`;
}

function legend(el, models) {
  const seen = [...new Set(models.map((m) => m.creator))];
  el.innerHTML = seen.map((c) => `<span class="chip">${dot(CREATORS[c])}${esc(c)}</span>`).join("") + `<span class="chip"><span class="dot ring"></span>* Unreleased / unverifiable</span><span class="chip"><span class="pl"></span>Pareto line</span>`;
}

/* ---------- Intelligence index section ---------- */
let filter = "all";
let showAll = false;

function renderIndex() {
  let list = MODELS.filter((m) => {
    if (filter === "open") return m.open;
    if (filter === "closed") return !m.open && !m.unreleased;
    if (filter === "unreleased") return m.unreleased;
    return true;
  }).sort((a, b) => b.index - a.index);
  const total = list.length;
  if (!showAll) list = list.slice(0, 12);
  barChart(
    $("#index-chart"),
    list.map((m) => ({ name: m.name, value: m.index, color: CREATORS[m.creator], unreleased: m.unreleased })),
    { label: "TMB Intelligence Index" }
  );
  $("#index-count").textContent = `${list.length} of ${total} models`;
  $("#toggle-all").textContent = showAll ? "Show top 12" : "Show all models";
  $("#toggle-all").hidden = total <= 12;
}

$$("#index-filters button").forEach((b) =>
  b.addEventListener("click", () => {
    $$("#index-filters button").forEach((x) => x.classList.toggle("on", x === b));
    filter = b.dataset.f;
    renderIndex();
  })
);
$("#toggle-all").addEventListener("click", () => {
  showAll = !showAll;
  renderIndex();
});

/* ---------- tradeoff ---------- */
const AXES = {
  cost: { label: "Cost per TMB Task (USD, log scale)", x: (m) => m.cost, scale: "log", better: "low", fmtX: (v) => (v < 1 ? "$" + +v.toPrecision(2) : "$" + v) },
  time: { label: "Time per TMB Task (seconds, log scale)", x: (m) => m.time, scale: "log", better: "low", fmtX: (v) => (v < 1 ? v.toFixed(2) + "s" : +v.toPrecision(2) + "s") },
  speed: { label: "Output speed (tokens / second)", x: (m) => Math.min(m.tps, 1000), scale: "linear", better: "high", fmtX: (v) => Math.round(v) },
  vibes: { label: "Vibes (out of 100)", x: (m) => m.vibes, scale: "linear", better: "high", fmtX: (v) => Math.round(v) },
};
let axis = "cost";

function renderTradeoff() {
  const a = AXES[axis];
  const pts = MODELS.map((m) => ({ name: m.name, creator: m.creator, color: CREATORS[m.creator], unreleased: m.unreleased, x: a.x(m), y: m.index }));
  scatter($("#tradeoff-chart"), pts, { scale: a.scale, better: a.better, quadrant: true, xLabel: a.label, yLabel: "TMB Intelligence Index", fmtX: a.fmtX });
  legend($("#tradeoff-legend"), MODELS);
}
$$("#tradeoff-tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    $$("#tradeoff-tabs button").forEach((x) => x.classList.toggle("on", x === b));
    axis = b.dataset.a;
    renderTradeoff();
  })
);

/* ---------- timeline ---------- */
function renderTimeline() {
  const pts = MODELS.map((m) => ({ name: m.name, creator: m.creator, color: CREATORS[m.creator], unreleased: m.unreleased, x: Date.parse(m.date + "-01T00:00:00Z") + hash(m.id) * 20 * 86400000, y: m.index }));
  scatter($("#timeline-chart"), pts, { scale: "time", better: "low", quadrant: false, xLabel: "Release date", yLabel: "TMB Intelligence Index", fmtX: monthLabel });
  legend($("#timeline-legend"), MODELS);
}

/* ---------- benchmarks ---------- */
let curBench = BENCHMARKS[0].id;
function renderBenchTabs() {
  $("#bench-tabs").innerHTML = BENCHMARKS.map((b) => `<button class="${b.id === curBench ? "on" : ""}" data-b="${b.id}">${esc(b.name)}</button>`).join("");
  $$("#bench-tabs button").forEach((btn) =>
    btn.addEventListener("click", () => {
      curBench = btn.dataset.b;
      renderBenchTabs();
      renderBench();
    })
  );
}
function renderBench() {
  const b = BENCHMARKS.find((x) => x.id === curBench);
  $("#bench-name").textContent = b.name;
  $("#bench-cat").textContent = b.cat;
  $("#bench-desc").textContent = b.desc;
  $("#bench-src").textContent = b.inspired || "";
  $("#bench-weight").textContent = b.weight.toFixed(1) + "x";
  const rows = MODELS.map((m) => ({ name: m.name, value: m.scores[b.id], color: CREATORS[m.creator], unreleased: m.unreleased }))
    .sort((a, c) => c.value - a.value)
    .slice(0, 14);
  barChart($("#bench-chart"), rows, { label: b.name });
}

/* ---------- eval grid ---------- */
function renderGrid() {
  $("#eval-grid").innerHTML = BENCHMARKS.map((b) => {
    const top = [...MODELS].sort((x, y) => y.scores[b.id] - x.scores[b.id]).slice(0, 3);
    return `<button class="card evalcard" data-b="${b.id}">
      <div class="evalcard-head"><span class="eyebrow">${esc(b.cat)}</span><span class="w">${b.weight.toFixed(1)}x</span></div>
      <h4>${esc(b.name)}</h4>
      <ol>${top.map((m) => `<li>${dot(CREATORS[m.creator])}<span>${esc(m.name.replace(/ \(.*\)/, ""))}${m.unreleased ? "*" : ""}</span><b>${fmt(m.scores[b.id])}</b></li>`).join("")}</ol>
    </button>`;
  }).join("");
  $$(".evalcard").forEach((c) =>
    c.addEventListener("click", () => {
      curBench = c.dataset.b;
      renderBenchTabs();
      renderBench();
      $("#benchmark-detail").scrollIntoView({ behavior: "smooth", block: "start" });
    })
  );
}

/* ---------- reproducibility ---------- */
const CODE_STATUS = ["No", "Coming soon", "Coming soon", "Available on request*", "In the appendix", "Deleted", "A screenshot"];
const REPRO = ["Not attempted", "Could not run", "Rate limited", "Different number (cannot say which)", "Repo returns 404", "Matched (n = 1)", "Seed 4 only"];
function renderRepro() {
  const list = [...MODELS].sort((a, b) => b.index - a.index).slice(0, 10);
  $("#repro-body").innerHTML = list
    .map((m) => {
      const claimed = Math.min(99.9, m.index * (1.05 + hash(m.id + "c") * 0.06));
      const r = REPRO[Math.floor(hash(m.id + "r") * REPRO.length)];
      const c = CODE_STATUS[Math.floor(hash(m.id + "k") * CODE_STATUS.length)];
      const trust = Math.round(clamp(100 - hash(m.id + "t") * 55 + (m.unreleased ? 40 : 0), 0, 100));
      return `<tr>
        <td><span class="cell-model">${dot(CREATORS[m.creator])}${esc(m.name)}${m.unreleased ? "*" : ""}</span></td>
        <td class="num">${fmt(claimed)}</td>
        <td class="num">${fmt(m.index)}</td>
        <td>${esc(r)}</td>
        <td>${esc(c)}</td>
        <td><span class="bros" title="${trust} bros">${"🤝".repeat(Math.max(1, Math.round(trust / 20)))}</span></td>
      </tr>`;
    })
    .join("");
}

/* ---------- tweets ---------- */
function renderTweets() {
  $("#tweet-grid").innerHTML = TWEETS.map(
    (t) => `<figure class="card tweet">
      <div class="tweet-head"><b>${esc(t.handle)}</b><span>${esc(t.date)}</span></div>
      <blockquote>${esc(t.text)}</blockquote>
      <figcaption><span class="badge">${esc(t.tag)}</span><span class="eng">Engagement: ${esc(t.eng)}</span></figcaption>
    </figure>`
  ).join("");
}

/* ---------- changelog ---------- */
function renderChangelog() {
  $("#changelog").innerHTML = CHANGELOG.map(([d, k, t]) => `<li><span class="cl-date">${esc(d)}</span><span class="cl-kind">${esc(k)}</span><span class="cl-title">${esc(t)}</span></li>`).join("");
}

/* ---------- theme ---------- */
const root = document.documentElement;
const saved = localStorage.getItem("tmb-theme");
if (saved) root.dataset.theme = saved;
$("#theme").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("tmb-theme", next);
});

/* ---------- counters ---------- */
$("#stat-models").textContent = MODELS.length;
$("#stat-benchmarks").textContent = BENCHMARKS.length;

renderIndex();
renderTradeoff();
renderTimeline();
renderBenchTabs();
renderBench();
renderGrid();
renderRepro();
renderTweets();
renderChangelog();

/* ---------- nav highlight ---------- */
const links = $$(".nav a[href^='#']");
const obs = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id))),
  { rootMargin: "-40% 0px -55% 0px" }
);
links.forEach((l) => {
  const s = $(l.getAttribute("href"));
  if (s) obs.observe(s);
});
