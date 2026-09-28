// vo_eng.mjs: lays the 19 guide lines (assets/vo_eng/lNN.wav, edge-tts en-US-AndrewNeural at +6%, trimmed) on the film's
// timeline → assets/eng_vo.wav. The film is timed to these starts; the speaker talks live, so this is for rehearsal only.
//   node vo_eng.mjs && node music_eng.mjs
import { readFileSync, writeFileSync } from 'node:fs';

export const STARTS = [2.4, 10.0, 18.2, 27.4, 34.2, 42.3, 49.6, 53.6, 59.2, 72.2, 82.2, 90.4, 94.6, 102.2, 112.7, 119.1, 125.8, 132.7, 139.4];
const SR = 44100, DUR = 146, out = new Float32Array(SR * DUR);
function readWav(p) {
  const b = readFileSync(p); let o = 12, data = null, ch = 1;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') ch = b.readUInt16LE(o + 10); if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n; }
  const s = new Float32Array(data.length / 2 / ch); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2 * ch) / 32768; return s;
}
STARTS.forEach((t0, i) => {
  const s = readWav(`assets/vo_eng/l${String(i + 1).padStart(2, '0')}.wav`), i0 = Math.round(t0 * SR);
  for (let k = 0; k < s.length && i0 + k < out.length; k++) out[i0 + k] += s[k];
});
const buf = Buffer.alloc(44 + out.length * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + out.length * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(out.length * 2, 40);
for (let i = 0; i < out.length; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i])) * 32767), 44 + i * 2);
writeFileSync('assets/eng_vo.wav', buf);
console.log('wrote assets/eng_vo.wav');
