# Test Environments

This directory contains isolated test environments for phaser-viewer development.

## Structure

```
test-envs/
├── latest/          # Latest development version test environment
│   ├── src/
│   │   ├── components/   # Sample components using path aliases
│   │   ├── utils/        # Utility modules
│   │   └── scenes/       # Complex demo scenes
│   ├── package.json      # Dependencies and scripts
│   ├── tsconfig.json     # TypeScript config with path aliases
│   └── phaser-viewer.config.ts  # Phaser Viewer configuration
└── README.md        # This file
```

## Usage

### Using Makefile (Recommended)

```bash
# Set up the environment
make setup-env

# Start development server
make dev-latest

# Run tests
make test-latest

# Clean and rebuild
make rebuild
```

### Manual Commands

```bash
# Install dependencies
cd test-envs/latest
npm install

# Start development server
npm run phaser-viewer

# Run automated tests
npm run test
```

## Features Tested

### Latest Environment

- **TypeScript Path Aliases**: Tests `@/`, `@/utils/*`, `@/components/*` imports
- **Component Library**: SimpleButton with full functionality and animations
- **Animation System**: Fade in, slide in animations via path aliases
- **Interactive Testing**: Click events, state changes, value assertions
- **Path Resolution**: Auto-detection from tsconfig.json

## Adding New Environments

For version-specific testing:

1. Create new directory: `test-envs/vX.X.X/`
2. Copy from `latest/` and update package.json version reference
3. Add to Makefile with new targets (e.g., `dev-vXXX`, `test-vXXX`)
4. Create version-specific demo content

## Path Alias Testing

The environment tests TypeScript path aliases:

```typescript
// These imports should resolve correctly
import { COLORS } from '@/utils/colors';
import { SimpleButton } from '@/components/SimpleButton';
import { ANIMATIONS } from '@/utils/animations';
```

Configuration in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```