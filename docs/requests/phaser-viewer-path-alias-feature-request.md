# Feature Request: TypeScript Path Alias Support in phaser-viewer

## Executive Summary

**Current Issue**: phaser-viewer v0.1.7 does not support TypeScript path aliases (e.g., `@/` → `src/`), causing import resolution failures in projects that extensively use modern TypeScript path mapping.

**Impact**: Users cannot use phaser-viewer with real-world TypeScript projects that follow modern development patterns, limiting the tool's practical adoption.

**Proposed Solution**: Add comprehensive support for TypeScript path alias resolution through multiple approaches.

---

## Problem Description

### Current Behavior
phaser-viewer fails to resolve TypeScript path aliases, resulting in errors like:
```
Failed to resolve import "@/features/player/Player" from "src/features/card/ui/CardSprite.demo.ts". Does the file exist?
```

### Root Cause Analysis
1. **Missing Vite Configuration Inheritance**: phaser-viewer does not inherit the user project's `vite.config.ts` settings
2. **No tsconfig.json Path Reading**: The tool doesn't automatically read `compilerOptions.paths` from `tsconfig.json`
3. **Limited Configuration API**: The current config format doesn't effectively pass Vite settings to the internal Vite instance

### Real-World Impact
Modern TypeScript projects commonly use path aliases like:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

Without support, users must either:
1. Rewrite all imports to relative paths (maintenance burden)
2. Create separate demo files (code duplication)
3. Cannot use phaser-viewer at all (adoption barrier)

---

## Proposed Solutions

### Option 1: Automatic tsconfig.json Integration (Recommended)
**Auto-detect and apply TypeScript path mappings from the project's configuration.**

```typescript
// Implementation approach
import { loadConfig } from 'tsconfig-paths';
import { pathsToModuleNameMapper } from 'ts-jest';

const tsConfig = loadConfig('./');
if (tsConfig.resultType === 'success') {
  const viteAliases = pathsToModuleNameMapper(tsConfig.paths, { 
    prefix: tsConfig.absoluteBaseUrl 
  });
  // Apply to internal Vite configuration
}
```

**Benefits:**
- Zero configuration for users
- Automatic compatibility with existing projects
- Follows TypeScript standard practices

### Option 2: Enhanced Vite Configuration Support
**Fix the current `vite` property in phaser-viewer.config.ts to actually work.**

```typescript
// phaser-viewer.config.ts - Current approach that should work but doesn't
export default {
  filePath: "./src/**/*.demo.ts",
  vite: {
    resolve: {
      alias: [
        { find: "@/", replacement: path.resolve(__dirname, "./src/") },
        { find: "@/components/", replacement: path.resolve(__dirname, "./src/components/") }
      ]
    }
  }
} satisfies PhaserViewerConfig;
```

**Current Issue**: The `vite` configuration is loaded but not applied to the actual Vite resolver.

**Fix Required**: Ensure the Vite configuration merging in the internal build process.

### Option 3: Project Configuration Inheritance
**Automatically inherit from existing vite.config.ts in the project.**

```typescript
// Auto-detect and merge user's Vite configuration
import { loadConfigFromFile, mergeConfig } from 'vite';

const userConfig = await loadConfigFromFile(configEnv, './vite.config.ts');
const mergedConfig = mergeConfig(userConfig?.config || {}, viewerInternalConfig);
```

**Benefits:**
- Complete compatibility with existing projects
- No additional configuration needed
- Respects all user Vite settings (not just aliases)

---

## Technical Implementation Details

### Current Architecture Analysis
Based on investigation, phaser-viewer v0.1.7:
1. ✅ Reads user configuration from `phaser-viewer.config.ts`
2. ✅ Logs configuration including `vite` property
3. ❌ Does not apply `vite` settings to internal Vite instance
4. ❌ No automatic TypeScript configuration detection

### Required Changes

#### 1. Configuration Loading Enhancement
```typescript
// In phaser-viewer internal code
interface PhaserViewerConfig {
  filePath: string;
  port?: number;
  scene?: SceneConfig;
  // Enhanced Vite support
  vite?: InlineConfig;
  // Auto-detection options
  typescript?: {
    autoDetectPaths?: boolean;
    tsconfigPath?: string;
  };
}
```

#### 2. Vite Configuration Merging
```typescript
// Proper Vite config merging
const createViteConfig = async (userConfig: PhaserViewerConfig): Promise<InlineConfig> => {
  let baseConfig: InlineConfig = {
    // phaser-viewer internal config
  };

  // Option 1: Auto-detect TypeScript paths
  if (userConfig.typescript?.autoDetectPaths !== false) {
    const tsAliases = await detectTypeScriptAliases(userConfig.typescript?.tsconfigPath);
    baseConfig.resolve = {
      ...baseConfig.resolve,
      alias: [...(baseConfig.resolve?.alias || []), ...tsAliases]
    };
  }

  // Option 2: Merge user Vite config
  if (userConfig.vite) {
    baseConfig = mergeConfig(baseConfig, userConfig.vite);
  }

  // Option 3: Inherit project Vite config
  const projectViteConfig = await loadProjectViteConfig();
  if (projectViteConfig) {
    baseConfig = mergeConfig(projectViteConfig, baseConfig);
  }

  return baseConfig;
};
```

---

## Usage Examples

### After Implementation - Zero Config (Recommended)
```typescript
// phaser-viewer.config.ts
export default {
  filePath: "./src/**/*.demo.ts"
  // TypeScript paths automatically detected from tsconfig.json
} satisfies PhaserViewerConfig;
```

### After Implementation - Explicit Config
```typescript
// phaser-viewer.config.ts  
export default {
  filePath: "./src/**/*.demo.ts",
  typescript: {
    autoDetectPaths: true,
    tsconfigPath: "./tsconfig.json" // optional, defaults to ./tsconfig.json
  }
} satisfies PhaserViewerConfig;
```

### After Implementation - Manual Vite Config (Fixed)
```typescript
// phaser-viewer.config.ts
export default {
  filePath: "./src/**/*.demo.ts",
  vite: {
    resolve: {
      alias: [
        { find: "@/", replacement: path.resolve(process.cwd(), "./src/") }
      ]
    }
  }
} satisfies PhaserViewerConfig;
```

---

## Testing Requirements

### Test Cases to Validate
1. **Auto-detection**: Project with `tsconfig.json` paths should work without additional config
2. **Vite merging**: Manual `vite` property in config should be respected
3. **Project inheritance**: Should inherit from existing `vite.config.ts`
4. **Nested aliases**: Complex path mappings should be resolved correctly
5. **ES Modules**: Should work with both CommonJS and ES module projects

### Sample Project Structure for Testing
```
test-project/
├── tsconfig.json          # paths: { "@/*": ["./src/*"] }
├── vite.config.ts         # alias configuration
├── phaser-viewer.config.ts
└── src/
    ├── components/
    │   └── Button.demo.ts # imports "@/utils/helper"
    └── utils/
        └── helper.ts
```

---

## Benefits of Implementation

### For Users
- **Zero Configuration**: Works out-of-the-box with existing TypeScript projects
- **No Code Changes**: Existing demo files don't need import path modifications
- **Industry Standard**: Follows modern TypeScript/Vite development patterns
- **Better DX**: Seamless integration with existing toolchain

### For phaser-viewer Adoption
- **Broader Compatibility**: Works with real-world projects
- **Professional Usage**: Suitable for enterprise/commercial projects
- **Community Growth**: Removes major adoption barrier
- **Tool Ecosystem**: Better integration with TypeScript/Vite ecosystem

---

## Priority and Impact

**Priority**: High
**User Impact**: High - This is a fundamental compatibility issue
**Implementation Complexity**: Medium
**Breaking Changes**: None (all changes are additive and backward compatible)

---

## Error Logs for Reference

Current error patterns when path aliases fail:
```
[vite] Internal server error: Failed to resolve import "@/features/player/Player" 
  from "src/features/card/ui/CardSprite.demo.ts". Does the file exist?
[vite] Pre-transform error: Failed to resolve import "@/components/color" 
  from "src/features/card/ui/CardSprite.ts". Does the file exist?
[vite] Pre-transform error: Failed to resolve import "@/assetSets/image/CardSet" 
  from "src/dataset/card/AttackCardList.ts". Does the file exist?
```

These errors occur even when the configuration appears to load correctly:
```
🔧 Loaded user config: {
  filePath: './src/**/*.demo.ts',
  vite: { resolve: { alias: [Array] } }  // ← Configuration loads but isn't applied
}
```

---

## Conclusion

Adding TypeScript path alias support is essential for phaser-viewer's practical adoption in modern TypeScript projects. The recommended implementation combines automatic detection with manual override options, ensuring both ease of use and flexibility.

This feature would transform phaser-viewer from a demo tool into a production-ready component development environment compatible with industry-standard TypeScript projects.