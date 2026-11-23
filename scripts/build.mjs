// Generates assets/banner.svg (the project cards come from scripts/cards.mjs).
// Run: node scripts/build.mjs
import { writeFileSync } from "node:fs";

const CYAN = "#22d3ee";
const MAGENTA = "#d946ef";
const AMBER = "#fbbf24";
const FONT = "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";
const MONO = "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, Menlo, monospace";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- banner: my name on a dark grid, no picture ----------
function banner() {
  const W = 1200, H = 340, cx = W / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#060a14"/><stop offset="1" stop-color="#120a24"/>
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}"/><stop offset=".55" stop-color="#a78bfa"/><stop offset="1" stop-color="${MAGENTA}"/>
    </linearGradient>
    <radialGradient id="glowC" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${CYAN}" stop-opacity=".22"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowM" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${MAGENTA}" stop-opacity=".2"/><stop offset="1" stop-color="${MAGENTA}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="#ffffff" stroke-opacity=".045"/>
    </pattern>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  </defs>
  <style>
    .fade { opacity: 0; animation: in 1s ease-out forwards; }
    @keyframes in { to { opacity: 1; } }
    .cur { animation: cur 1s steps(1) infinite; } @keyframes cur { 50% { opacity: 0; } }
    .drift { animation: drift 9s ease-in-out infinite alternate; }
    @keyframes drift { to { transform: translateX(60px); } }
    .scan { animation: scan 6s linear infinite; } @keyframes scan { from { transform: translateY(-20px); } to { transform: translateY(${H + 20}px); } }
  </style>

  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <circle class="drift" cx="300" cy="120" r="260" fill="url(#glowC)"/>
    <circle class="drift" cx="900" cy="240" r="260" fill="url(#glowM)" style="animation-direction:alternate-reverse"/>
    <rect class="scan" width="${W}" height="2" fill="url(#ink)" opacity=".18"/>
  </g>

  <g class="fade" style="animation-delay:.3s" text-anchor="middle">
    <text x="${cx}" y="92" font-family="${MONO}" font-size="18" fill="${CYAN}" opacity=".85">// hi, I'm</text>
    <text x="${cx}" y="172" font-family="${FONT}" font-size="84" font-weight="800" letter-spacing="4" fill="url(#ink)">CHOKUN</text>
  </g>
  <rect class="fade" style="animation-delay:.9s" x="${cx - 260}" y="195" width="520" height="2.5" rx="1.25" fill="url(#ink)"/>
  <g class="fade" style="animation-delay:1.1s" text-anchor="middle">
    <text x="${cx}" y="238" font-family="${FONT}" font-size="24" fill="#e2e8f0">Industrial engineer who builds tools that fix slow work</text>
    <text x="${cx}" y="282" font-family="${MONO}" font-size="20" fill="#94a3b8">&gt; github: <tspan fill="${MAGENTA}">chokylion</tspan><tspan class="cur" fill="${CYAN}">▌</tspan></text>
  </g>
</svg>
`;
}

// The project cards are screenshots now: see scripts/shots.mjs and scripts/cards.mjs.
writeFileSync("assets/banner.svg", banner());
console.log("banner written");
