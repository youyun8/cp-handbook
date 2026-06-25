// Static export build for GitHub Pages.
//
// The GitHub OAuth backend (API route handlers under app/api) cannot be
// statically exported, so we temporarily move it out of the build, run the
// static export, then always restore it. Auth-related UI is disabled at
// runtime via lib/runtime.ts (STATIC_EXPORT=true).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const apiDir = join(root, 'app', 'api');
const stash = join(root, '.static-export-stash', 'api');

function moveIfExists(from, to) {
  if (!existsSync(from)) return false;
  mkdirSync(dirname(to), { recursive: true });
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  renameSync(from, to);
  return true;
}

let moved = false;
try {
  moved = moveIfExists(apiDir, stash);

  const result = spawnSync('next', ['build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      STATIC_EXPORT: 'true',
      NEXT_PUBLIC_STATIC_EXPORT: 'true',
      NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? '/cp-handbook'
    }
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
} finally {
  if (moved) {
    moveIfExists(stash, apiDir);
    rmSync(join(root, '.static-export-stash'), { recursive: true, force: true });
  }
}
