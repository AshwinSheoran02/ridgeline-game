// Builds dist/index.html from src/ and checks the game script compiles.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const head = fs.readFileSync(path.join(src, 'head.html'), 'utf8');
const parts = fs.readdirSync(src).filter(f => /^\d.*\.js$/.test(f)).sort();
const js = "'use strict';\n(async function(){\n" + parts.map(f => fs.readFileSync(path.join(src, f), 'utf8')).join('\n') + '\n})();\n';
try { new vm.Script(js, { filename: 'game.js' }); } catch (e) { console.error('Syntax error:', e.message); process.exit(1); }
const html = head + '\n<script src="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js"></script>\n<script>\n' + js + '</script>\n';
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'index.html'), html);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('SYNTAX_OK', Buffer.byteLength(html), 'bytes,', parts.length, 'modules');
