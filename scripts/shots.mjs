// node scripts/shots.mjs [id ...]: screenshots of live project pages with headless Edge (own temp profile).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir, homedir } from 'node:os';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PAGES = {
  gooseminton: 'https://gooseminton.vercel.app/',
  'lucky-gacha': 'https://chokylion.github.io/Lucky-Draw-Games/Gacha.html',
  'lucky-salt': 'https://chokylion.github.io/Lucky-Draw-Games/Salt.html',
  'wafer-probe-random': 'https://chokylion.github.io/Wafer-Probe-Random/',
  'pure-strike': 'https://pure-strike.vercel.app/',
  cholf: 'https://chokylion.github.io/golf-game/',
  'claude-racer': 'https://chokylion.github.io/claude-racer/',
  ensense: 'https://chokylion.github.io/ensense/',
  'stadium-seatview': 'https://chokylion.github.io/stadium-seatview/',
  popcat: pathToFileURL(join(homedir(), 'Desktop', 'popcat-event', 'index.html')).href,
};

const out = ".shots", only = process.argv.slice(2);
mkdirSync(out, { recursive: true });
for (const [id, url] of Object.entries(PAGES)) {
  if (only.length && !only.includes(id)) continue;
  const file = join(out, `${id}.png`);
  const profile = mkdtempSync(join(tmpdir(), 'shot-edge-'));
  try {
    execFileSync(EDGE, [
      '--headless=new', '--no-first-run', '--hide-scrollbars', '--mute-audio',
      '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
      '--window-size=1280,800', '--virtual-time-budget=12000',
      `--user-data-dir=${profile}`, `--screenshot=${file}`, url,
    ], { stdio: 'ignore', timeout: 90000 });
    console.log(id, existsSync(file) ? `${statSync(file).size} bytes` : 'NO FILE');
  } catch (e) {
    console.log(id, 'FAILED', e.message.split('\n')[0]);
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}
