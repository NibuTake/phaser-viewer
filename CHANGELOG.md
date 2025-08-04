# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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