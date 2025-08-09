import { PhaserViewerConfig } from 'phaser-viewer';

const config: PhaserViewerConfig = {
  filePath: './src/**/*.demo.ts',
  scene: {
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d'
  }
  // TypeScript path aliases will be auto-detected from tsconfig.json
};

export default config;