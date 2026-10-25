import { defineConfig } from 'vitest/config';
import { execSync } from 'node:child_process';

// 相對路徑，方便直接放到 GitHub Pages 子路徑或任何靜態主機
export default defineConfig({
  base: './',
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
  },
  test: { include: ['tests/**/*.test.ts'] },
});

function buildId(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}
