import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const watch = process.argv.includes('--watch');

const common = {
  bundle: true,
  format: 'iife',
  target: 'es2017',
  platform: 'browser',
  logLevel: 'info',
};

async function buildMain() {
  const ctx = await esbuild.context({
    ...common,
    entryPoints: ['src/main.ts'],
    outfile: 'code.js',
  });
  if (watch) await ctx.watch();
  else { await ctx.rebuild(); await ctx.dispose(); }
}

async function buildUi() {
  // Inline the UI TS into the html template if a template is used; otherwise
  // just copy src/ui.html to ui.html at the project root.
  const srcUi = path.join('src', 'ui.html');
  const dstUi = 'ui.html';
  if (fs.existsSync(srcUi)) {
    fs.copyFileSync(srcUi, dstUi);
    console.log('copied', srcUi, '->', dstUi);
  }
}

await buildUi();
await buildMain();
