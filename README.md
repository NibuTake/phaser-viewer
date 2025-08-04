<div align="center">
  <img src="./public/icons/icon-128.png" alt="Phaser Viewer Icon" width="128" height="128" />
  <h1>
    Phaser Viewer
  </h1>
  
  <p>
    <strong>A Storybook-like development environment for Phaser 3 components with interactive testing capabilities.</strong>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/version-v0.1.2-blue?style=flat-square" alt="Version 0.1.2" />
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
    <td><strong>Interactive Testing</strong><br/>Built-in expect API with visual feedback and play logs</td>
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
    <td align="center">🎯</td>
    <td><strong>TypeScript First</strong><br/>Full type safety with automatic component and args inference</td>
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

const meta = {
  component: Button,
  title: 'UI/Button',
  description: 'Interactive button component'
} as const satisfies Meta<typeof Button>;

export default meta;

export const BasicButton: Demo<typeof meta> = {
  name: 'Basic Button',
  args: { x: 400, y: 300, text: 'Click Me!' },
  create: (scene: Phaser.Scene, args) => {
    return new Button(scene, args.x, args.y, args.text);
  },
  play: async (scene: Phaser.Scene, component) => {
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
└── package.json          # Include phaser-viewer script
```

### Configuration (optional)

Create `phaser-viewer.config.ts` to customize:

```typescript
interface PhaserViewerConfig {
  filePath: string;
  port?: number;
}

const config: PhaserViewerConfig = {
  filePath: './src/**/*.demo.ts',  // Demo files pattern (default: './src/**/*.demo.ts')
  port: 5173                       // Development server port (default: 5173)
};

export default config;
```

## 🧪 Testing Your Components

Phaser Viewer includes a powerful testing API inspired by @storybook/test. Test results appear in the **Play Logs** panel with visual feedback:

```typescript
import { expect, delay } from 'phaser-viewer';

export const InteractiveButton: Demo<typeof meta> = {
  name: 'Interactive Button',
  args: { x: 400, y: 300, text: 'Test Button' },
  create: (scene: Phaser.Scene, args) => {
    return new Button(scene, args.x, args.y, args.text);
  },
  play: async (scene: Phaser.Scene, component) => {
    // Test initial state
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

const meta = {
  component: Gold,
  title: 'Sprites/Gold',
  description: 'Gold coin sprite with preloaded assets',
  preloadScene: GoldPreloadScene  // ← Add this line
} as const satisfies Meta<typeof Gold>;

export default meta;

export const BasicGold: Demo<typeof meta> = {
  name: 'Basic Gold Coin',
  args: { x: 400, y: 300 },
  create: (scene: Phaser.Scene, args) => {
    // Assets are already loaded and available!
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

## 🛠️ Commands

- `npx phaser-viewer` - Start development server
- `npx phaser-viewer --port 3000` - Start on custom port
- `npx phaser-viewer --help` - Show help

## 🎯 Best Practices

### 🔍 **Testing Guidelines**
- Use descriptive test names for better debugging
- Test component properties and interactions separately
- Use `delay()` for timing-dependent operations
- Leverage `step()` for organized test flow

### 📁 **File Organization**
- Keep `.demo.ts` files close to component files
- Use hierarchical titles (`UI/Button`, `Sprites/Gold`) for better organization
- Create PreloadScenes for asset-heavy components

### ⚡ **Performance Tips**
- PreloadScenes run once per story group - keep them lightweight
- Use `delay()` sparingly - only when necessary for timing
- Test real interactions rather than just component creation

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