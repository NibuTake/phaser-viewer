# Contributing to Phaser Viewer

Thank you for your interest in contributing to Phaser Viewer! 🎉

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- VSCode (for development and testing)
- Git

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/phaser-viewer.git
   cd phaser-viewer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Open in VSCode:
   ```bash
   code .
   ```
5. Press `F5` to launch the extension in debug mode

## 🛠️ Development Workflow

### Project Structure
```
phaser-viewer/
├── src/                     # TypeScript source files
│   ├── extension.ts         # Main extension entry point
│   ├── GameObjectLoader.ts  # Story file loading logic
│   ├── PhaserViewerProvider.ts # Tree view provider
│   └── webview/             # WebView related code
├── resources/               # Static resources (icons, etc.)
├── examples/                # Example story files
├── types/                   # Type definitions
└── templates/               # Story templates
```

### Building
```bash
npm run compile      # Compile TypeScript
npm run watch        # Watch mode for development
```

### Testing
- Press `F5` in VSCode to launch Extension Development Host
- Create test `.stories.ts` files to verify functionality
- Use VSCode Developer Tools for debugging (`Help` → `Toggle Developer Tools`)

## 📝 Coding Guidelines

### TypeScript Standards
- Use strict TypeScript settings
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Style
- Use 4 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Keep lines under 100 characters when possible

### Git Commit Messages
Follow conventional commits format:
```
type(scope): description

Examples:
feat(viewer): add interactive element highlighting
fix(loader): resolve story parsing for arrow functions
docs(readme): update installation instructions
```

## 🎯 Areas for Contribution

### High Priority
- **Testing**: Unit tests and integration tests
- **Error Handling**: Better error messages and recovery
- **Performance**: Optimize story loading and rendering
- **Documentation**: More examples and tutorials

### Medium Priority
- **Features**: New story formats, asset loading support
- **UI/UX**: Improved controls and user interface
- **Settings**: More customization options

### Good First Issues
- Fix typos in documentation
- Add new example story files
- Improve error messages
- Add keyboard shortcuts

## 🐛 Bug Reports

When reporting bugs, please include:
1. **Environment**: VSCode version, OS, extension version
2. **Steps to reproduce**: Clear step-by-step instructions
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Sample code**: Minimal example that reproduces the issue
6. **Screenshots**: If applicable

## 💡 Feature Requests

For new features:
1. **Check existing issues** to avoid duplicates
2. **Describe the use case** - why is this needed?
3. **Provide examples** - how would this work?
4. **Consider alternatives** - are there other ways to solve this?

## 🔄 Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding guidelines

3. **Test thoroughly**:
   - Test in Extension Development Host
   - Verify with different story file formats
   - Check TypeScript compilation

4. **Update documentation** if needed:
   - Update README.md for new features
   - Add/update code comments
   - Update CHANGELOG.md

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add awesome new feature"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**:
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Add reviewer suggestions if known

### PR Checklist
- [ ] Code compiles without errors
- [ ] Extension works in debug mode
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or clearly documented)
- [ ] Tests pass (when available)

## 📚 Resources

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Phaser 3 Documentation](https://phaser.io/phaser3/documentation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful and constructive in all interactions.

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Request Reviews**: For code-specific feedback

## 🙏 Recognition

All contributors will be recognized in our README.md. Thank you for making Phaser Viewer better! 

---

**Happy coding!** 🎮✨