# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Phaser Viewer** is a Storybook-like development environment for Phaser 3 components with interactive testing capabilities. It combines React frontend with Phaser 3 game engine to create an isolated component development and testing environment.

**Distribution**: This project is distributed as an npm package with a CLI that dynamically generates all React setup files. Users only need to create `.demo.ts` files and run `npx phaser-viewer`.

## Essential Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build both library and demo application  
- `npm run build:lib` - Build library for npm distribution (uses lib mode in Vite)
- `npm run lint` - Run ESLint with auto-fix
- `npm run preview` - Preview production build

### Quality Assurance
Always run these before committing:
```bash
npm run lint        # Fix linting issues
npm run build:lib   # Ensure library builds successfully
```

### CLI Testing
Test the CLI in the example project:
```bash
cd /path/to/phaser-viewer-example
npm run phaser-viewer    # Test CLI functionality
```

**Important**: Use background execution for browser automation testing. Sequential execution will fail because the server needs to run continuously.

## Architecture Overview

### CLI-Based Architecture
The project provides both library exports and a CLI:
- **Library mode**: Exports reusable components for npm distribution (`npm run build:lib`)
- **CLI mode**: Dynamically generates React setup files for users (`bin/phaser-viewer.js`)

Key configuration in `vite.config.ts` switches between modes based on `--mode lib` flag.

### Dynamic File Generation System
The CLI (`bin/phaser-viewer.js`) automatically generates:
- `index.html` - Entry point with Phaser Viewer configuration
- `phaser-viewer-main.tsx` - React application with user story modules
- `phaser-viewer.config.temp.js` - Vite configuration for user project
- All files are automatically cleaned up on exit

**Configuration Support**:
- TypeScript config files: `phaser-viewer.config.ts` (preferred)
- JavaScript config files: `phaser-viewer.config.js` (legacy support)
- Uses esbuild for TypeScript compilation
- Default configuration: `filePath: './src/**/*.demo.ts'`

**Path Alias Support** (v0.1.8+):
- Auto-detects TypeScript path aliases from `tsconfig.json`
- Converts `compilerOptions.paths` to Vite aliases automatically
- User can override with manual Vite configuration
- Supports both array and object alias formats
- ESM imports (node:path, node:fs) for Vite compatibility

### Demo System Architecture

**Demo Discovery**: 
- Demos are auto-discovered using Vite's `import.meta.glob()` with user-configurable patterns
- Default pattern: `./src/**/*.demo.ts` (co-located with components)
- Alternative pattern: `./examples/**/*.demo.ts` (separate examples directory)
- Each `.demo.ts` file exports a default meta object and named demo exports
- Demos are organized hierarchically in the sidebar based on the `title` field

**Storybook-Style Loading**:
- User project runs `import.meta.glob()` and passes modules to `PhaserViewer` component
- Avoids complex virtual module systems
- Direct module passing for reliable story discovery

**Demo Structure**:
```typescript
import { Meta, Demo } from 'phaser-viewer';

// Define component args type
interface YourComponentArgs {
  x: number;
  y: number;
  // ... other args
}

// Meta defines the component and metadata
const meta = {
  component: YourComponent,
  title: "Category/ComponentName", 
  description: "Component description",
  tags: ["tag1", "tag2"]
} as const satisfies Meta<typeof YourComponent>;

// Demo type with automatic component and args inference
type YourComponentDemo = Demo<typeof meta, YourComponentArgs>;

// Demos define specific examples
export const DemoName: YourComponentDemo = {
  name: "Display Name",
  args: { /* component arguments */ },
  create: (scene: Phaser.Scene, args) => new YourComponent(scene, args),
  play: async (scene: Phaser.Scene, component) => {
    // Interactive tests using expect API
  }
};
```

### Testing Framework

**Modern Expect API** (`src/utils/storybookExpect.ts`):
- Import-based testing: `import { expect, delay } from '../../src/utils/storybookExpect'`
- Automatic logging to play logs panel
- Storybook-style matchers: `toBe()`, `toBeTruthy()`, `toBeVisible()`, `toHaveTextContent()`
- Component-specific matchers for Phaser objects

**Legacy Global Functions** (for backward compatibility):
- `window.assert(condition, message)` 
- `window.assertEquals(actual, expected, message)`

### Component Communication System

**Event-Driven Architecture**:
- `playLog` events: Test results and logs displayed in bottom panel
- `testResult` events: Test statistics for badges  
- `resetComponentState` events: Component state management between test runs

**Component Lifecycle**:
1. **Demo Selection**: User clicks demo in sidebar
2. **Component Creation**: `create()` function executed in Phaser scene
3. **Play Function Execution**: Manual trigger via Play button
4. **State Reset**: Automatic cleanup before next test run

### Type System Integration

**Demo-Based Types**:
- `Meta<T>` interface for component metadata with type inference
- `DemoObj<TComponent, TArgs>` for individual demos with typed component and args parameters
- `ComponentFromMeta<TMeta>` utility type extracts component type from meta
- `Demo<TMeta, TArgs>` simplified type that automatically infers component and args types

This eliminates repetitive type annotations in play functions:
```typescript
// Before: Manual typing required
play: async (_scene: Phaser.Scene, component: ExtendedButton) => {

// After: Type automatically inferred from meta
play: async (_scene: Phaser.Scene, component) => {
```

## Key Implementation Details

### Phaser Integration
- `PhaserPreview.tsx` contains `PreviewScene` class extending `Phaser.Scene`
- Components are created and managed within Phaser's scene system
- React provides the UI shell, Phaser handles game object rendering
- Icon resources made globally available via `window.iconUris`

### Dynamic Module Loading
- Stories loaded dynamically using `import.meta.glob()` with eager loading
- Play functions stored as function references (not executed during import)
- Special handling for Promise objects to prevent accidental execution during React renders

### TypeScript Configuration
- Project uses composite TypeScript setup with multiple `tsconfig` files
- `tsconfig.lib.json` for strict library builds
- `tsconfig.app.json` for development (relaxed rules)
- `tsconfig.node.json` for Node.js tools (Vite config)
- All builds must pass for quality assurance

**Important TypeScript Settings**:
- Avoid `tsBuildInfoFile` without `incremental` or `composite` options
- Remove invalid options like `erasableSyntaxOnly`, `noUncheckedSideEffectImports`
- Use `noEmit: true` for type-checking only configurations

## Demo Development Patterns

### File Organization
```
examples/
├── demos/
│   ├── [ComponentName].demo.ts     # Main demo file
│   ├── [category]/                 # Organized by category
│   │   └── [component].demo.ts
│   └── Button.ts                   # Component implementation
```

### Meta Configuration
Always define `const meta` with proper typing:
```typescript
const meta = {
  component: YourComponent,
  title: "UI/YourComponent",  // Controls sidebar hierarchy
  description: "Brief description",
  tags: ["ui", "interactive"],
  parameters: {
    scene: { width: 800, height: 600, backgroundColor: "#2d2d2d" }
  }
} as const satisfies Meta<typeof YourComponent>;
```

### Testing Best Practices
- Use `validateComponent(component, testName)` helper before testing
- Import modern expect API: `const { expect, delay } = await getExpectUtils()`
- Component interactions via `component.emit("eventName")` 
- Use `await delay(ms)` for async operations and animations
- Automatic logging - no manual `window.dispatchEvent` needed

### Common Pitfalls to Avoid
- **Never define play functions inline**: Store as function references to prevent execution during React renders
- **Always await async operations**: Use `delay()` for timing-dependent tests
- **Component validation**: Check component exists before testing
- **State management**: Components automatically reset between test runs

## Development Workflow

1. **Create Component**: Implement Phaser component class
2. **Create Demo File**: Add `.demo.ts` file with meta and demos
3. **Test Interactively**: Use `npm run dev` and Play button
4. **Verify Build**: Run `npm run build:lib` to ensure library compatibility
5. **Quality Check**: Run `npm run lint` for code quality

## CLI Development & Testing

### Package Distribution Workflow
```bash
# 1. Build library package
npm run build:lib

# 2. Create package for testing
npm pack  # Creates phaser-viewer-X.X.X.tgz

# 3. Install in example project for testing
cd /path/to/phaser-viewer-example
npm install ../phaser-viewer/phaser-viewer-X.X.X.tgz

# 4. Test CLI functionality
npm run phaser-viewer
```

### User Project Requirements (Minimal)
Users only need these files:
```
your-project/
├── src/                     # Component directory
│   ├── Button.ts           # Component implementation
│   └── Button.demo.ts      # Component demo
├── phaser-viewer.config.ts  # Optional configuration
└── package.json            # With phaser-viewer dependency
```

### Critical Implementation Notes

**Background Execution**: 
- Browser automation testing requires background server execution
- Use `npm run phaser-viewer > server.log 2>&1 &` for testing
- Sequential execution (`npm run phaser-viewer && browser-test`) will fail

**File Cleanup**:
- CLI automatically cleans up generated files on exit (SIGINT, SIGTERM)
- Temporary files: `index.html`, `phaser-viewer-main.tsx`, `phaser-viewer.config.temp.js`
- Add `*.tgz` and `.serena/` to `.gitignore` for development

**React Compatibility**:
- Package uses React 18.3.1 for broad compatibility
- CLI generates files using legacy `ReactDOM.render()` instead of `createRoot()`
- Avoids React 19 compatibility issues in user projects

**TypeScript Config Loading**:
- CLI supports both `.ts` and `.js` config files
- TypeScript files compiled with esbuild for runtime execution
- Prioritizes `.ts` files over `.js` files when both exist