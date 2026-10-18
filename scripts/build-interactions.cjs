const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
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
}).catch(error => { console.error(error); process.exit(1); });
