import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test-setup.ts'],
      // Фиксируем часовой пояс, чтобы тесты не зависели от компьютера
      env: { TZ: 'UTC' },
    },
  }),
);
