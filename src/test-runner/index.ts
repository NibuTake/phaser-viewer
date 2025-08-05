// Phaser Viewer Test Runner
// Storybook準拠のVitest統合テストランナー

export { phaserViewerTestPlugin } from './vitest-plugin';
export type { PhaserViewerTestPluginOptions } from './vitest-plugin';

export { 
  createPhaserTestEnvironment, 
  cleanupPhaserTestEnvironment,
  TestScene,
  TestPreloadSceneWrapper 
} from './test-utils';
export type { PhaserTestEnvironment } from './test-utils';

// Vitest設定テンプレート生成
export function generateVitestConfig(options: {
  include?: string[];
  exclude?: string[];
  headless?: boolean;
} = {}) {
  const { 
    include = ['**/*.demo.ts'], 
    exclude = [],
    headless = true 
  } = options;

  return `import { defineConfig } from 'vitest/config';
import { phaserViewerTestPlugin } from 'phaser-viewer/test-runner';

export default defineConfig({
  plugins: [
    phaserViewerTestPlugin({
      include: ${JSON.stringify(include)},
      exclude: ${JSON.stringify(exclude)},
    })
  ],
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: ${headless},
    },
    include: ${JSON.stringify(include)},
    testTimeout: 30000, // Phaserゲーム初期化時間を考慮
    hookTimeout: 10000,
  },
});`;
}