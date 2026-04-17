/**
 * scripts/regen-hrcopilot.mjs
 * Deletes and regenerates ONLY the narration files whose script text
 * contains "HRcopilot" — saving API credits on everything else.
 *
 * Usage:  node scripts/regen-hrcopilot.mjs
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const OUT_DIR   = path.join(ROOT, 'public', 'audio', 'narration');

// ── Load .env.local ────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) throw new Error('.env.local not found');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const ENV      = loadEnv();
const API_KEY  = ENV.VITE_ELEVENLABS_API_KEY_2 || ENV.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = ENV.VITE_ELEVENLABS_VOICE_ID_2 || ENV.VITE_ELEVENLABS_VOICE_ID;
const MODEL    = 'eleven_turbo_v2_5';

if (!API_KEY || !VOICE_ID) {
  console.error('❌  Missing VITE_ELEVENLABS_API_KEY / VITE_ELEVENLABS_VOICE_ID in .env.local');
  process.exit(1);
}
console.log(`🔑  key=...${API_KEY.slice(-6)}  voice=${VOICE_ID}\n`);

// ── Load ALL_SCRIPTS from index.ts ─────────────────────────────────────────────
function loadAllScripts() {
  const tsPath = path.join(ROOT, 'src', 'demo', 'voice', 'scripts', 'index.ts');
  let src = fs.readFileSync(tsPath, 'utf8');
  src = src
    .replace(/^export\s+const\s+ALL_SCRIPTS[^=]+=\s*/m, 'const ALL_SCRIPTS = ')
    .replace(/:\s*Record<string,\s*any>/g, '')
    .replace(/^export\s+/gm, '');
  const fn = new Function(`${src}; return ALL_SCRIPTS;`);
  return fn();
}

const ALL_SCRIPTS = loadAllScripts();

// ── Build work list — only entries whose text contains "HRcopilot" ─────────────
const ROLES = ['CEO', 'HR', 'FINANCE'];

function buildWorkList() {
  const items = [];
  for (const [scriptId, entry] of Object.entries(ALL_SCRIPTS)) {
    if (typeof entry === 'string') {
      if (!entry.includes('HRcopilot')) continue;
      // Derive role from scriptId suffix
      const role = scriptId.includes('.ceo')     ? 'CEO'
                 : scriptId.includes('.hr')      ? 'HR'
                 : scriptId.includes('.finance') ? 'FINANCE'
                 : 'CEO';
      items.push({ scriptId, role, text: entry });
    } else if (typeof entry === 'object' && entry !== null) {
      for (const role of ROLES) {
        const text = entry[role];
        if (text && typeof text === 'string' && text.includes('HRcopilot')) {
          items.push({ scriptId, role, text });
        }
      }
    }
  }
  return items;
}

function outPath(scriptId, role) {
  const safe = scriptId.replace(/[^a-zA-Z0-9_-]/g, '-');
  return path.join(OUT_DIR, `${safe}.${role}.mp3`);
}

// ── ElevenLabs TTS ─────────────────────────────────────────────────────────────
async function synthesise(text) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method:  'POST',
      headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
      }),
    }
  );
  if (!res.ok) {
    const b = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status}: ${b}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ── Main ───────────────────────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });

const workList = buildWorkList();
console.log(`🎯  Found ${workList.length} script entries containing "HRcopilot"\n`);

// Preview what will be regenerated
for (const { scriptId, role } of workList) {
  const safe = scriptId.replace(/[^a-zA-Z0-9_-]/g, '-');
  console.log(`   ${safe}.${role}.mp3`);
}
console.log('');

let generated = 0, failed = 0;

for (const { scriptId, role, text } of workList) {
  const filePath = outPath(scriptId, role);
  const filename = path.basename(filePath);

  // Delete existing file so we force fresh generation
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  process.stdout.write(`🎙️   ${filename} … `);
  try {
    const mp3 = await synthesise(text);
    fs.writeFileSync(filePath, mp3);
    console.log(`✅  ${(mp3.length / 1024).toFixed(0)} KB`);
    generated++;
    await new Promise(r => setTimeout(r, 350)); // rate-limit buffer
  } catch (err) {
    console.error(`❌  ${err.message}`);
    failed++;
    if (err.message.includes('401') || err.message.includes('quota')) {
      console.error('🛑  Key exhausted — re-run after cooldown.');
      break;
    }
  }
}

console.log(`\n✅  Done — ${generated} regenerated, ${failed} failed`);
if (failed > 0) process.exit(1);
