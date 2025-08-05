#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runCommand() {
  console.log('🚀 Starting Phaser Viewer...');
  
  // Read user configuration
  let userConfig = { filePath: './src/**/*.demo.ts' };
  
  // Check for TypeScript config first, then JavaScript
  const configPaths = ['./phaser-viewer.config.ts', './phaser-viewer.config.js'];
  let configPath = null;
  
  for (const path of configPaths) {
    if (existsSync(path)) {
      configPath = path;
      break;
    }
  }
  
  if (configPath) {
    console.log('🔍 Config file found:', configPath);
    try {
      if (configPath.endsWith('.ts')) {
        // For TypeScript files, compile with esbuild and then import
        const esbuild = await import('esbuild');
        const { outputFiles } = await esbuild.build({
          entryPoints: [configPath],
          bundle: true,
          platform: 'node',
          format: 'esm',
          target: 'node18',
          write: false,
          outdir: '.',
          external: ['phaser', 'phaser-viewer']
        });
        
        // Execute the compiled JavaScript
        const compiledCode = outputFiles[0].text;
        const tempFile = `./phaser-viewer.config.temp.mjs`;
        writeFileSync(tempFile, compiledCode);
        
        try {
          const configModule = await import(`file://${process.cwd()}/${tempFile}?t=${Date.now()}`);
          userConfig = { ...userConfig, ...configModule.default };
          unlinkSync(tempFile);
        } catch (importError) {
          unlinkSync(tempFile);
          throw importError;
        }
      } else {
        // For JavaScript files, import directly
        const configModule = await import(`file://${process.cwd()}/${configPath}`);
        userConfig = { ...userConfig, ...configModule.default };
      }
      console.log('🔧 Loaded user config:', userConfig);
    } catch (error) {
      console.warn(`⚠️ Failed to load ${configPath}:`, error.message);
      console.log('📄 Using default configuration');
    }
  } else {
    console.log('📄 No config file found, generating default configuration...');
    
    // Generate default phaser-viewer.config.ts
    const defaultConfigContent = `import { PhaserViewerConfig } from 'phaser-viewer';

const config: PhaserViewerConfig = {
  // Path pattern for demo files (relative to project root)
  filePath: './src/**/*.demo.ts',

  // Port for development server (optional)
  port: 5173,

  // Scene configuration (optional)
  scene: {
    width: 800,    // Canvas width in pixels
    height: 600,   // Canvas height in pixels
    backgroundColor: '#222222', // Background color
    displayScale: 1.0 // Display scale factor (0.1-2.0, or omit for auto)
  }
};

export default config;
`;
    
    try {
      writeFileSync('./phaser-viewer.config.ts', defaultConfigContent);
      console.log('✅ Generated default config: phaser-viewer.config.ts');
      console.log('🔧 Loaded user config:', { filePath: './src/**/*.demo.ts', port: 5173, scene: { width: 800, height: 600, backgroundColor: '#222222' } });
      userConfig = { filePath: './src/**/*.demo.ts', port: 5173, scene: { width: 800, height: 600, backgroundColor: '#222222' } };
    } catch (error) {
      console.warn('⚠️ Failed to generate config file:', error.message);
      console.log('📄 Using default configuration');
    }
  }
  
  // Check if filePath pattern matches any files
  const filePattern = userConfig.filePath.replace('**/*.demo.ts', '');
  const fileDir = filePattern.endsWith('/') ? filePattern.slice(0, -1) : filePattern;
  if (!existsSync(fileDir)) {
    console.error(`❌ No demo files directory found at ${fileDir}. Create .demo.ts files in your src/ directory.`);
    process.exit(1);
  }

  console.log('📄 Generating temporary files in project directory...');
  
  // Generate vite config in user project directory  
  const publicDirPath = join(__dirname, '..', 'dist').replace(/\\/g, '/');
  const packagePath = join(__dirname, '..').replace(/\\/g, '/');
  
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: '${publicDirPath}',
  optimizeDeps: {
    include: ['phaser', 'react', 'react-dom'],
    exclude: ['phaser-viewer']
  },
  resolve: {
    alias: {
      'react-dom/client': 'react-dom/client'
    }
  },
  server: {
    fs: {
      allow: ['.', '${packagePath}']
    }
  }
})`;

  // Generate index.html in project directory
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icons/icon-32.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Phaser Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/phaser-viewer-main.tsx"></script>
  </body>
</html>`;

  // Generate main.tsx in project directory
  const sceneConfigStr = userConfig.scene ? `sceneConfig={${JSON.stringify(userConfig.scene)}}` : '';
  const mainTsx = `import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { PhaserViewer } from 'phaser-viewer';

// Auto-discover user demo files using the configured pattern
const userStoryModules = import.meta.glob('${userConfig.filePath}', { eager: true });

console.log('🔍 User project story modules found:', Object.keys(userStoryModules));

ReactDOM.render(
  <StrictMode>
    <PhaserViewer 
      userStoryModules={userStoryModules}${sceneConfigStr ? ` 
      ${sceneConfigStr}` : ''} 
    />
  </StrictMode>,
  document.getElementById('root')
);`;

  // Write temporary files to user project (will be cleaned up)
  writeFileSync('./index.html', indexHtml);
  writeFileSync('./phaser-viewer-main.tsx', mainTsx);
  writeFileSync('./phaser-viewer.config.temp.js', viteConfig);

  // Use the generated config
  const tempConfigPath = './phaser-viewer.config.temp.js';
  
  // Start Vite dev server from project directory
  console.log('🔧 Starting Phaser Viewer...');
  
  const port = userConfig.port || 5173;
  
  console.log('🔧 Configuration:');
  console.log('- Demo files pattern:', userConfig.filePath);
  console.log('- Port:', port);
  if (userConfig.scene) {
    console.log('- Scene width:', userConfig.scene.width || 800);
    console.log('- Scene height:', userConfig.scene.height || 600);
    console.log('- Background color:', userConfig.scene.backgroundColor || '#222222');
    if (userConfig.scene.displayScale !== undefined) {
      console.log('- Display scale:', userConfig.scene.displayScale);
    } else {
      console.log('- Display scale: auto (responsive)');
    }
  }
  
  const vite = spawn('npx', ['vite', '--config', tempConfigPath, '--port', port.toString()], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });

  // Cleanup function
  const cleanup = () => {
    console.log('🧹 Cleaning up temporary files...');
    try {
      if (existsSync('./index.html')) {
        unlinkSync('./index.html');
      }
      if (existsSync('./phaser-viewer-main.tsx')) {
        unlinkSync('./phaser-viewer-main.tsx');
      }
      if (existsSync('./phaser-viewer.config.temp.js')) {
        unlinkSync('./phaser-viewer.config.temp.js');
      }
      if (existsSync('./phaser-viewer.config.temp.mjs')) {
        unlinkSync('./phaser-viewer.config.temp.mjs');
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup temporary files:', error.message);
    }
  };

  // Cleanup on exit
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  vite.on('close', (code) => {
    process.exit(code);
  });

}

runCommand().catch(console.error);