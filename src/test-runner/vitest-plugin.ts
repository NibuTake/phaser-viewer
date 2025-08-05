import type { Plugin } from 'vite';
import path from 'path';

export interface PhaserViewerTestPluginOptions {
  include?: string[];
  exclude?: string[];
}

export function phaserViewerTestPlugin(options: PhaserViewerTestPluginOptions = {}): Plugin {
  const { exclude = [] } = options;

  return {
    name: 'phaser-viewer-test',
    transform(code: string, id: string) {
      // .demo.ts ファイルのみを変換
      if (!id.endsWith('.demo.ts')) {
        return null;
      }

      // 除外パターンチェック
      const isExcluded = exclude.some(pattern => 
        id.includes(pattern.replace('**/', '').replace('*', ''))
      );
      if (isExcluded) {
        return null;
      }

      console.log(`🧪 Transforming demo to test: ${path.basename(id)}`);
      
      return transformDemoToTest(code, id);
    }
  };
}

function transformDemoToTest(demoCode: string, filePath: string): string {
  // Demoファイルの内容を解析してテストに変換
  const fileName = path.basename(filePath, '.demo.ts');
  
  return `
import { test, expect as vitestExpect } from 'vitest';
import { createPhaserTestEnvironment, cleanupPhaserTestEnvironment } from 'phaser-viewer/test-runner';

${demoCode}

// 各デモをVitestテストケースに変換
const testMeta = meta;

${generateTestCases(demoCode, fileName)}
`;
}

function generateTestCases(demoCode: string, fileName: string): string {
  // デモエクスポートを正規表現で検出
  const exportMatches = demoCode.match(/export const (\w+):/g) || [];
  const demoNames = exportMatches.map(match => match.replace('export const ', '').replace(':', ''));

  return demoNames.map(demoName => `
test('${fileName} - ${demoName}', async () => {
  const testEnv = await createPhaserTestEnvironment(testMeta);
  
  try {
    // コンポーネント作成
    const component = ${demoName}.create(testEnv.scene, ${demoName}.args);
    
    // Play関数がある場合は実行
    if (${demoName}.play) {
      await ${demoName}.play(testEnv.scene, component);
    }
    
    // 基本的なアサーション
    vitestExpect(component).toBeDefined();
    console.log('✅ ${fileName} - ${demoName} passed');
    
  } finally {
    await cleanupPhaserTestEnvironment(testEnv);
  }
});`).join('\n');
}