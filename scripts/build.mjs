// Generates assets/banner.svg (the project cards come from scripts/cards.mjs).
// Run: node scripts/build.mjs
import { writeFileSync } from "node:fs";

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
    <text x="500" y="98" font-family="${MONO}" font-size="18" fill="${CYAN}" opacity=".85">// hi, I'm</text>
    <text x="496" y="172" font-family="${FONT}" font-size="78" font-weight="800" letter-spacing="2" fill="url(#ink)">CHOKUN</text>
  </g>
  <g class="fade" style="animation-delay:1.3s">
    <text x="500" y="214" font-family="${FONT}" font-size="23" fill="#e2e8f0">Industrial engineer who builds tools that fix slow work</text>
    <text x="500" y="256" font-family="${MONO}" font-size="20" fill="#94a3b8">&gt; github: <tspan fill="${MAGENTA}">chokylion</tspan><tspan class="cur" fill="${CYAN}">▌</tspan></text>
  </g>
</svg>
`;
}

// The project cards are screenshots now: see scripts/shots.mjs and scripts/cards.mjs.
writeFileSync("assets/banner.svg", banner());
console.log("banner written");
