import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Storybook-style virtual plugin for user stories
function PhaserViewerStoriesPlugin() {
  const virtualModuleId = 'virtual:phaser-viewer-stories'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'phaser-viewer-stories', // required, will show up in warnings and errors
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        // ユーザープロジェクトのexamplesディレクトリから.demo.tsファイルを発見
        const storyFiles = await glob('./examples/**/*.demo.ts', {
          cwd: process.cwd(),
          absolute: false
        })
        
        console.log('🔍 Found user story files:', storyFiles)
        
        // 動的インポートマップを生成（Storybook方式）
        const importMap = storyFiles.map((file, index) => 
          `'${file}': () => import('${file}')`
        ).join(',\n  ')
        
        return `
export const userStoryModules = {
  ${importMap}
};

export const loadUserStories = async () => {
  console.log('📚 Loading user stories from virtual module');
  const modules = {};
  for (const [path, importer] of Object.entries(userStoryModules)) {
    try {
      modules[path] = await importer();
    } catch (error) {
      console.error('Failed to load story:', path, error);
    }
  }
  return modules;
};
        `
      }
    }
  }
}

// This config is used when phaser-viewer runs from user project
export default defineConfig(({ command, mode }) => {
  const examplesPath = process.env.VITE_EXAMPLES_PATH || './examples';
  console.log('🔧 Vite config loaded for Phaser Viewer');
  console.log('🔧 Examples path:', examplesPath);
  console.log('🔧 Vite mode:', mode);
  console.log('🔧 Vite command:', command);
  
  return {
    mode: 'development',
    plugins: [react(), PhaserViewerStoriesPlugin()],
    optimizeDeps: {
      include: ['phaser', 'react', 'react-dom'],
      exclude: ['phaser-viewer'],
      noDiscovery: command === 'serve'
    },
    define: {
      // Pass examples path to the application
      'import.meta.env.VITE_EXAMPLES_PATH': JSON.stringify(examplesPath),
      'import.meta.env.MODE': JSON.stringify('development'),
      'import.meta.env.DEV': true,
      'import.meta.env.PROD': false
    },
    server: {
      fs: {
        allow: ['..', '../src', '../examples', examplesPath]
      }
    }
  }
})