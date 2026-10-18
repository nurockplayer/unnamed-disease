import { defineConfig } from 'vitest/config';

// 相對路徑，方便直接放到 GitHub Pages 子路徑或任何靜態主機
export default defineConfig({
  base: './',
  test: { include: ['tests/**/*.test.ts'] },
});
