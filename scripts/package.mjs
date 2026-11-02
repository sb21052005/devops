import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const destination = 'dist/shopeasy-lite';
await mkdir(destination, { recursive: true });
for (const entry of ['src', 'public', 'package.json']) {
  await cp(entry, path.join(destination, entry), { recursive: true });
}
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
await writeFile('dist/manifest.json', JSON.stringify({ name: manifest.name, version: manifest.version, entry: 'shopeasy-lite/src/server.mjs' }, null, 2) + '\n');
console.log(`Packaged ${manifest.name} ${manifest.version} into ${destination}`);
