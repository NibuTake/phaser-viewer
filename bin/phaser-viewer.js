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
  const command = process.argv[2] || 'dev';
  
  if (command === 'test') {
    await runTestMode();
    return;
  }
  
  if (command === '--help' || command === '-h' || command === 'help') {
    console.log(`
Phaser Viewer - A Storybook-like development environment for Phaser 3 components

Usage:
  npx phaser-viewer [command]

Commands:
  dev (default)    Start development server
  test            Run automated tests for Play functions
  help, --help    Show this help message

Options:
  --port <port>   Specify port number (default: 5173)

Examples:
  npx phaser-viewer                    # Start development server
  npx phaser-viewer test              # Run tests
  npx phaser-viewer --port 3000       # Start on port 3000
`);
    return;
  }
  
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

async function runTestMode() {
  console.log('🧪 Starting Phaser Viewer Test Runner...');
  
  // Read user configuration (same as dev mode)
  let userConfig = { filePath: './src/**/*.demo.ts' };
  
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
        const configModule = await import(`file://${process.cwd()}/${configPath}`);
        userConfig = { ...userConfig, ...configModule.default };
      }
      console.log('🔧 Loaded user config:', userConfig);
    } catch (error) {
      console.warn(`⚠️ Failed to load ${configPath}:`, error.message);
      console.log('📄 Using default configuration');
    }
  }
  
  // Generate a simplified test script instead of using the complex plugin approach
  const testScriptContent = `import { test, expect } from 'vitest';
import * as Phaser from 'phaser';

// Simple test runner for demo files
const demoModules = import.meta.glob('${userConfig.filePath}', { eager: true });

// Play function test results tracking
let totalPlayTests = 0;
let passedPlayTests = 0;
let failedPlayTests = 0;
let playTestDetails = [];
let completedVitestTests = 0;
let totalVitestTests = 0;

// Count total expected Vitest tests and Play functions
Object.entries(demoModules).forEach(([filePath, module]) => {
  const meta = module.default || module.meta;
  if (meta) {
    const demoExports = Object.entries(module).filter(([key, value]) => 
      key !== 'meta' && key !== 'default' && typeof value === 'object' && value.create
    );
    totalVitestTests += demoExports.length;
    
    // Count Play functions (these are our actual tests)
    demoExports.forEach(([demoName, demo]) => {
      if (demo.play && typeof demo.play === 'function') {
        totalPlayTests++;
      }
    });
  }
});

Object.entries(demoModules).forEach(([filePath, module]) => {
  const fileName = filePath.split('/').pop().replace('.demo.ts', '');
  
  // Get the meta and demos from the module (meta is the default export)
  const meta = module.default || module.meta;
  if (!meta) {
    console.warn('⚠️ No meta found in', filePath);
    return;
  }
  
  // Find all demo exports (anything that's not 'meta' or 'default')
  const demoExports = Object.entries(module).filter(([key, value]) => 
    key !== 'meta' && key !== 'default' && typeof value === 'object' && value.create
  );
  
  demoExports.forEach(([demoName, demo]) => {
    test(\`\${fileName} - \${demoName}\`, async () => {
      // Simple test setup
      const config = {
        type: Phaser.CANVAS,
        width: 800,
        height: 600,
        parent: document.body,
        backgroundColor: '#222222',
        scene: meta.preloadScene ? [
          // Custom preload scene class with mocked assets
          {
            key: 'TestPreloadScene',
            preload: function() {
              // Mock texture data
              const mockTextures = {
                'gold': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAcCBlCw==', // Gold color
                'button': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Transparent
                '__DEFAULT__': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
              };

              // Override load.image to use mock textures
              const originalLoadImage = this.load.image;
              this.load.image = function(key, url) {
                const mockUrl = mockTextures[key] || mockTextures['__DEFAULT__'];
                return originalLoadImage.call(this, key, mockUrl);
              };
              
              // Execute the user's preload scene
              if (meta.preloadScene) {
                try {
                  const userPreloadScene = new meta.preloadScene();
                  // Copy Phaser context
                  Object.assign(userPreloadScene, {
                    load: this.load,
                    scene: this.scene,
                    game: this.game,
                    registry: this.registry,
                    events: this.events,
                  });
                  // Execute user preload logic
                  if (userPreloadScene.preload) {
                    userPreloadScene.preload();
                  }
                } catch (error) {
                  console.warn('⚠️ Preload scene error (non-critical):', error.message);
                }
              }
            },
            create: async function() {
              this.scene.start('TestScene');
            }
          },
          {
            key: 'TestScene',
            create: async function() {
              try {
                // Create component using demo
                const component = demo.create(this, demo.args || {});
                expect(component).toBeDefined();
                
                // Run play function if it exists (this is our actual test)
                if (demo.play && typeof demo.play === 'function') {
                  try {
                    const playResult = demo.play(this, component);
                    
                    // Always treat as async for consistency
                    try {
                      await Promise.resolve(playResult);
                      passedPlayTests++;
                      playTestDetails.push({ name: fileName + ' - ' + demoName, status: 'passed' });
                    } catch (error) {
                      failedPlayTests++;
                      playTestDetails.push({ name: fileName + ' - ' + demoName, status: 'failed', error: error.message });
                    }
                  } catch (error) {
                    failedPlayTests++;
                    playTestDetails.push({ name: fileName + ' - ' + demoName, status: 'failed', error: error.message });
                  }
                }
                
              } catch (error) {
                failedTests++;
                totalTests++;
                testDetails.push({ name: \`\${fileName} - \${demoName} (Component)\`, status: 'failed', error: error.message });
                throw error;
              } finally {
                // Cleanup
                this.game.destroy(true);
              }
            }
          }
        ] : [
          // Simple scene for demos without preloadScene
          {
            key: 'TestScene',
            preload: function() {
              // Mock common textures for demos without preloadScene
              const mockTextures = {
                'gold': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAcCBlCw==',
                'button': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                '__DEFAULT__': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
              };
              
              Object.entries(mockTextures).forEach(([key, dataUrl]) => {
                this.load.image(key, dataUrl);
              });
            },
            create: async function() {
              try {
                // Create component using demo
                const component = demo.create(this, demo.args || {});
                expect(component).toBeDefined();
                
                // Run play function if it exists (this is our actual test)
                if (demo.play && typeof demo.play === 'function') {
                  try {
                    const playResult = demo.play(this, component);
                    
                    // Always treat as async for consistency
                    try {
                      await Promise.resolve(playResult);
                      passedPlayTests++;
                      playTestDetails.push({ name: fileName + ' - ' + demoName, status: 'passed' });
                    } catch (error) {
                      failedPlayTests++;
                      playTestDetails.push({ name: fileName + ' - ' + demoName, status: 'failed', error: error.message });
                    }
                  } catch (error) {
                    failedPlayTests++;
                    playTestDetails.push({ name: fileName + ' - ' + demoName, status: 'failed', error: error.message });
                  }
                }
                
              } catch (error) {
                failedTests++;
                totalTests++;
                testDetails.push({ name: \`\${fileName} - \${demoName} (Component)\`, status: 'failed', error: error.message });
                throw error;
              } finally {
                // Cleanup
                this.game.destroy(true);
              }
            }
          }
        ],
        audio: { noAudio: true },
        banner: false
      };
      
      // Create game and wait for it to complete
      const game = new Phaser.Game(config);
      
      await new Promise((resolve) => {
        game.events.once('ready', resolve);
      });
      
      // Give it a moment to run (longer for async Play functions)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Increment completed test count
      completedVitestTests++;
      
      // Display Play function test results only after the last test
      if (completedVitestTests === totalVitestTests) {
        console.error('PLAY_RESULTS:' + passedPlayTests + ',' + failedPlayTests);
        const failedTests = playTestDetails.filter(test => test.status === 'failed');
        failedTests.forEach(test => {
          console.error('PLAY_ERROR:' + test.name + ':' + test.error);
        });
      }
    }, 10000); // 10 second timeout per test
  });
});

`;

  // Write simplified test script
  const testScriptPath = './phaser-viewer.test.js';
  writeFileSync(testScriptPath, testScriptContent);

  // Generate minimal Vitest config
  const vitestConfigContent = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
          headless: true,
        }
      ],
    },
    include: ['./phaser-viewer.test.js'],
    testTimeout: 30000,
    hookTimeout: 10000,
    globals: true,
    reporter: 'default',
    silent: false,
  },
  server: {
    fs: {
      allow: ['.', process.cwd()]
    }
  },
  logLevel: 'info',
});`;

  // Write Vitest config
  const vitestConfigPath = './phaser-viewer.vitest.config.js';
  writeFileSync(vitestConfigPath, vitestConfigContent);
  
  // Install necessary test dependencies if not available
  
  const packageJsonPath = './package.json';
  let needsInstall = false;
  let installPackages = [];
  
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const allDeps = { 
      ...packageJson.dependencies, 
      ...packageJson.devDependencies 
    };
    
    const requiredPackages = ['vitest', '@vitest/browser', 'playwright'];
    
    for (const pkg of requiredPackages) {
      if (!allDeps[pkg]) {
        installPackages.push(pkg);
        needsInstall = true;
      }
    }
  }
  
  if (needsInstall) {
    const install = spawn('npm', ['install', '--save-dev', ...installPackages], {
      stdio: 'pipe',
      cwd: process.cwd(),
      env: process.env
    });
    
    await new Promise((resolve, reject) => {
      install.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to install dependencies. Exit code: ${code}`));
        }
      });
    });
  }
  
  const vitest = spawn('npx', ['vitest', 'run', '--config', vitestConfigPath], {
    stdio: ['inherit', 'pipe', 'pipe'],
    cwd: process.cwd(),
    env: process.env
  });
  
  // Capture Play function results from stderr
  vitest.stderr.on('data', (data) => {
    const output = data.toString();
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('PLAY_RESULTS:')) {
        const [passed, failed] = line.split('PLAY_RESULTS:')[1].split(',');
        console.log('🎯 Play Functions: ' + passed + ' passed, ' + failed + ' failed');
      }
      if (line.includes('PLAY_ERROR:')) {
        const parts = line.split('PLAY_ERROR:')[1].split(':');
        const name = parts[0];
        const error = parts.slice(1).join(':');
        console.log('❌ ' + name + ': ' + error);
      }
    }
  });
  
  // Cleanup function for test mode (silent)
  const cleanupTest = () => {
    try {
      if (existsSync(vitestConfigPath)) {
        unlinkSync(vitestConfigPath);
      }
      if (existsSync(testScriptPath)) {
        unlinkSync(testScriptPath);
      }
    } catch (error) {
      // Silent cleanup
    }
  };
  
  // Cleanup on exit
  process.on('SIGINT', cleanupTest);
  process.on('SIGTERM', cleanupTest);

  vitest.on('close', (code) => {
    cleanupTest();
    process.exit(code);
  });
}

runCommand().catch(console.error);