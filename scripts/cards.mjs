// Builds assets/cards/<id>.jpg: one screenshot card per project (headless Edge renders the HTML card at 2x,
// Pillow turns it into a JPEG). Screenshots of live sites come from `node scripts/shots.mjs` into .shots/.
// Private work never gets a screenshot: it gets a number tile instead.
// Run: node scripts/shots.mjs && node scripts/cards.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { pathToFileURL } from 'node:url';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT = resolve('.');
const SHOTS = join(ROOT, '.shots');
const ACCENT = { work: '#22d3ee', fun: '#d946ef' };
const W = 460, H = 400;

export const PROJECTS = [
  // tools I built for work
  { id: 'adi-automation', sec: 'work', title: 'Production-line report automation', kind: 'private',
    tile: ['90 min → 1–3 min', 'n8n + AI workflow'],
    line: 'A manual 90-minute data task at Analog Devices now runs by itself in 1–3 minutes, with near-zero errors.',
    tags: ['n8n', 'AI / LLM'] },
  { id: 'oee-automation', sec: 'work', title: 'OEE & headcount automation', kind: 'private',
    tile: ['Excel → n8n', 'OEE · headcount plan'],
    line: 'The monthly OEE and headcount numbers used to be put together by hand in Excel. Now an n8n workflow does it.',
    tags: ['n8n', 'Excel'] },
  { id: 'wafer-sort-dmaic', sec: 'work', title: 'Wafer Sort MH · DMAIC', kind: 'private',
    tile: ['DMAIC', 'wafer sort floor'],
    line: 'Senior project at Analog Devices: finding and cutting material-handling waste on the wafer sort floor.',
    tags: ['Lean', 'Six Sigma'] },
  { id: 'gooseminton', sec: 'work', title: 'Gooseminton', kind: 'repo', shot: 'gooseminton', url: 'github.com/Chokylion/badminton-app',
    line: 'Badminton ladder for my coworkers: log a match in seconds, and ratings, rankings and titles update themselves.',
    tags: ['Vercel', 'Supabase'] },
  { id: 'lucky-draw', sec: 'work', title: 'Lucky Draw Machines', kind: 'live', shot: 'lucky-gacha', url: 'chokylion.github.io/Lucky-Draw-Games',
    line: 'Load the roster from Excel, run an animated draw, export the winners back. Used at ADI events.',
    tags: ['HTML', 'JS', 'Excel'] },
  { id: 'popcat', sec: 'work', title: 'Pop-Cat Halloween', kind: 'repo', shot: 'popcat', url: 'github.com/Chokylion/popcat-event',
    line: 'Halloween tap game built for an ADI KAIZEN event: every tap counts for you and your department.',
    tags: ['JS', 'Supabase'] },
  { id: 'wafer-probe-random', sec: 'work', title: 'Wafer Probe Random', kind: 'live', shot: 'wafer-probe-random', url: 'chokylion.github.io/Wafer-Probe-Random',
    line: 'Random-pick machine for wafer probe sampling, shown at the ADI KAIZEN showcase.',
    tags: ['HTML', 'JS'] },
  { id: 'imi-workstation', sec: 'work', title: 'IMI Workstation 3D', kind: 'watch', image: join(homedir(), 'imi-workstation-video', 'poster-v2.jpg'), url: 'chokylion.github.io/imi-workstation-video',
    line: 'A 111-second 3D explainer of an inspection workstation, made from a PowerPoint spec using only AI tools.',
    tags: ['Claude Code', '3D'] },
  // things I built for fun
  { id: 'pure-strike', sec: 'fun', title: 'Pure Strike', kind: 'live', shot: 'pure-strike', url: 'pure-strike.vercel.app',
    line: 'First-person 3D golf in the browser, with online rooms for up to 6 friends.',
    tags: ['Three.js', 'Supabase'] },
  { id: 'cholf', sec: 'fun', title: 'Cholf', kind: 'live', shot: 'cholf', url: 'chokylion.github.io/golf-game',
    line: "Party mini-golf: share a room code and knock your friends' balls into the water.",
    tags: ['Multiplayer', 'JS'] },
  { id: 'claude-racer', sec: 'fun', title: 'Claude Racer', kind: 'live', shot: 'claude-racer', url: 'chokylion.github.io/claude-racer',
    line: 'Drag racer with a manual gearbox, a tachometer and an upgrade shop.',
    tags: ['Electron', 'JS'] },
  { id: 'ensense', sec: 'fun', title: 'Ensense', kind: 'live', shot: 'ensense', url: 'chokylion.github.io/ensense',
    line: 'Five tiny tests of perceptual instinct, new every day. Two minutes, one score.',
    tags: ['TypeScript', 'Daily'] },
  { id: 'stadium-seatview', sec: 'fun', title: 'Stadium Seat-view', kind: 'live', shot: 'stadium-seatview', url: 'chokylion.github.io/stadium-seatview',
    line: 'Pick a concert seat and see the stage from it in 3D.',
    tags: ['Three.js', 'TypeScript'] },
  { id: 'airpod-tilt', sec: 'fun', title: 'AirPod Motion Games', kind: 'private',
    tile: ['tilt to play', 'AirPods motion sensors'],
    line: 'Games you steer by tilting your head, using the motion sensors in AirPods.',
    tags: ['Swift', 'Supabase'] },
  { id: 'promptfung', sec: 'fun', title: 'promptfung', kind: 'private',
    tile: ['30+ episodes', 'Thai animation · from code'],
    line: 'A Thai animated story series, rendered entirely from code, with synthetic voices.',
    tags: ['Remotion', 'TTS'] },
  { id: 'router-skill', sec: 'fun', title: '/router skill', kind: 'repo', url: 'github.com/Chokylion/router-skill',
    tile: ['/router', '10 AI agents · one command'],
    line: 'A Claude Code skill that picks and chains the right AI skills for a task.',
    tags: ['Claude Code', 'AI agents'] },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const BADGE = { live: '▶ LIVE', repo: '◆ REPO', watch: '▶ WATCH', private: '● PRIVATE' };

function html(p) {
  const a = ACCENT[p.sec];
  const pic = p.tile
    ? `<div class="tile"><div class="big">${esc(p.tile[0])}</div><div class="cap">${esc(p.tile[1])}</div></div>`
    : `<img class="shot" src="${pathToFileURL(p.image || join(SHOTS, `${p.shot}.png`)).href}">`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:${W}px;height:${H}px;background:#0d1117;overflow:hidden;font-family:"Segoe UI",Arial,sans-serif}
  .card{position:absolute;inset:0;border-radius:16px;background:linear-gradient(135deg,#0b1020,#110b22);border:1.5px solid ${a}99;overflow:hidden}
  .card:before{content:"";position:absolute;right:-60px;top:-70px;width:200px;height:200px;border-radius:50%;background:${a};opacity:.08}
  .frame{position:absolute;left:14px;top:14px;width:432px;height:262px;border-radius:10px;overflow:hidden;border:1px solid ${a}66;background:#060a14}
  .bar{height:22px;background:#111827;display:flex;align-items:center;padding:0 9px;gap:5px}
  .dot{width:7px;height:7px;border-radius:50%;opacity:.85}
  .url{margin-left:8px;font:10px "Cascadia Code",Consolas,monospace;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px}
  .badge{margin-left:auto;font:700 9.5px "Cascadia Code",Consolas,monospace;padding:2px 8px;border-radius:9px;
         background:${p.kind === 'private' ? '#334155' : a};color:${p.kind === 'private' ? '#cbd5e1' : '#0b1020'}}
  .shot{display:block;width:100%;height:240px;object-fit:cover;object-position:top center}
  .tile{height:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;
        background:radial-gradient(circle at 28% 22%,${a}33,transparent 60%),
                   repeating-linear-gradient(0deg,#ffffff07 0 1px,transparent 1px 22px),
                   repeating-linear-gradient(90deg,#ffffff07 0 1px,transparent 1px 22px),linear-gradient(135deg,#0b1222,#150d2a)}
  .big{font-weight:800;font-size:40px;letter-spacing:.5px;background:linear-gradient(90deg,#22d3ee,#a78bfa,#d946ef);
       -webkit-background-clip:text;background-clip:text;color:transparent}
  .cap{margin-top:10px;font:12px "Cascadia Code",Consolas,monospace;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase}
  h3{position:absolute;left:18px;right:18px;top:288px;margin:0;font-size:19px;font-weight:700;color:#f1f5f9}
  p{position:absolute;left:18px;right:18px;top:316px;margin:0;font-size:13.5px;line-height:1.4;color:#a5b4cf;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .tags{position:absolute;left:18px;bottom:14px;display:flex;gap:7px}
  .tag{font:11px "Cascadia Code",Consolas,monospace;color:${a};border:1px solid ${a}59;background:${a}1f;border-radius:10px;padding:2px 9px}
  </style></head><body><div class="card">
  <div class="frame"><div class="bar"><span class="dot" style="background:#ef4444"></span><span class="dot" style="background:#f59e0b"></span>
  <span class="dot" style="background:#22c55e"></span><span class="url">${esc(p.url || 'internal · not public')}</span><span class="badge">${BADGE[p.kind]}</span></div>${pic}</div>
  <h3>${esc(p.title)}</h3><p>${esc(p.line)}</p>
  <div class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
  </div></body></html>`;
}

function render(p, outJpg) {
  const work = mkdtempSync(join(tmpdir(), 'card-'));
  try {
    const page = join(work, 'card.html'), png = join(work, 'card.png');
    writeFileSync(page, html(p));
    // Headless Edge now and then fails to exit when launched back to back: a normal card takes 3-7 s, so retry.
    for (let attempt = 1; ; attempt++) {
      try {
        execFileSync(EDGE, ['--headless=new', '--no-first-run', '--hide-scrollbars', '--force-device-scale-factor=2',
          `--window-size=${W},${H}`, '--virtual-time-budget=3000', '--allow-file-access-from-files',
          `--user-data-dir=${join(work, `profile${attempt}`)}`, `--screenshot=${png}`, pathToFileURL(page).href], { stdio: 'ignore', timeout: 25000 });
        break;
      } catch (e) {
        if (attempt === 3) throw new Error(`Edge did not render ${p.id} after 3 tries: ${e.message.split('\n')[0]}`);
        console.log(`retry ${p.id} (${attempt})`);
      }
    }
    execFileSync('uv', ['run', '-q', '--no-project', '--with', 'pillow', 'python', '-I', join(ROOT, 'scripts', 'tojpg.py'), png, outJpg], { stdio: 'inherit' });
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve('scripts/cards.mjs')) {
  mkdirSync('assets/cards', { recursive: true });
  const only = process.argv.slice(2);
  for (const p of PROJECTS) {
    if (only.length && !only.includes(p.id)) continue;
    const src = p.tile ? null : (p.image || join(SHOTS, `${p.shot}.png`));
    if (src && !existsSync(src)) { console.error(`missing screenshot for ${p.id}: ${src}`); process.exitCode = 1; continue; }
    render(p, join(ROOT, 'assets', 'cards', `${p.id}.jpg`));
    console.log('card', p.id);
  }
}
