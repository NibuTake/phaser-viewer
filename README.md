# Phaser Viewer

A Storybook-like development environment for Phaser 3 components with interactive testing capabilities.

## Features

- 🎮 **Storybook-style UI** - Hierarchical sidebar with folders and stories
- 🧪 **Interactive Testing** - Built-in assert functions with visual feedback 
- ✅ **Test Results** - Success/Failed badges and detailed logs
- 🎯 **Component Isolation** - Test individual Phaser components in isolation
- 🔥 **Hot Reload** - Instant feedback during development

## Installation

```bash
npm install phaser-viewer
```

## Quick Start

### 1. Create a demo file

Create a `.demo.ts` file in your project:

```typescript
// Button.demo.ts
import { Button } from './Button';

export default {
  title: 'UI/Button',
  description: 'Interactive button component',
  tags: ['ui', 'interactive']
};

export const Default = {
  name: 'Default Button',
  args: {
    x: 400,
    y: 300,
    text: 'Click Me!',
    config: { color: 0x4CAF50 }
  },
  create: (scene: Phaser.Scene, args: any) => {
    return new Button(scene, args.x, args.y, args.text, args.config);
  },
  play: async (scene: Phaser.Scene, component: any) => {
    // Test the component
    window.assert(component !== null, 'Button should exist');
    window.assertEquals(component.getText(), 'Click Me!', 'Button text should be correct');
  }
};
```

### 2. Use PhaserViewer

```typescript
import { PhaserViewer } from 'phaser-viewer';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
root.render(<PhaserViewer />);
```

## Folder Structure

```
examples/
├── animation/          # Animation related demos
│   ├── rotating-star.demo.ts
│   └── animated-circle.demo.ts
├── ui/                 # UI component demos
│   ├── button.demo.ts
│   └── sprite.demo.ts
├── interaction/        # Interaction demos
│   └── text-interactive.demo.ts
└── [category]/         # Custom categories
```

## API Reference

### Story Structure

```typescript
interface Story {
  name: string;
  create: (scene: Phaser.Scene, args?: any) => any;
  args?: any;
  play?: (scene: Phaser.Scene, component?: any) => void | Promise<void>;
}
```

### Testing Functions

- `window.assert(condition: boolean, message: string)` - Assert a condition
- `window.assertEquals(actual: any, expected: any, message: string)` - Assert equality

### Components

- `PhaserViewer` - Main viewer component
- `PhaserPreview` - Individual story preview
- `Sidebar` - Story navigation sidebar

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build:lib

# Lint code
npm run lint
```

## Examples

Check the `/examples` folder for sample stories and components.

## Creating Custom Components

### 1. Create a reusable component
```typescript
// components/MySprite.ts
export class MySprite extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'texture-key');
        scene.add.existing(this);
    }
    
    customMethod() {
        // Custom functionality
    }
}
```

### 2. Create a demo story
```typescript
// examples/ui/my-sprite.demo.ts
import { MySprite } from '../../components/MySprite';

export default {
  title: 'UI/MySprite',
  description: 'Custom sprite component'
};

export const Example = {
    name: 'My Sprite Example',
    create: (scene: Phaser.Scene) => {
        const sprite = new MySprite(scene, 400, 300);
        sprite.customMethod();
        return sprite;
    },
    play: async (scene: Phaser.Scene, component: MySprite) => {
        window.assert(component !== null, 'Sprite should exist');
        // Test your component functionality
    }
};
```

## Available Resources

### Phaser Objects
- `scene.add.*` - All game objects
- `scene.tweens.*` - Animations
- `scene.physics.*` - Physics system
- `scene.input.*` - Input handling

### Icon Resources
```typescript
// Available icons
window.iconUris = {
    'icon-16': '/icons/icon-16.png',
    'icon-32': '/icons/icon-32.png', 
    'icon-64': '/icons/icon-64.png',
    'icon-128': '/icons/icon-128.png'
};
```

## Best Practices

### ✅ Good Example
```typescript
export const GoodExample = {
    name: 'Clear Description',
    create: (scene: Phaser.Scene) => {
        // Simple and clear
        const circle = scene.add.circle(400, 300, 50, 0x0088ff);
        
        scene.tweens.add({
            targets: circle,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Add descriptive label
        scene.add.text(400, 450, 'Pulsing Circle', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        return circle;
    }
};
```

### ❌ Avoid
```typescript
export const BadExample = {
    name: 'Bad',
    create: (scene: Phaser.Scene) => {
        // Too complex, no explanation
        // Many external dependencies
        // No error handling
    }
};
```

## License

MIT