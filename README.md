<div align="center">
  <img src="./public/icons/icon-128.png" alt="Phaser Viewer Icon" width="128" height="128" />
  <h1>
    🎮 Phaser Viewer
  </h1>
  
  <p>
    <strong>A Storybook-like development environment for Phaser 3 components with interactive testing capabilities.</strong>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/phaser-v3.90.0-blue?style=flat-square" alt="Phaser 3.90.0" />
    <img src="https://img.shields.io/badge/node-v18+-green?style=flat-square" alt="Node.js 18+" />
    <img src="https://img.shields.io/badge/typescript-5.9+-blue?style=flat-square" alt="TypeScript 5.9+" />
    <img src="https://img.shields.io/github/stars/NibuTake/phaser-viewer?style=flat-square" alt="GitHub Stars" />
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
  </p>
  
  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="#features">Features</a> •
    <a href="#testing-your-components">Testing</a> •
    <a href="#commands">Commands</a>
  </p>
</div>

---

> ⚠️ **Development Status**: This project is currently in early development (v0.1.0). Some features may be incomplete or missing. We welcome your ideas, feedback, and feature requests! Please [open an issue](https://github.com/NibuTake/phaser-viewer/issues) to share your thoughts.

## ✨ Features

<table>
  <tr>
    <td align="center">🎮</td>
    <td><strong>Storybook-like UI</strong><br/>Hierarchical sidebar with organized component demos</td>
  </tr>
  <tr>
    <td align="center">🧪</td>
    <td><strong>Interactive Testing</strong><br/>Built-in expect functions with visual feedback</td>
  </tr>
  <tr>
    <td align="center">🔥</td>
    <td><strong>Hot Reload</strong><br/>Instant feedback during development with Vite</td>
  </tr>
  <tr>
    <td align="center">📦</td>
    <td><strong>No Setup Required</strong><br/>Just create .demo.ts files and run npm command</td>
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
import { expect } from 'phaser-viewer/utils/storybookExpect';
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
    await expect(component, 'Button should exist').toBeTruthy();
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

Import the expect API to test your components:

```typescript
import { expect, delay } from 'phaser-viewer/utils/storybookExpect';

export const InteractiveButton: Demo<typeof meta> = {
  name: 'Interactive Button',
  args: { x: 400, y: 300, text: 'Test Button' },
  create: (scene: Phaser.Scene, args) => {
    return new Button(scene, args.x, args.y, args.text);
  },
  play: async (scene: Phaser.Scene, component) => {
    // Test component properties
    await expect(component, 'Button should exist').toBeTruthy();
    await expect(component.visible, 'Should be visible').toBe(true);
    
    // Wait for animations
    await delay(1000);
    
    // Test interactions
    component.emit('pointerdown');
    await expect(component.getText(), 'Text should change').toBe('Clicked!');
  }
};
```

## 🛠️ Commands

- `npx phaser-viewer` - Start development server
- `phaser-viewer --help` - Show help

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