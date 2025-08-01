# Change Log

All notable changes to the "phaser-viewer" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-31

### Added
- **Storybook-like preview** for Phaser 3 GameObjects
- **Tree view panel** with hierarchical folder structure
- **Interactive controls** - Restart, Reset, Pause/Resume buttons
- **Interactive elements detection** - Auto-scan and highlight clickable objects
- **Hot reload** - Auto-refresh when story files change
- **Function export format** - Type-safe story writing with `export default function(scene: Phaser.Scene)`
- **Customizable canvas settings** - Width, height, background color, renderer type
- **Preview modes** - Single-click for preview tab, right-click for new tab
- **File format support** - `.stories.ts` files with TypeScript support

### Features
- 🎯 Interactive element highlighting and inspection
- 📁 Folder hierarchy display in tree view
- 🎮 Live Phaser 3 game preview with controls
- ⚙️ Configurable canvas settings through VSCode preferences
- 🔄 Hot reload and file watching
- 📝 Type-safe story writing with full TypeScript support

### Technical
- Built with TypeScript and Phaser 3.70.0
- WebView-based rendering with secure CSP
- Automatic story file detection and parsing
- Cross-platform compatibility (Windows, macOS, Linux)