# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.8] - 2025-01-08

### ✨ Added
- **📦 TypeScript Path Alias Support**: Automatic detection and resolution of TypeScript path aliases from tsconfig.json
- **🔧 Enhanced Vite Configuration**: User-provided Vite configuration is now properly applied to the internal Vite instance
- **🎯 Zero-Config Path Resolution**: Works out-of-the-box with existing TypeScript projects using path aliases

### 🚀 Improved
- **Better Project Compatibility**: Now supports modern TypeScript projects with path mappings (e.g., `@/` → `src/`)
- **Flexible Configuration**: Three ways to configure aliases - auto-detection, manual Vite config, or TypeScript config options
- **Developer Experience**: No need to rewrite imports when using phaser-viewer with existing codebases

### 📚 Technical Details
- Automatically reads `compilerOptions.paths` from tsconfig.json
- Converts TypeScript path patterns to Vite aliases
- Supports both array and object formats for alias configuration
- User-provided aliases override auto-detected ones for fine control

### 🔧 Configuration Examples
```typescript
// Zero config - auto-detects from tsconfig.json
export default {
  filePath: "./src/**/*.demo.ts"
}

// Manual control
export default {
  filePath: "./src/**/*.demo.ts",
  typescript: {
    autoDetectPaths: true, // default
    tsconfigPath: "./tsconfig.json" // optional
  }
}

// Vite config override
export default {
  filePath: "./src/**/*.demo.ts",
  vite: {
    resolve: {
      alias: [
        { find: "@/", replacement: "/absolute/path/to/src/" }
      ]
    }
  }
}
```

## [0.1.7] - 2025-01-08

### ✨ Added
- **🔄 Component Reset Button**: Added reset functionality in preview header to restore components to initial create state
- **🖼️ User Asset Support**: Implemented custom Vite plugin for serving user static assets (img/, assets/ directories)
- **🧹 Hidden Temp Directory**: Uses `.phaser-viewer-temp/` directory to keep project root clean and organized
- **🎯 Enhanced Type Inference**: Improved `Demo<typeof meta, Args>` pattern with better `ComponentFromMeta` type resolution

### 🔧 Fixed
- **Asset Loading Issues**: Resolved PreloadScene asset loading failures by implementing custom asset middleware
- **Vite Configuration**: Fixed duplicate plugins key causing server restart failures and build errors
- **TypeScript Types**: Fixed type inference issues for component parameters in play functions
- **Static Asset Serving**: Gold and other components with assets now display correctly in browser

### 🚀 Improved
- **User Experience**: Reset button preserves Play test results while allowing component state restoration
- **Performance**: Optimized Vite configuration for better asset serving and faster startup
- **Development Workflow**: Cleaner project structure with automatic .gitignore management for temp files
- **Error Handling**: Better error messages and debugging information for asset loading

### 📚 Technical Details
- Custom Vite middleware for `/img/` and `/assets/` routes
- Improved component lifecycle management for reset functionality
- Enhanced asset path resolution and content-type detection
- Better separation of Play test state and component display state

## [0.1.2] - 2025-01-04

### 🚀 Major Fixes

- **Fixed Play Function Execution**: Resolved critical issue where play functions weren't executing properly due to React useState treating them as initializer functions
- **Enhanced State Management**: Fixed component state preservation during testing by implementing `isPlayFunctionExecuting` flag
- **Removed Flickering**: Eliminated visual glitches during play function execution

### ✨ Improvements

- **Better Testing Experience**: Enhanced expect API with improved error handling and visual feedback in Play Logs panel
- **Improved Type Safety**: Better automatic component and args type inference for demos
- **Enhanced Emergency Play Function**: More flexible text validation patterns for button interactions
- **Cleaner UX**: Removed default "Select a story to preview" text for better interaction visibility

### 🔧 Technical Changes

- Changed play function storage from `useState` to `useRef` in App.tsx to prevent premature execution
- Added proper error handling and Promise resolution for play functions
- Improved component lifecycle management during testing
- Enhanced delay functionality with proper async/await handling

### 🐛 Bug Fixes

- Fixed issue where user-defined play functions were replaced by emergency fallback functions
- Fixed component reset during play execution causing state loss
- Fixed delay function not actually waiting for specified time
- Fixed TypeScript type compatibility issues with play function assignments

### 📚 Documentation

- Updated README with correct import syntax: `import { expect, delay, step } from 'phaser-viewer'`
- Added comprehensive library badges (npm version, downloads, tech stack)
- Enhanced testing examples with realistic scenarios
- Added Best Practices section with testing guidelines

## [0.1.1] - 2025-08-04

### ✨ Added
- **PreloadScene Support**: Complete asset loading system for Phaser components
  - Users can now create custom PreloadScene classes to handle asset loading
  - Two-stage scene architecture: PreloadScene → ViewerScene
  - Assets loaded in PreloadScene are automatically available in viewer scenes
  - Full TypeScript support with `preloadScene?: new () => Phaser.Scene` in Meta interface

### 🔧 Technical Implementation
- `UserPreloadSceneWrapper` class for dynamic PreloadScene instantiation
- Proper Phaser system integration (loader, scene manager, events)
- Scene flow management and transition handling
- Type-safe property assignment for user-provided PreloadScene classes

### 📚 Documentation
- Updated README with comprehensive PreloadScene usage guide
- Added examples for asset loading workflow
- Documented PreloadScene → ViewerScene architecture

### 🧪 Quality Assurance
- All TypeScript compilation errors resolved
- ESLint configuration updated and validated
- Comprehensive test suite passes (15/15 tests)
- Production-ready code quality standards met

### 🎯 Use Cases
- Components requiring image assets (sprites, textures)
- Audio-enabled game objects
- Complex asset dependencies
- Centralized asset management per component group

## [0.1.0] - 2024-XX-XX

### ✨ Initial Release
- Storybook-like UI for Phaser 3 component development
- Interactive testing with expect API
- Hot reload development server
- CLI-based setup with auto-generated React files
- TypeScript support with strict type checking
- Demo-based component organization
- Play function support for automated testing