# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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