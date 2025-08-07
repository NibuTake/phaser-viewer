<div align="center">
  <img src="./public/icons/icon-128.png" alt="Phaser Viewer Icon" width="128" height="128" />
  <h1>
    Phaser Viewer
  </h1>
  
  <p>
    <strong>A Storybook-like development environment for Phaser 3 components with interactive testing capabilities.</strong>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/version-v0.1.7-blue?style=flat-square" alt="Version 0.1.7" />
    <img src="https://img.shields.io/badge/phaser-v3.90.0-blue?style=flat-square&logo=gamepad" alt="Phaser 3.90.0" />
    <img src="https://img.shields.io/badge/typescript-5.9+-blue?style=flat-square&logo=typescript" alt="TypeScript 5.9+" />
    <img src="https://img.shields.io/badge/node-v18+-green?style=flat-square&logo=node.js" alt="Node.js 18+" />
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
  </p>
  
  <p>
    A lightweight Storybook alternative for Phaser 3 game components
  </p>
</div>

---

## ✨ Features

<table>
  <tr>
    <td align="center">🎮</td>
    <td><strong>Storybook-like UI</strong><br/>Hierarchical sidebar with organized component demos</td>
  </tr>
  <tr>
    <td align="center">🧪</td>
    <td><strong>Interactive & Automated Testing</strong><br/>Built-in expect API with visual feedback, play logs, and CLI test runner</td>
  </tr>
  <tr>
    <td align="center">🔥</td>
    <td><strong>Hot Reload</strong><br/>Instant feedback during development with Vite</td>
  </tr>
  <tr>
    <td align="center">📦</td>
    <td><strong>No Setup Required</strong><br/>Just create .demo.ts files and run npm command</td>
  </tr>
  <tr>
    <td align="center">⚡</td>
    <td><strong>Asset Loading</strong><br/>PreloadScene support for centralized asset management</td>
  </tr>
  <tr>
    <td align="center">🎬</td>
    <td><strong>Scene Configuration</strong><br/>Customizable canvas size and background color for different project needs</td>
  </tr>
  <tr>
    <td align="center">🎯</td>
    <td><strong>TypeScript First</strong><br/>Full type safety with automatic component and args inference using advanced TypeScript patterns</td>
  </tr>
  <tr>
    <td align="center">🔄</td>
    <td><strong>Component Reset</strong><br/>Reset button to restore components to initial state after Play tests while preserving test history</td>
  </tr>
</table>

## 📦 Installation

```bash
npm install phaser-viewer
# or
yarn add phaser-viewer
# or
pnpm add phaser-viewer
```

## 🚀 Quick Start

### 1️⃣ Install phaser-viewer

```bash
npm install phaser-viewer
```

### 2️⃣ Create your component demo

Create a `.demo.ts` file alongside your component:

```typescript
// src/Button.demo.ts
import { expect, delay } from 'phaser-viewer';
import { Meta, Demo } from 'phaser-viewer';
import { Button } from './Button'; // Import your component
import * as Phaser from 'phaser';

const meta = {
  component: Button,
  title: 'UI/Button',
  description: 'Interactive button component'
} as const satisfies Meta<typeof Button>;

export default meta;

interface ButtonArgs {
  x: number;
  y: number;
  text: string;
  config?: {
    color?: number;
    width?: number;
    height?: number;
  };
}

export const BasicButton: Demo<typeof meta, ButtonArgs> = {
  name: 'Basic Button',
  args: { x: 400, y: 300, text: 'Click Me!' },
  create: (scene, args) => {
    // Full type inference: args has x, y, text properties
    return new Button(scene, args.x, args.y, args.text, args.config);
  },
  play: async (_scene, component) => {
    // Full type inference: component is Button instance with all methods
    await expect(component.getText(), 'Initial text').toBe('Click Me!');
    
    // Test interaction
    component.emit('pointerdown');
    await delay(100);
    await expect(component.getText(), 'After click').toBe('Clicked!');
  }
};
```

### 3️⃣ Start the development server

```bash
npx phaser-viewer
# or add to package.json scripts:
# "phaser-viewer": "phaser-viewer"
```

That's it! Your Phaser component viewer will start automatically. No React setup files needed!

## 📁 Project Structure

```
your-project/
├── src/                   # Your Phaser components and demos
│   ├── Button.ts         # Button component implementation  
│   ├── Button.demo.ts    # Button component demos
│   ├── Sprite.ts         # Sprite component implementation
│   └── Sprite.demo.ts    # Sprite component demos
├── .phaser-viewer-temp/   # Hidden temp files (auto-generated)
└── package.json          # Include phaser-viewer script
```


## 🧪 Testing Your Components

Phaser Viewer includes a powerful testing API inspired by @storybook/test. Tests can be run interactively in the browser or automatically via CLI.

### Interactive Testing

Test results appear in the **Play Logs** panel with visual feedback:

```typescript
import { expect, delay } from 'phaser-viewer';

export const InteractiveButton: Demo<typeof meta, ButtonArgs> = {
  name: 'Interactive Button',
  args: { x: 400, y: 300, text: 'Test Button' },
  create: (scene, args) => {
    // Type inference: args is ButtonArgs, scene is Phaser.Scene
    return new Button(scene, args.x, args.y, args.text);
  },
  play: async (_scene, component) => {
    // Type inference: component is Button instance with all methods
    await expect(component.getText(), 'Initial text').toBe('Test Button');
    await expect(component.visible, 'Should be visible').toBe(true);
    
    // Test button click
    component.emit('pointerdown');
    await delay(100);
    await expect(component.getText(), 'After click').toBe('Clicked!');
    
    // Test multiple clicks
    component.emit('pointerdown');
    await delay(100);
    await expect(component.getText(), 'After second click').toBe('Clicked 2x');
  }
};
```

### Automated Testing (CLI)

Run all Play functions as automated tests:

```bash
npx phaser-viewer test
```

**Example Output:**
```
🧪 Starting Phaser Viewer Test Runner...
🔧 Loaded user config: { filePath: './src/**/*.demo.ts' }
🎯 Play Functions: 2 passed, 1 failed
❌ Gold - TestableGold: Expected 999, but received 600
```

**How it works:**
- Each Play function becomes a test unit
- Expect assertions determine pass/fail status
- Failed tests show detailed error messages
- Tests run in headless browser environment
- Automatic dependency installation (vitest, playwright)

## ⚡ Asset Loading with PreloadScene

For components that require assets (images, sounds, etc.), you can create a PreloadScene class to handle asset loading:

### 1️⃣ Create a PreloadScene class

```typescript
// src/GoldPreloadScene.ts
import * as Phaser from 'phaser';

export class GoldPreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GoldPreloadScene' });
  }
  
  preload() {
    // Load all assets your component needs
    this.load.image('gold', 'img/gold.png');
    this.load.image('silver', 'img/silver.png');
    this.load.audio('coinSound', 'audio/coin.mp3');
  }
}
```

### 2️⃣ Reference the PreloadScene in your demo

```typescript
// src/Gold.demo.ts
import { Meta, Demo } from 'phaser-viewer';
import { Gold } from './Gold';
import { GoldPreloadScene } from './GoldPreloadScene';
import * as Phaser from 'phaser';

const meta = {
  component: Gold,
  title: 'Sprites/Gold',
  description: 'Gold coin sprite with preloaded assets',
  preloadScene: GoldPreloadScene  // ← Add this line
} as const satisfies Meta<typeof Gold>;

export default meta;

interface GoldArgs {
  x: number;
  y: number;
}

export const BasicGold: Demo<typeof meta, GoldArgs> = {
  name: 'Basic Gold Coin',
  args: { x: 400, y: 300 },
  create: (scene, args) => {
    // Assets are already loaded and available!
    // Type inference: args has x, y properties
    return new Gold(scene, args.x, args.y);
  }
};
```

### 3️⃣ Use assets in your component

```typescript
// src/Gold.ts
export class Gold extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // The 'gold' texture is already loaded by GoldPreloadScene
    super(scene, x, y, 'gold');
    scene.add.existing(this);
    
    // You can also use other preloaded assets
    this.setInteractive();
    this.on('pointerdown', () => {
      scene.sound.play('coinSound'); // Audio is also preloaded
    });
  }
}
```

### How it works

1. **PreloadScene starts first** - Phaser Viewer automatically detects and runs your PreloadScene
2. **Assets are loaded** - All assets defined in `preload()` method are loaded into memory
3. **ViewerScene launches** - After loading completes, the viewer scene starts
4. **Assets are available** - Your components can immediately use the preloaded assets

This ensures smooth component rendering without loading delays or missing asset errors.

## 🎛️ Scene Configuration

Phaser Viewer allows you to customize the canvas size and background color to match your project needs:

### Basic Scene Configuration

```typescript
// phaser-viewer.config.ts
import { PhaserViewerConfig } from 'phaser-viewer';

const config: PhaserViewerConfig = {
  filePath: './src/**/*.demo.ts',
  scene: {
    width: 1200,           // Custom canvas width
    height: 800,           // Custom canvas height  
    backgroundColor: '#1a1a2e'  // Custom background color
  }
};

export default config;
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | `800` | Canvas width in pixels |
| `height` | `number` | `600` | Canvas height in pixels |
| `backgroundColor` | `string` | `'#222222'` | Background color in hex format |
| `displayScale` | `number` | `auto` | Display scaling factor (0.1-2.0, or omit for responsive auto-scaling) |



## 🛠️ Commands

### Development
- `npx phaser-viewer` - Start development server with auto-detected configuration
- `npx phaser-viewer --port 3000` - Start on custom port
- `npx phaser-viewer --help` - Show help

### Testing
- `npx phaser-viewer test` - Run automated tests for all Play functions

**Test Runner Features:**
- **Headless Testing**: Runs components in headless browser environment
- **Play Function Tests**: Each Play function becomes a test unit with pass/fail results
- **Error Details**: Detailed error messages for failed tests
- **Clean Output**: Filtered results without browser noise
- **Automatic Setup**: Installs test dependencies automatically (vitest, playwright, @vitest/browser)

**Configuration Detection:**
- Automatically loads `phaser-viewer.config.ts` or `phaser-viewer.config.js`
- Generates default configuration file if none exists
- Supports scene customization (size, background color)
- Auto-adds `.phaser-viewer-temp/` to `.gitignore` when present


---

## 📄 License

MIT License

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/NibuTake/phaser-viewer/issues) or contribute to the [GitHub repository](https://github.com/NibuTake/phaser-viewer).

---

<div align="center">
  <p>
    <a href="https://phaserjs.com/">Phaser 3</a> •
    <a href="https://reactjs.org/">React</a> •
    <a href="https://www.typescriptlang.org/">TypeScript</a>
  </p>
</div>