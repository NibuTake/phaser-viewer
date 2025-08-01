# Phaser Viewer

> 🎮 **Storybook for Phaser 3** - A VSCode extension that provides a visual development environment for Phaser 3 GameObjects with interactive controls and live editing.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![VSCode](https://img.shields.io/badge/vscode-%5E1.74.0-brightgreen.svg)
![Phaser](https://img.shields.io/badge/phaser-3.70.0-orange.svg)

<!-- Screenshots will be added here when available -->
<!-- ![Main Interface](images/main-interface.png) -->

## 🎯 What is Phaser Viewer?

Phaser Viewer brings the **Storybook** development experience to **Phaser 3** game development. Just like how Storybook lets you develop UI components in isolation, Phaser Viewer lets you build and test Phaser 3 GameObjects, animations, and interactions in a dedicated preview environment.

**Perfect for:**
- 🎮 Game developers building with Phaser 3
- 🎨 Designers prototyping game UI and animations  
- 👨‍🏫 Educators teaching game development
- 📚 Teams documenting game components

## ✨ Features

- 🎯 **Storybook-like Preview** - Isolated development environment for Phaser 3 GameObjects
- 📁 **Tree View with Hierarchy** - Organized folder structure display in VSCode sidebar
- 🎮 **Interactive Controls** - Restart, Reset, Pause/Resume your scenes with built-in controls
- 🔍 **Interactive Elements Inspector** - Auto-detect and highlight clickable objects
- 🔄 **Hot Reload** - Instant updates when you modify demo files
- ⚙️ **Customizable Canvas** - Adjustable size, background color, and renderer type
- 📝 **Type-Safe Development** - Full TypeScript support with proper type inference
- 🎨 **Live Editing** - See changes immediately as you code
- 👁️ **Preview Mode** - Single-click preview or persistent tabs for multi-demo development
- 📦 **Modular Architecture** - Separate example objects from demo files for better organization

## 🚀 Quick Start

### 1. Install the Extension
Search for "Phaser Viewer" in the VSCode Extensions marketplace and install it.

> **Note**: Currently in development. Install from source or wait for marketplace release.

### 2. Create Your First Demo
Create example objects and demo files:

**Step 1: Create an example object** (`examples/bouncing-ball.ts`):
```typescript
export const bouncingBall = {
    title: 'Bouncing Ball',
    description: 'A green ball that bounces up and down',
    create: (scene: Phaser.Scene) => {
        const ball = scene.add.circle(400, 300, 50, 0x00ff00);
        
        scene.tweens.add({
            targets: ball,
            y: 100,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Bounce.easeOut'
        });
    }
};
```

**Step 2: Create a demo file** (`examples/bouncing-ball.demo.ts`):
```typescript
import { bouncingBall } from './bouncing-ball';

export default bouncingBall.create;
```

### 3. Open Phaser Viewer
1. Click the **👁 Phaser Viewer** icon in the Activity Bar (left sidebar)
2. Your demo will appear in the **Demos** tree view
3. Single-click to preview, or right-click → "Open in New Tab" for persistent view

## 📖 Documentation

### Demo File Format

**New Object-Based Format (Recommended):**

1. **Example Object File** (`.ts`):
```typescript
export const myExample = {
    title: 'My GameObject',
    description: 'Description of what this does',
    create: (scene: Phaser.Scene) => {
        // Your Phaser code here with full TypeScript support
        const sprite = scene.add.sprite(x, y, texture);
    }
};
```

2. **Demo File** (`.demo.ts`):
```typescript
import { myExample } from './my-example';

export default myExample.create;
```

This approach provides better organization, type safety, and reusability.

### Interactive Controls

- **▶ Restart** - Restart the scene from the beginning
- **⟲ Reset** - Completely reset the Phaser game instance
- **⏸ Pause/Resume** - Pause or resume all animations and updates
- **🎯 Interactive (N)** - View and highlight interactive elements

### Canvas Settings

Customize your preview canvas through VSCode settings:

```json
{
  "phaserViewer.canvas.width": 800,
  "phaserViewer.canvas.height": 600,
  "phaserViewer.canvas.backgroundColor": "#2d2d2d",
  "phaserViewer.canvas.renderer": "AUTO"
}
```

## 🎨 Examples

### Basic Shapes

**Example Object** (`examples/basic-shapes.ts`):
```typescript
export const basicShapes = {
    title: 'Basic Shapes',
    description: 'Rectangle, circle, and text examples',
    create: (scene: Phaser.Scene) => {
        // Rectangle
        const rect = scene.add.rectangle(200, 200, 100, 100, 0xff0000);
        
        // Circle
        const circle = scene.add.circle(400, 200, 50, 0x00ff00);
        
        // Text
        scene.add.text(300, 350, 'Hello Phaser!', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
};
```

**Demo File** (`examples/basic-shapes.demo.ts`):
```typescript
import { basicShapes } from './basic-shapes';

export default basicShapes.create;
```

### Interactive Elements

**Example Object** (`examples/interactive-button.ts`):
```typescript
export const interactiveButton = {
    title: 'Interactive Button',
    description: 'Clickable button with hover effects',
    create: (scene: Phaser.Scene) => {
        const button = scene.add.rectangle(400, 300, 200, 60, 0x4CAF50);
        button.setInteractive();
        
        const buttonText = scene.add.text(400, 300, 'Click Me!', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        button.on('pointerover', () => button.setFillStyle(0x45a049));
        button.on('pointerout', () => button.setFillStyle(0x4CAF50));
        button.on('pointerdown', () => {
            buttonText.setText('Clicked!');
            scene.time.delayedCall(1000, () => buttonText.setText('Click Me!'));
        });
    }
};
```

### Animations & Tweens

**Example Object** (`examples/animated-star.ts`):
```typescript
export const animatedStar = {
    title: 'Animated Star',
    description: 'Rotating star with scale pulse animation',
    create: (scene: Phaser.Scene) => {
        const star = scene.add.star(400, 300, 5, 32, 64, 0xffff00);
        
        // Rotation animation
        scene.tweens.add({
            targets: star,
            rotation: Math.PI * 2,
            duration: 2000,
            repeat: -1
        });
        
        // Scale pulse
        scene.tweens.add({
            targets: star,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
};
```

## 🎯 Use Cases

- **🔧 Component Development** - Build and test individual GameObjects in isolation
- **🎬 Animation Prototyping** - Quickly iterate on animations and effects  
- **🎨 UI Design** - Design game UI elements with immediate visual feedback
- **👨‍🏫 Teaching & Learning** - Perfect for Phaser 3 tutorials and workshops
- **📖 Code Documentation** - Visual documentation of your game components
- **🧪 A/B Testing** - Compare different versions of game elements side-by-side
- **🎯 Rapid Prototyping** - Quickly test game mechanics and interactions

## ⚙️ Configuration

All settings are available in VSCode settings (`Cmd/Ctrl + ,` → search "phaser viewer"):

| Setting | Default | Description |
|---------|---------|-------------|
| `phaserViewer.canvas.width` | `800` | Canvas width in pixels |
| `phaserViewer.canvas.height` | `600` | Canvas height in pixels |
| `phaserViewer.canvas.backgroundColor` | `"#2d2d2d"` | Background color (hex format) |
| `phaserViewer.canvas.renderer` | `"AUTO"` | Renderer type (AUTO/WEBGL/CANVAS) |

## 🐛 Troubleshooting

### Extension Not Visible
- Ensure you have a workspace folder open
- Check that the extension is enabled in Extensions panel
- Try reloading VSCode (`Ctrl/Cmd + Shift + P` → "Developer: Reload Window")

### Demos Not Loading
- Verify file naming: `*.demo.ts` and corresponding `.ts` files
- Check TypeScript syntax in your demo files
- Ensure demo files properly import and export the create function
- Look for errors in VSCode Developer Tools (`Help` → `Toggle Developer Tools`)

### Preview Not Working
- Ensure your demo file exports a default function
- Verify the example object has a `create` function
- Check browser console for JavaScript errors
- Try different renderer settings if you see rendering issues

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/your-username/phaser-viewer.git
cd phaser-viewer
npm install
npm run compile
```

Press `F5` in VSCode to launch the extension in debug mode.

### Creating Screenshots
Manual screenshots are needed for documentation. See [images/demo-preview.md](images/demo-preview.md) for detailed instructions on capturing the extension in action.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Phaser 3](https://phaser.io/) - Amazing 2D game framework that powers the preview environment
- [Storybook](https://storybook.js.org/) - Inspiration for the component-driven development approach
- [VSCode Extension API](https://code.visualstudio.com/api) - Powerful and flexible extension framework

## 🏆 Features Roadmap

- [ ] **Asset Loading Support** - Preview sprites, atlases, and other game assets
- [ ] **Multiple Scene Support** - Switch between different Phaser scenes
- [ ] **Export Functionality** - Export demos as standalone HTML files
- [ ] **Theme Support** - Light/dark themes for the preview canvas
- [ ] **Collaboration Features** - Share demo links with team members
- [ ] **Performance Profiling** - Built-in performance analysis tools

---

**Ready to revolutionize your Phaser 3 development workflow?** 🎮✨

[⭐ Star us on GitHub](https://github.com/your-username/phaser-viewer) | [📝 Report Issues](https://github.com/your-username/phaser-viewer/issues) | [💡 Request Features](https://github.com/your-username/phaser-viewer/discussions)