// Builds the README as white, dot-grid SVG cards and writes README.md to show them.
// Every card has a desktop and a mobile version; README.md picks one with <picture>.
// Content comes from scripts/readme-content.mjs.
//
// Usage: node scripts/build-readme.mjs [--refresh-badges] [--debug]
//   --refresh-badges  download every tech stack badge again into assets/stack/
//   --debug           tag wrapped text with its wrap width, so a browser check can confirm it fits
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { about, beyond, focus, leadership, principles, profile, stack } from "./readme-content.mjs";

const OUT = "assets/readme";
const BADGE_DIR = "assets/stack";
const REFRESH = process.argv.includes("--refresh-badges");
const DEBUG = process.argv.includes("--debug");
// <source srcset> needs an absolute URL on GitHub; <img src> can stay relative.
const RAW = `https://raw.githubusercontent.com/${profile.repo}/main/`;
const MOBILE_QUERY = "(max-width: 767px)";

const T = {
  font: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif",
  mono: "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
  ink: "#0F172A",
  body: "#334155",
  soft: "#475569",
  muted: "#64748B",
  border: "#E2E8F0",
  rule: "#EEF2F7",
  dot: "#CBD5E1",
  accent: "#2563EB",
  accentDeep: "#1D4ED8",
  accentSoft: "#EFF6FF",
  accentLine: "#BFDBFE",
  accentMid: "#93C5FD",
  indigo: "#6366F1",
};

const VARIANTS = [
  { name: "desktop", suffix: "", w: 880, pad: 44, cols: 2, principleCols: 3, body: 15.5, bodyLh: 26 },
  { name: "mobile", suffix: "-mobile", w: 420, pad: 26, cols: 1, principleCols: 1, body: 15, bodyLh: 24 },
];

// ---------- text measurement ----------
// Approximate glyph widths in 1/1000 em (Helvetica/Arial metrics), padded by SAFETY so wrapped
// lines still fit when the viewer's font is Segoe UI, San Francisco or Liberation Sans.
const GLYPH = new Map();
const glyphs = (chars, width) => { for (const ch of chars) GLYPH.set(ch, width); };
glyphs(" ", 278); glyphs("ijl'|’", 222); glyphs("ft.,:;!/I", 278); glyphs("r-()[]", 333); glyphs('"', 355);
glyphs("cksvxyzJ", 500); glyphs("abdeghnopqu0123456789?#$", 556); glyphs("+=<>", 584); glyphs("L", 556);
glyphs("FTZ", 611); glyphs("ABEKPSVXY&", 667); glyphs("wCDHNRU", 722); glyphs("GOQ", 778); glyphs("mM", 833);
glyphs("%", 889); glyphs("W", 944); glyphs("—", 1000); glyphs("–", 556); glyphs("·", 333); glyphs(" ", 500);
const SAFETY = 1.1;

const textWidth = (str, size, weight = 400, spacing = 0) => {
  let units = 0;
  for (const ch of str) units += GLYPH.get(ch) ?? 600;
  return (units / 1000) * size * SAFETY * (weight >= 600 ? 1.07 : 1) + spacing * [...str].length;
};

const wrap = (str, width, size, weight = 400) => {
  const lines = [];
  let line = "";
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size, weight) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

// ---------- SVG building blocks ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (v) => Math.round(v * 100) / 100;

const text = (lines, x, y, { size, lh = 0, fill, weight = 400, spacing = 0, family = "", maxWidth = 0 }) => {
  const attrs = [`x="${num(x)}"`, `y="${num(y)}"`, `font-size="${size}"`, `fill="${fill}"`];
  if (weight !== 400) attrs.push(`font-weight="${weight}"`);
  if (spacing) attrs.push(`letter-spacing="${spacing}"`);
  if (family) attrs.push(`font-family="${family}"`);
  if (DEBUG && maxWidth) attrs.push(`data-w="${num(maxWidth)}"`);
  const spans = [].concat(lines).map((l, i) => `<tspan x="${num(x)}"${i ? ` dy="${lh}"` : ""}>${esc(l)}</tspan>`);
  return `<text ${attrs.join(" ")}>${spans.join("")}</text>`;
};

// A wrapped paragraph whose top edge sits at `top`. Returns its markup and bottom edge.
const para = (str, x, top, width, style) => {
  const lines = wrap(str, width, style.size, style.weight);
  const baseline = top + style.size;
  return {
    svg: text(lines, x, baseline, { ...style, maxWidth: width }),
    bottom: baseline + (lines.length - 1) * (style.lh ?? 0) + style.size * 0.3,
  };
};

const ICONS = {
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.2V12l3.2 2"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8.2 12.4l2.6 2.6 5-5.4"/>',
  arrow: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12h7M12.5 8.8l3.2 3.2-3.2 3.2"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
  network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5V12M12 12l-5.3 5.2M12 12l5.3 5.2"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 9v11"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-13"/><path d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8"/>',
};

const icon = (name, x, y, size, color, stroke = 1.8) =>
  `<g transform="translate(${num(x)} ${num(y)}) scale(${+(size / 24).toFixed(4)})" fill="none" stroke="${color}" ` +
  `stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;

// The white card: rounded border, faint dot grid that fades toward the bottom-left.
const frame = ({ w, h, label, body, defs = "", decor = "", style = "" }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<defs>
<pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${T.dot}"/></pattern>
<radialGradient id="dotsFade" cx="1" cy="0" r="1.2"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0.3"/></radialGradient>
<mask id="dotsMask"><rect width="${w}" height="${h}" fill="url(#dotsFade)"/></mask>
<clipPath id="round"><rect width="${w}" height="${h}" rx="16"/></clipPath>${defs}
</defs>${style ? `\n<style>${style}</style>` : ""}
<g clip-path="url(#round)">
<rect width="${w}" height="${h}" fill="#FFFFFF"/>
<rect width="${w}" height="${h}" fill="url(#dots)" mask="url(#dotsMask)"/>${decor}
</g>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="15.5" fill="none" stroke="${T.border}"/>
<g font-family="${T.font}">
${body}
</g>
</svg>
`;

const tile = (x, y, w, h) =>
  `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" rx="12" fill="#FFFFFF" stroke="${T.border}"/>`;

// Lays items out in equal-height tiles. `render` returns { svg, height } for one item.
const grid = (items, x, top, width, cols, gap, render) => {
  const colW = (width - gap * (cols - 1)) / cols;
  let svg = "";
  let y = top;
  for (let i = 0; i < items.length; i += cols) {
    const row = items.slice(i, i + cols).map((item, j) => {
      const tx = x + j * (colW + gap);
      return { tx, ...render(item, tx, y, colW, i + j) };
    });
    const h = Math.max(...row.map((r) => r.height));
    for (const r of row) svg += tile(r.tx, y, colW, h) + r.svg;
    y += h + gap;
  }
  return { svg, bottom: y - gap };
};

// Accent label ("ABOUT") above a section title.
const heading = (sec, x, top, width) => {
  const title = para(sec.title, x, top + 22, width, { size: 24, lh: 32, fill: T.ink, weight: 700, spacing: -0.2 });
  return {
    svg:
      `<rect x="${x}" y="${top}" width="18" height="3" rx="1.5" fill="${T.accent}"/>` +
      text(sec.label.toUpperCase(), x + 28, top + 6, { size: 12, fill: T.accent, weight: 700, spacing: 2 }) +
      title.svg,
    bottom: title.bottom,
  };
};

// ---------- cards ----------
const NETWORK = {
  nodes: { a: [700, 92], b: [800, 70], c: [758, 162], d: [668, 206], e: [830, 196], f: [752, 262], g: [652, 128] },
  edges: ["ab", "ac", "bc", "be", "cd", "ce", "cf", "df", "ef", "ag", "gd"],
  dashed: ["ag", "be"],
  centerY: 166,
};
const PULSE_CSS =
  ".pulse{transform-box:fill-box;transform-origin:center;animation:pulse 3.2s ease-out infinite}" +
  "@keyframes pulse{from{transform:scale(.55);opacity:.6}to{transform:scale(1.7);opacity:0}}" +
  "@media (prefers-reduced-motion:reduce){.pulse{animation:none;opacity:0}}";

const network = () => {
  const P = NETWORK.nodes;
  let s = "";
  for (const e of NETWORK.edges) {
    const [a, b] = [P[e[0]], P[e[1]]];
    const dash = NETWORK.dashed.includes(e) ? ' stroke-dasharray="3 5"' : "";
    s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${T.accentLine}" stroke-width="1.5"${dash}/>`;
  }
  const [cx, cy] = P.c;
  s += `<circle cx="${cx}" cy="${cy}" r="22" fill="#DBEAFE" opacity="0.7"/>`;
  s += `<circle class="pulse" cx="${cx}" cy="${cy}" r="18" fill="none" stroke="${T.accent}" stroke-width="1.5"/>`;
  for (const [k, [x, y]] of Object.entries(P)) {
    if (k === "c") s += `<circle cx="${x}" cy="${y}" r="9" fill="${T.accent}"/><circle cx="${x}" cy="${y}" r="3.2" fill="#FFFFFF"/>`;
    else if (k === "b" || k === "f") s += `<circle cx="${x}" cy="${y}" r="6" fill="${k === "b" ? "#60A5FA" : "#A5B4FC"}"/>`;
    else s += `<circle cx="${x}" cy="${y}" r="5.5" fill="#FFFFFF" stroke="${T.accentMid}" stroke-width="1.6"/>`;
  }
  return s;
};

function hero(v) {
  const desk = v.name === "desktop";
  const x = desk ? 48 : v.pad;
  const colW = desk ? 560 : v.w - 2 * v.pad;
  let body = "";

  const pill = profile.role.toUpperCase();
  const pillSize = desk ? 11.5 : 10.5;
  const pillW = textWidth(pill, pillSize, 700, 1.6) + 26;
  const top = desk ? 46 : 34;
  body += `<rect x="${x}" y="${top}" width="${num(pillW)}" height="26" rx="13" fill="${T.accentSoft}" stroke="${T.accentLine}"/>`;
  body += text(pill, x + 14, top + 17.2, { size: pillSize, fill: T.accentDeep, weight: 700, spacing: 1.6 });

  const nameSize = desk ? 46 : 36;
  const name = para(profile.name, x, top + 36, colW, { size: nameSize, lh: nameSize * 1.1, fill: T.ink, weight: 700, spacing: desk ? -0.8 : -0.5 });
  body += name.svg;

  // Focus areas on one line where they fit, breaking only between items.
  const fSize = desk ? 17 : 15;
  const sep = " · ";
  const fLines = [[]];
  for (const item of profile.focus) {
    const cur = fLines[fLines.length - 1];
    if (cur.length && textWidth([...cur, item].join(sep), fSize, 600) > colW) fLines.push([item]);
    else cur.push(item);
  }
  let fy = name.bottom + 10 + fSize;
  for (const items of fLines) {
    const spans = items.map((it, i) => (i ? `<tspan fill="${T.accentMid}">${sep}</tspan>` : "") + `<tspan>${esc(it)}</tspan>`);
    body += `<text x="${x}" y="${num(fy)}" font-size="${fSize}" font-weight="600" fill="${T.ink}">${spans.join("")}</text>`;
    fy += fSize * 1.55;
  }
  const focusBottom = fy - fSize * 1.55 + fSize * 0.3;

  const statement = para(profile.statement, x, focusBottom + 14, colW, { size: desk ? 16 : 15, lh: desk ? 26 : 24, fill: T.soft });
  body += statement.svg;

  const lineY = statement.bottom + 22;
  const metaRight = v.w - (desk ? 48 : v.pad);
  body += `<line x1="${x}" y1="${num(lineY)}" x2="${metaRight}" y2="${num(lineY)}" stroke="${T.border}"/>`;
  const mSize = desk ? 13.5 : 13;
  let mx = x;
  let my = lineY + 20 + mSize;
  for (const m of profile.meta) {
    const w = 22 + textWidth(m.text, mSize, 500);
    if (mx > x && (!desk || mx + w > metaRight)) {
      mx = x;
      my += 26;
    }
    body += icon(m.icon, mx, my - 12.5, 16, T.accent) + text(m.text, mx + 22, my, { size: mSize, fill: T.muted, weight: 500 });
    mx += w + 26;
  }
  const h = Math.ceil(my + (desk ? 34 : 28));

  const defs =
    `<linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#2563EB"/><stop offset="0.55" stop-color="#60A5FA"/><stop offset="1" stop-color="#A5B4FC"/></linearGradient>` +
    `<radialGradient id="glow"><stop offset="0" stop-color="#DBEAFE" stop-opacity="0.95"/><stop offset="1" stop-color="#DBEAFE" stop-opacity="0"/></radialGradient>`;
  const graphY = lineY / 2 + 4;
  const decor =
    `<rect width="${v.w}" height="4" fill="url(#bar)"/>` +
    (desk
      ? `<circle cx="752" cy="${num(graphY)}" r="210" fill="url(#glow)"/><g transform="translate(0 ${num(graphY - NETWORK.centerY)})">${network()}</g>`
      : `<circle cx="${v.w - 30}" cy="20" r="170" fill="url(#glow)"/>`);

  return frame({ w: v.w, h, label: `${profile.name}, ${profile.role}`, body, defs, decor, style: desk ? PULSE_CSS : "" });
}

function aboutCard(v) {
  const width = v.w - 2 * v.pad;
  const head = heading(about, v.pad, v.pad, width);
  let body = head.svg;
  let y = head.bottom + 16;
  for (const p of about.paragraphs) {
    const r = para(p, v.pad, y, width, { size: v.body, lh: v.bodyLh, fill: T.body });
    body += r.svg;
    y = r.bottom + 14;
  }
  return frame({ w: v.w, h: Math.ceil(y - 14 + v.pad), label: `${about.label}: ${about.title}`, body });
}

function focusCard(v) {
  const width = v.w - 2 * v.pad;
  const head = heading(focus, v.pad, v.pad, width);
  const g = grid(focus.items, v.pad, head.bottom + 22, width, v.cols, 16, (item, x, y, w) => {
    const p = 22;
    let s =
      `<rect x="${num(x + p)}" y="${num(y + p)}" width="38" height="38" rx="10" fill="${T.accentSoft}" stroke="#DBEAFE"/>` +
      icon(item.icon, x + p + 9, y + p + 9, 20, T.accent);
    const tx = x + p + 52;
    const tW = w - (tx - x) - p;
    const tLines = wrap(item.title, tW, 16, 700);
    s += text(tLines, tx, y + p + 24.6 - (tLines.length - 1) * 10.5, { size: 16, lh: 21, fill: T.ink, weight: 700, maxWidth: tW });
    const d = para(item.text, x + p, y + p + 54, w - 2 * p, { size: 14, lh: 22, fill: T.soft });
    return { svg: s + d.svg, height: d.bottom - y + p - 2 };
  });
  return frame({ w: v.w, h: Math.ceil(g.bottom + v.pad), label: `${focus.label}: ${focus.title}`, body: head.svg + g.svg });
}

function leadershipCard(v) {
  const width = v.w - 2 * v.pad;
  const head = heading(leadership, v.pad, v.pad, width);
  const intro = para(leadership.intro, v.pad, head.bottom + 16, width, { size: v.body, lh: v.bodyLh, fill: T.body });
  const g = grid(leadership.columns, v.pad, intro.bottom + 22, width, v.cols, 16, (col, x, y, w) => {
    const p = 22;
    const color = col.icon === "check" ? T.accent : T.indigo;
    let s = text(col.heading, x + p, y + p + 15, { size: 15.5, fill: T.ink, weight: 700 });
    let iy = y + p + 33;
    for (const item of col.items) {
      const r = para(item, x + p + 27, iy, w - 2 * p - 27, { size: 14, lh: 21.5, fill: T.body });
      s += icon(col.icon, x + p, iy + 0.7, 17, color) + r.svg;
      iy = r.bottom + 10;
    }
    return { svg: s, height: iy - 10 - y + p - 2 };
  });
  return frame({ w: v.w, h: Math.ceil(g.bottom + v.pad), label: `${leadership.label}: ${leadership.title}`, body: head.svg + intro.svg + g.svg });
}

function principlesCard(v) {
  const width = v.w - 2 * v.pad;
  const head = heading(principles, v.pad, v.pad, width);
  const g = grid(principles.items, v.pad, head.bottom + 22, width, v.principleCols, 16, (item, x, y, w, i) => {
    const p = 20;
    let s = text(String(i + 1).padStart(2, "0"), x + p, y + p + 12, { size: 12, fill: T.accent, weight: 700, family: T.mono, spacing: 1 });
    s += `<line x1="${num(x + p + 26)}" y1="${num(y + p + 8)}" x2="${num(x + p + 46)}" y2="${num(y + p + 8)}" stroke="${T.accentLine}" stroke-width="1.5"/>`;
    const t = para(item.title, x + p, y + p + 24, w - 2 * p, { size: 16, lh: 21, fill: T.ink, weight: 700 });
    const d = para(item.text, x + p, t.bottom + 8, w - 2 * p, { size: 14, lh: 21.5, fill: T.soft });
    return { svg: s + t.svg + d.svg, height: d.bottom - y + p - 2 };
  });
  return frame({ w: v.w, h: Math.ceil(g.bottom + v.pad), label: `${principles.label}: ${principles.title}`, body: head.svg + g.svg });
}

// Two layered mountain ranges with a snow cap and a pale sun, drawn in the given strip.
const RANGE_BACK = [[0, 0], [0.19, 0.56], [0.33, 0.29], [0.51, 1], [0.67, 0.5], [0.78, 0.77], [1, 0.23], [1, 0]];
const RANGE_FRONT = [[0.2, 0], [0.4, 0.38], [0.53, 0.17], [0.69, 0.62], [0.83, 0.3], [0.94, 0.46], [1, 0.36], [1, 0]];
const SNOW = [[0.51, 1], [0.4593, 0.8], [0.478, 0.835], [0.497, 0.79], [0.52, 0.84], [0.545, 0.795], [0.574, 0.8]];
const mountains = ({ x0, x1, base, height }) => {
  const pts = (shape) => shape.map(([fx, fy]) => `${num(x0 + fx * (x1 - x0))},${num(base - fy * height)}`).join(" ");
  return (
    `<circle cx="${num(x0 + 0.8 * (x1 - x0))}" cy="${num(base - 1.15 * height)}" r="${num(height * 0.14)}" fill="#DBEAFE"/>` +
    `<polygon points="${pts(RANGE_BACK)}" fill="#E8EDFB"/>` +
    `<polygon points="${pts(SNOW)}" fill="#FFFFFF"/>` +
    `<polygon points="${pts(RANGE_FRONT)}" fill="#D6E0F5"/>`
  );
};

function beyondCard(v) {
  const desk = v.name === "desktop";
  const width = desk ? 470 : v.w - 2 * v.pad;
  const head = heading(beyond, v.pad, v.pad, width);
  const p = para(beyond.text, v.pad, head.bottom + 16, width, { size: v.body, lh: v.bodyLh, fill: T.body });
  const h = Math.ceil(desk ? Math.max(p.bottom + v.pad, 250) : p.bottom + 24 + 78);
  const strip = desk ? { x0: 500, x1: v.w, base: h, height: 118 } : { x0: 0, x1: v.w, base: h, height: 62 };
  return frame({ w: v.w, h, label: `${beyond.label}: ${beyond.title}`, body: head.svg + p.svg, decor: mountains(strip) });
}

// ---------- tech stack badges ----------
const DEVICON = "https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/";
const LUCIDE = "https://cdn.jsdelivr.net/npm/lucide-static@0.460.0/icons/";
const isCompleteSvg = (s) => s.trim().endsWith("</svg>") && s.split("<svg").length === 2;

// Fetches an SVG, retrying from scratch until the body is one complete document.
const fetchSvg = (url) => {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const body = execFileSync("curl", ["-sfL", "-m", "45", url], { encoding: "utf8" });
      if (isCompleteSvg(body)) return body;
    } catch {
      // retry
    }
  }
  throw new Error(`Could not download a complete SVG from ${url.slice(0, 90)}`);
};

const minify = (svg) => svg.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
const dataUri = (svg) => "data:image/svg%2bxml;base64," + Buffer.from(minify(svg)).toString("base64");
const enc = (s) => encodeURIComponent(s.replace(/-/g, "--").replace(/_/g, "__"));
const badgeFile = (label) => label.toLowerCase().replace(/\+\+/g, "pp").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".svg";

const badgeLogo = (b) => {
  if (b.slug) return `&logo=${b.slug}&logoColor=${b.logoColor ?? "white"}`;
  if (b.lucide) return `&logo=${dataUri(fetchSvg(LUCIDE + b.lucide + ".svg").replace(/currentColor/g, "#ffffff"))}`;
  let svg = fetchSvg(DEVICON + b.devicon);
  if (b.tint) svg = svg.replace(/fill="[^"]*"/g, "").replace("<svg", `<svg fill="${b.tint}"`);
  return `&logo=${dataUri(svg)}`;
};

const loadBadge = (b) => {
  const file = `${BADGE_DIR}/${badgeFile(b.label)}`;
  if (REFRESH || !existsSync(file)) {
    const svg = fetchSvg(`https://img.shields.io/badge/${enc(b.label)}-${b.color}?style=for-the-badge${badgeLogo(b)}`);
    if (!svg.includes("<image")) throw new Error(`No logo rendered for "${b.label}"`);
    writeFileSync(file, svg);
  }
  const svg = readFileSync(file, "utf8");
  return { svg, w: Number(svg.match(/^<svg[^>]* width="([\d.]+)"/)[1]) };
};

// Nests a badge inside the card at (x, y), scaled by s.
const placeBadge = ({ svg, w }, x, y, s) =>
  svg.replace(/^<svg([^>]*?) width="[\d.]+" height="28"/, `<svg$1 x="${num(x)}" y="${num(y)}" width="${num(w * s)}" height="${num(28 * s)}" viewBox="0 0 ${w} 28"`);

function stackCard(v) {
  const desk = v.name === "desktop";
  const width = v.w - 2 * v.pad;
  const head = heading(stack, v.pad, v.pad, width);
  const s = desk ? 1 : 0.86;
  const bh = 28 * s;
  const gap = 8 * s;
  let body = head.svg;
  let y = head.bottom + 22;
  stack.groups.forEach((group, gi) => {
    if (gi) {
      body += `<line x1="${v.pad}" y1="${num(y)}" x2="${v.w - v.pad}" y2="${num(y)}" stroke="${T.rule}"/>`;
      y += 14;
    }
    let x0 = v.pad;
    let areaW = width;
    if (desk) {
      body += text(group.name, v.pad, y + bh / 2 + 5, { size: 14, fill: T.body, weight: 600 });
      x0 += 190;
      areaW -= 190;
    } else {
      body += text(group.name.toUpperCase(), v.pad, y + 11, { size: 11.5, fill: T.muted, weight: 700, spacing: 1.2 });
      y += 20;
    }
    let bx = x0;
    let by = y;
    for (const b of group.badges) {
      const badge = loadBadge(b);
      if (bx > x0 && bx + badge.w * s > x0 + areaW) {
        bx = x0;
        by += bh + gap;
      }
      body += placeBadge(badge, bx, by, s);
      bx += badge.w * s + gap;
    }
    y = by + bh + 14;
  });
  return frame({ w: v.w, h: Math.ceil(y - 14 + v.pad), label: `${stack.label}: ${stack.title}`, body });
}

// ---------- README ----------
const CARDS = [
  {
    name: "hero",
    build: hero,
    alt: `${profile.name}, ${profile.role}. ${profile.focus.join(", ")}. ${profile.statement} ${profile.meta.map((m) => m.text).join(". ")}.`,
  },
  { name: "about", build: aboutCard, alt: `${about.title}. ${about.paragraphs.join(" ")}` },
  { name: "focus", build: focusCard, alt: `${focus.title}. ${focus.items.map((i) => `${i.title}: ${i.text}`).join(" ")}` },
  {
    name: "leadership",
    build: leadershipCard,
    alt: `${leadership.title}. ${leadership.intro} ${leadership.columns.map((c) => `${c.heading}: ${c.items.join("; ")}.`).join(" ")}`,
  },
  { name: "principles", build: principlesCard, alt: `${principles.title}. ${principles.items.map((i) => `${i.title}: ${i.text}`).join(" ")}` },
  { name: "beyond", build: beyondCard, alt: `${beyond.title}. ${beyond.text}` },
  {
    name: "stack",
    build: stackCard,
    alt: `${stack.title}. ${stack.groups.map((g) => `${g.name}: ${g.badges.map((b) => b.label).join(", ")}.`).join(" ")}`,
  },
];

const picture = (card) => `<p align="center">
  <picture>
    <source media="${MOBILE_QUERY}" srcset="${RAW}${OUT}/${card.name}-mobile.svg">
    <img src="${OUT}/${card.name}.svg" alt="${esc(card.alt)}">
  </picture>
</p>`;

const links = profile.links
  .map((l) => `  <a href="${l.href}"><img src="https://img.shields.io/badge/${enc(l.label)}-${enc(l.text)}-${l.color}?style=for-the-badge&logo=${l.logo}&logoColor=white" alt="${esc(l.label)}"></a>`)
  .join("\n");

mkdirSync(OUT, { recursive: true });
for (const card of CARDS) {
  for (const v of VARIANTS) writeFileSync(`${OUT}/${card.name}${v.suffix}.svg`, card.build(v));
}

const blocks = CARDS.map(picture);
blocks.splice(1, 0, `<p align="center">\n${links}\n</p>`);
const readme =
  "<!-- Generated by scripts/build-readme.mjs from scripts/readme-content.mjs. Edit the content there, then run: node scripts/build-readme.mjs -->\n\n" +
  blocks.join("\n\n") +
  "\n";
writeFileSync("README.md", readme);
console.log(`Wrote ${CARDS.length * VARIANTS.length} cards to ${OUT}/ and README.md`);
