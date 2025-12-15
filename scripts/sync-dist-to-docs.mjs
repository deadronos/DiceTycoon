#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDirSync(src, dest) {
  // Prefer fs.cpSync if available (Node 16.7+)
  if (typeof fs.cpSync === 'function') {
    fs.cpSync(src, dest, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirSync(srcPath, destPath);
    else if (entry.isSymbolicLink()) {
      const symlink = fs.readlinkSync(srcPath);
      fs.symlinkSync(symlink, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  try {
    const root = process.cwd();
    const distDir = path.join(root, 'dist');
    const docsDir = path.join(root, 'docs');

    if (!fs.existsSync(distDir)) {
      console.error('Error: no `dist` directory found. Run `npm run build` first.');
      process.exit(1);
    }

    console.log('Removing existing `docs` directory (if any)...');
    removeDir(docsDir);

    console.log('Copying `dist` -> `docs`...');
    copyDirSync(distDir, docsDir);

    console.log('Sync complete: `docs` now contains the built site.');
  } catch (err) {
    console.error('Failed to sync dist to docs:', err);
    process.exit(1);
  }
}

main();
