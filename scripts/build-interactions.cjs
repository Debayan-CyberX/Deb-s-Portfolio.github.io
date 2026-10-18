const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
// HTML is committed for GitHub Pages; one local build keeps fragments and data
// in sync before generating the progressive React islands.
for (const script of ['build-sections.py', 'build-projects.py']) {
  execFileSync('python', [path.join(__dirname, script)], { stdio: 'inherit' });
}
const outdir = path.resolve(__dirname, '../assets/interactions');
esbuild.build({
  entryPoints: ['src/sanctuary.jsx'],
  bundle: true,
  splitting: true,
  format: 'esm',
  outdir,
  entryNames: 'sanctuary',
  chunkNames: '[name]-[hash]',
  minify: true,
  jsx: 'automatic',
  target: ['es2022'],
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'linked',
  write: false,
  banner: { js: '/*! React Bits adaptations (c) 2026 David Haz. License: ../../src/react-bits/LICENSE.md */' },
}).then(result => {
  fs.mkdirSync(outdir, { recursive: true });
  const current = new Set(result.outputFiles.map(file => path.basename(file.path)));
  for (const file of result.outputFiles) fs.writeFileSync(file.path, file.contents);
  // Only remove obsolete generated files in this dedicated output directory.
  for (const file of fs.readdirSync(outdir, { withFileTypes: true })) {
    if (file.isFile() && /\.(js|css|txt)$/.test(file.name) && !current.has(file.name)) fs.unlinkSync(path.join(outdir, file.name));
  }
  const pagePath = path.resolve(__dirname, '../index.html');
  let page = fs.readFileSync(pagePath, 'utf8');
  for (const extension of ['js', 'css']) {
    const name = `assets/interactions/sanctuary.${extension}`;
    const hash = createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, '..', name))).digest('hex').slice(0, 12);
    page = page.replace(new RegExp(`assets/interactions/sanctuary\\.${extension}(?:\\?v=[^"\\s]+)?`), `${name}?v=${hash}`);
  }
  for (const name of ['portfolio.js', 'portfolio.css']) {
    const hash = createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, '..', name))).digest('hex').slice(0, 12);
    page = page.replace(new RegExp(`${name.replace('.', '\\.')}\\b(?:\\?v=[^"\\s]+)?`), `${name}?v=${hash}`);
  }
  fs.writeFileSync(pagePath, page);
}).catch(error => { console.error(error); process.exit(1); });
