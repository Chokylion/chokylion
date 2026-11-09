// Generates assets/banner.svg and assets/cards/*.svg.
// Run: node scripts/build.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const CYAN = "#22d3ee";
const MAGENTA = "#d946ef";
const AMBER = "#fbbf24";
const FONT = "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";
const MONO = "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, Menlo, monospace";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- banner: a wafer being probed die by die, bin map lighting up ----------
function banner() {
  const W = 1200, H = 340, cx = 190, cy = 170, r = 128, die = 18;
  const dies = [];
  let i = 0;
  for (let y = cy - r; y < cy + r; y += die) {
    const row = [];
    for (let x = cx - r; x < cx + r; x += die) {
      // keep dies fully inside the wafer edge
      const corners = [[x, y], [x + die, y], [x, y + die], [x + die, y + die]];
      if (corners.every(([px, py]) => (px - cx) ** 2 + (py - cy) ** 2 < (r - 4) ** 2)) row.push([x, y]);
    }
    // serpentine probe path, like a real prober
    if (((y - (cy - r)) / die) % 2) row.reverse();
    for (const [x, y2] of row) {
      const fail = (i * 7919) % 23 === 0;
      dies.push(`<rect class="d ${fail ? "f" : "p"}" x="${x + 1.5}" y="${y2 + 1.5}" width="${die - 3}" height="${die - 3}" rx="2" style="animation-delay:${(i * 0.045).toFixed(3)}s"/>`);
      i++;
    }
  }
  const total = (i * 0.045 + 2).toFixed(2);

  const traces = [
    `M ${cx + r} ${cy - 40} H 380 L 410 ${cy - 70} H 470`,
    `M ${cx + r + 2} ${cy} H 470`,
    `M ${cx + r} ${cy + 40} H 380 L 410 ${cy + 70} H 470`,
    `M 470 300 H 760 L 790 270 H 1150`,
    `M 470 42 H 900 L 930 70 H 1150`,
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#060a14"/><stop offset="1" stop-color="#120a24"/>
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}"/><stop offset=".55" stop-color="#a78bfa"/><stop offset="1" stop-color="${MAGENTA}"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${CYAN}" stop-opacity=".35"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="#ffffff" stroke-opacity=".04"/>
    </pattern>
    <filter id="blur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <style>
    .d { fill: #1b2440; animation: probe ${total}s linear infinite; }
    .p { --on: ${CYAN}; } .f { --on: ${MAGENTA}; }
    @keyframes probe { 0% { fill: #1b2440; } 1.5% { fill: #ffffff; } 3%, 92% { fill: var(--on); } 100% { fill: #1b2440; } }
    .t { fill: none; stroke: url(#ink); stroke-width: 2; stroke-dasharray: 900; stroke-dashoffset: 900; animation: draw 3s ease-out forwards; }
    .t2 { animation-delay: .4s; } .t3 { animation-delay: .8s; } .t4 { animation-delay: 1.2s; } .t5 { animation-delay: 1.6s; }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    .pulse { fill: #fff; filter: url(#blur); animation: blink 2.4s ease-in-out infinite; }
    @keyframes blink { 0%, 100% { opacity: .15; } 50% { opacity: 1; } }
    .fade { opacity: 0; animation: in 1s ease-out forwards; }
    @keyframes in { to { opacity: 1; } }
    .cur { animation: cur 1s steps(1) infinite; } @keyframes cur { 50% { opacity: 0; } }
    .spin { transform-origin: ${cx}px ${cy}px; animation: spin 24s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>

  <rect width="${W}" height="${H}" rx="18" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" rx="18" fill="url(#grid)"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 60}" fill="url(#glow)"/>

  <!-- wafer -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0c1222" stroke="#3b4a72" stroke-width="2"/>
  <circle class="spin" cx="${cx}" cy="${cy}" r="${r + 14}" fill="none" stroke="${CYAN}" stroke-opacity=".35" stroke-dasharray="4 10"/>
  <rect x="${cx - 14}" y="${cy + r - 4}" width="28" height="8" fill="#060a14"/>
  ${dies.join("\n  ")}

  <!-- traces -->
  ${traces.map((d, k) => `<path class="t t${k + 1}" d="${d}"/>`).join("\n  ")}
  <circle class="pulse" cx="470" cy="${cy - 70}" r="4"/>
  <circle class="pulse" cx="470" cy="${cy}" r="4" style="animation-delay:.8s"/>
  <circle class="pulse" cx="470" cy="${cy + 70}" r="4" style="animation-delay:1.6s"/>

  <!-- text -->
  <g class="fade" style="animation-delay:.6s">
    <text x="500" y="98" font-family="${MONO}" font-size="18" fill="${CYAN}" opacity=".85">// สวัสดีครับ, hello world</text>
    <text x="496" y="172" font-family="${FONT}" font-size="78" font-weight="800" letter-spacing="2" fill="url(#ink)">CHOKYLION</text>
  </g>
  <g class="fade" style="animation-delay:1.3s">
    <text x="500" y="214" font-family="${FONT}" font-size="23" fill="#e2e8f0">Industrial Engineer · Game Dev · 3D &amp; Animation · Automation</text>
    <text x="500" y="256" font-family="${MONO}" font-size="20" fill="#94a3b8">&gt; status: <tspan fill="${MAGENTA}">builds everything</tspan><tspan class="cur" fill="${CYAN}">▌</tspan></text>
  </g>
</svg>
`;
}

// ---------- project cards ----------
const ACCENT = { eng: CYAN, game: MAGENTA, art: AMBER };

function wrap(text, max) {
  const lines = [""];
  for (const w of text.split(" ")) {
    const cur = lines[lines.length - 1];
    if ((cur + " " + w).trim().length > max) lines.push(w);
    else lines[lines.length - 1] = (cur + " " + w).trim();
  }
  return lines.slice(0, 2);
}

function card({ id, cat, icon, title, desc, tags, kind }) {
  const W = 460, H = 172, a = ACCENT[cat];
  const badge = { live: "▶ PLAY LIVE", repo: "◆ OPEN REPO", watch: "▶ WATCH", private: "● PRIVATE" }[kind];
  const lines = wrap(desc, 50);
  let x = 24;
  const chips = tags.map((t) => {
    const w = t.length * 7.4 + 18;
    const g = `<rect x="${x}" y="128" width="${w}" height="24" rx="12" fill="${a}" fill-opacity=".12" stroke="${a}" stroke-opacity=".35"/><text x="${x + w / 2}" y="144.5" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${a}">${esc(t)}</text>`;
    x += w + 8;
    return g;
  });
  const bw = badge.length * 8 + 22;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#110b22"/></linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${a}" stop-opacity="0"/><stop offset=".5" stop-color="${a}"/><stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="c"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  </defs>
  <style>
    .sh { animation: sh 4s ease-in-out infinite; } @keyframes sh { 0% { transform: translateX(-${W}px); } 60%, 100% { transform: translateX(${W}px); } }
    .bd { animation: bd 3s ease-in-out infinite; } @keyframes bd { 0%, 100% { stroke-opacity: .35; } 50% { stroke-opacity: .9; } }
  </style>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="${W - 30}" cy="20" r="90" fill="${a}" fill-opacity=".07"/>
    <rect class="sh" width="${W}" height="3" fill="url(#shine)"/>
  </g>
  <rect class="bd" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15" fill="none" stroke="${a}"/>
  <rect x="24" y="22" width="46" height="46" rx="12" fill="${a}" fill-opacity=".14" stroke="${a}" stroke-opacity=".5"/>
  <text x="47" y="54" text-anchor="middle" font-size="24">${icon}</text>
  <text x="84" y="52" font-family="${FONT}" font-size="22" font-weight="700" fill="#f1f5f9">${esc(title)}</text>
  <rect x="${W - bw - 18}" y="128" width="${bw}" height="24" rx="12" fill="${kind === "private" ? "#334155" : a}" fill-opacity="${kind === "private" ? ".6" : ".95"}"/>
  <text x="${W - bw / 2 - 18}" y="144.5" text-anchor="middle" font-family="${MONO}" font-size="11.5" font-weight="700" fill="${kind === "private" ? "#cbd5e1" : "#0b1020"}">${badge}</text>
  ${lines.map((l, k) => `<text x="24" y="${92 + k * 21}" font-family="${FONT}" font-size="15" fill="#a5b4cf">${esc(l)}</text>`).join("\n  ")}
  ${chips.join("\n  ")}
</svg>
`;
}

export const PROJECTS = [
  // engineering & tools
  { id: "wafer-sort-dmaic", cat: "eng", icon: "🏭", title: "Wafer Sort MH · DMAIC", desc: "Lean-first material-handling project for a wafer sort floor at Analog Devices", tags: ["Lean", "DMAIC", "Six Sigma"], kind: "private" },
  { id: "oee-automation", cat: "eng", icon: "📈", title: "OEE & Headcount Auto", desc: "Power BI automation for OEE and headcount reporting", tags: ["Power BI", "Excel"], kind: "private" },
  { id: "wafer-probe-random", cat: "eng", icon: "🔬", title: "Wafer Probe Random", desc: "Reference random-pick machine for wafer probe sampling", tags: ["HTML", "JS"], kind: "live" },
  { id: "router-skill", cat: "eng", icon: "🧭", title: "/router skill", desc: "Multi-agent team loop: Analyst → specialists → QA → CEO review", tags: ["AI agents", "Shell"], kind: "repo" },
  { id: "gooseminton", cat: "eng", icon: "🏸", title: "Gooseminton", desc: "Badminton club tracker web app", tags: ["Vercel", "Supabase"], kind: "repo" },
  // games
  { id: "claude-racer", cat: "game", icon: "🏎️", title: "Claude Racer", desc: "Drag-strip racer with manual gear shifting, a tachometer and an upgrade shop", tags: ["Electron", "JS"], kind: "live" },
  { id: "cholf", cat: "game", icon: "⛳", title: "Cholf", desc: "Online party mini-golf to play with friends in the browser", tags: ["Multiplayer", "JS"], kind: "live" },
  { id: "ensense", cat: "game", icon: "🧠", title: "Ensense", desc: "Daily perception puzzle game. New challenge every day", tags: ["TypeScript", "Daily"], kind: "live" },
  { id: "airpod-tilt", cat: "game", icon: "🎧", title: "AirPod Motion Games", desc: "Tilt your head to play, using AirPods motion sensors as the controller", tags: ["Swift", "Supabase"], kind: "private" },
  { id: "lucky-draw", cat: "game", icon: "🎰", title: "Lucky Draw Machines", desc: "Offline lucky-draw machines: Gacha, Wafer and Halloween editions", tags: ["HTML", "JS"], kind: "live" },
  { id: "popcat", cat: "game", icon: "🎃", title: "Pop-Cat Halloween", desc: "Halloween pop-cat clicking game, backed by Supabase", tags: ["HTML", "Supabase"], kind: "repo" },
  // 3D & animation
  { id: "imi-workstation", cat: "art", icon: "🎬", title: "IMI Workstation 3D", desc: "80-second 3D teardown explainer of an inspection workstation", tags: ["3D", "Remotion"], kind: "watch" },
  { id: "stadium-seatview", cat: "art", icon: "🏟️", title: "Stadium Seat-view", desc: "Pick a seat and preview the view from it in 3D", tags: ["Three.js", "WebGL"], kind: "live" },
  { id: "promptfung", cat: "art", icon: "🎞️", title: "promptfung · พร้อมฟัง", desc: "Thai 2D animated story series, fully made in code", tags: ["Remotion", "SVG", "TTS"], kind: "private" },
];

mkdirSync("assets/cards", { recursive: true });
writeFileSync("assets/banner.svg", banner());
for (const p of PROJECTS) writeFileSync(`assets/cards/${p.id}.svg`, card(p));
console.log(`banner + ${PROJECTS.length} cards written`);
