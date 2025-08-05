<div align="center">
  <img src="./public/icons/icon-128.png" alt="Phaser Viewer Icon" width="128" height="128" />
  <h1>
    Phaser Viewer
  </h1>
  
  <p>
    <strong>A Storybook-like development environment for Phaser 3 components with interactive testing capabilities.</strong>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/version-v0.1.4-blue?style=flat-square" alt="Version 0.1.4" />
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


## 🆕 What's New in v0.1.4

- **🎬 Scene Configuration**: Customize canvas size and background color through configuration
- **📱 Responsive Design**: Support for mobile, desktop, and custom viewport sizes
- **🎨 Theme Support**: Configurable background colors for different project themes
- **⚙️ Enhanced CLI**: Automatic scene configuration generation and loading

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
    <td align="center">🎬</td>
    <td><strong>Scene Configuration</strong><br/>Customizable canvas size and background color for different project needs</td>
  </tr>
  <tr>
    <td align="center">🎯</td>
    <td><strong>TypeScript First</strong><br/>Full type safety with automatic component and args inference using advanced TypeScript patterns</td>
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

### 3️⃣ (Optional) Configure scene settings

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

### 4️⃣ Start the development server

```bash
npx phaser-viewer
# or add to package.json scripts:
# "phaser-viewer": "phaser-viewer"
```

That's it! Your Phaser component viewer will start automatically with your custom scene configuration. No React setup files needed!

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
import { PhaserViewerConfig } from 'phaser-viewer';

const config: PhaserViewerConfig = {
  filePath: './src/**/*.demo.ts',  // Demo files pattern (default: './src/**/*.demo.ts')
  port: 5173,                      // Development server port (default: 5173)
  scene: {                         // Scene configuration (optional)
    width: 1200,                   // Canvas width in pixels (default: 800)
    height: 800,                   // Canvas height in pixels (default: 600)
    backgroundColor: '#1a1a2e'     // Background color (default: '#222222')
  }
};

export default config;
```

**Available configuration options:**

```typescript
interface PhaserViewerConfig {
  filePath: string;  // Glob pattern for demo files
  port?: number;     // Development server port (default: 5173)
  scene?: {          // Scene/canvas configuration (optional)
    width?: number;          // Canvas width in pixels (default: 800)
    height?: number;         // Canvas height in pixels (default: 600)
    backgroundColor?: string; // Background color in hex format (default: '#222222')
  };
}
```

## 🧪 Testing Your Components

Phaser Viewer includes a powerful testing API inspired by @storybook/test. Test results appear in the **Play Logs** panel with visual feedback:

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

### Use Cases

**Mobile Game Development:**
```typescript
scene: {
  width: 375,   // iPhone viewport width
  height: 667,  // iPhone viewport height
  backgroundColor: '#000000'
}
```

**Desktop Game Development:**
```typescript
scene: {
  width: 1920,  // Full HD width
  height: 1080, // Full HD height
  backgroundColor: '#2c2c54'
}
```

**Component Testing:**
```typescript
scene: {
  width: 1200,  // Wider canvas for UI components
  height: 800,  // Taller canvas for complex layouts
  backgroundColor: '#1a1a2e',
  displayScale: 0.7  // Manual scaling to fit in smaller screens
}
```

**Auto-Responsive Scaling:**
```typescript
scene: {
  width: 1920,  // Large resolution for detailed work
  height: 1080,
  // Omit displayScale for automatic responsive scaling
  // Will auto-scale to fit available screen space
}
```

### 🔄 **Responsive Display Scaling**

Phaser Viewer automatically scales large scenes to fit your screen while maintaining the exact game resolution:

- **Game Resolution**: Always preserved at the exact specified dimensions
- **Display Scaling**: Automatically calculated to fit available screen space
- **UI Compatibility**: Sidebar and controls remain visible and usable
- **Manual Override**: Set `displayScale` for custom scaling (0.1-2.0)

**How it works:**
- Scene size 800x600 on 1920px screen → 100% scale (no scaling needed)
- Scene size 1200x800 on 1366px screen → ~75% scale (auto-calculated)
- Scene size 1920x1080 on any screen → Scaled to fit with sidebar space

The scene configuration applies to all demos in your project, providing a consistent development environment that adapts to your screen size.

## 🎯 TypeScript Type Inference

Phaser Viewer provides **advanced type inference** that automatically determines component and args types from your meta definition:

### 🚀 **Automatic Type Inference**

```typescript
import { Meta, Demo } from 'phaser-viewer';
import { Button } from './Button';

const meta = {
  component: Button,
  title: 'UI/Button',
  description: 'Interactive button component'
} as const satisfies Meta<typeof Button>;

interface ButtonArgs {
  x: number;
  y: number;
  text: string;
}

export const BasicButton: Demo<typeof meta, ButtonArgs> = {
  name: 'Basic Button',
  args: { x: 400, y: 300, text: 'Click Me!' },
  
  // ✅ TypeScript automatically infers:
  // - scene: Phaser.Scene
  // - args: ButtonArgs (with x, y, text properties)
  // - return type: Button instance
  create: (scene, args) => {
    return new Button(scene, args.x, args.y, args.text);
  },
  
  // ✅ TypeScript automatically infers:
  // - scene: Phaser.Scene  
  // - component: Button instance (with all Button methods)
  play: async (_scene, component) => {
    await expect(component.getText(), 'Initial text').toBe('Click Me!');
    component.emit('pointerdown'); // All Button methods available!
  }
};
```

### 🔧 **Benefits of Type Inference**

- **🎯 Zero manual typing**: Component type is inferred from `meta.component`
- **🛡️ Type safety**: Catch errors at compile time, not runtime
- **🚀 IDE support**: Full autocomplete for component methods and properties
- **📝 Self-documenting**: Types serve as live documentation
- **🔄 Refactor-friendly**: Rename methods and properties with confidence

### 🧪 **Advanced Testing with Type Safety**

```typescript
play: async (_scene, component) => {
  // All these have full type safety and autocomplete:
  await expect(component.x, 'X position').toBe(400);
  await expect(component.visible, 'Visibility').toBe(true);
  await expect(component.texture.key, 'Texture key').toBe('gold');
  
  // Component methods with full type checking:
  component.setPosition(300, 200);
  component.setAlpha(0.5);
  component.destroy(); // TypeScript warns if method doesn't exist
}
```

## 🛠️ Commands

- `npx phaser-viewer` - Start development server with auto-detected configuration
- `npx phaser-viewer --port 3000` - Start on custom port
- `npx phaser-viewer --help` - Show help

**Configuration Detection:**
- Automatically loads `phaser-viewer.config.ts` or `phaser-viewer.config.js`
- Generates default configuration file if none exists
- Supports scene customization (size, background color)

## 🎯 Best Practices

### 🧪 **Demo Development**
- **Define clear interfaces**: Create specific `Args` interfaces for better type safety
- **Use `Demo<typeof meta, Args>`**: Leverage full type inference for better developer experience
- **Export default meta**: Always export your meta as default for proper discovery
- **Descriptive naming**: Use clear demo names like `BasicButton`, `InteractiveGold`

### 🔍 **Testing Guidelines**
- **Descriptive test messages**: Use clear test names in `expect()` calls
- **Test incrementally**: Test component properties and interactions separately
- **Use timing wisely**: Use `delay()` for timing-dependent operations
- **Instance method testing**: Test actual component methods, not just properties

### 📁 **File Organization**
- **Co-located demos**: Keep `.demo.ts` files close to component files
- **Hierarchical titles**: Use clear hierarchies (`UI/Button`, `Sprites/Gold`, `Systems/Physics`) 
- **PreloadScene strategy**: Create PreloadScenes for asset-heavy components
- **Consistent naming**: Follow consistent patterns (`Component.ts` + `Component.demo.ts`)

### ⚡ **Performance Tips**
- **Lightweight PreloadScenes**: PreloadScenes run once per story group - keep them focused
- **Minimal delays**: Use `delay()` sparingly - only when necessary for timing
- **Real interactions**: Test real user interactions rather than just component creation
- **Type inference**: Let TypeScript do the work - avoid manual type annotations when possible

### 🛡️ **Type Safety**
- **Leverage inference**: Use `Demo<typeof meta, Args>` for automatic type inference
- **Interface definitions**: Define clear `Args` interfaces for complex component arguments
- **Satisfies pattern**: Use `as const satisfies Meta<typeof Component>` for meta definitions
- **IDE integration**: Take advantage of full autocomplete and error detection

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