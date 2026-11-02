import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const paths = ['src', 'public', 'scripts', 'test'];
let checked = 0;
for (const folder of paths) {
  for (const entry of await readdir(folder)) {
    const filename = path.join(folder, entry);
    if (!/\.(mjs|js)$/.test(filename)) continue;
    const source = await readFile(filename, 'utf8');
    if (/\t|[ \t]+$/m.test(source) || !source.endsWith('\n')) throw new Error(`Whitespace lint failed: ${filename}`);
    const result = spawnSync(process.execPath, ['--check', filename], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr);
    checked += 1;
  }
}
console.log(`Lint passed: ${checked} JavaScript files; syntax, spaces and final newlines checked.`);
