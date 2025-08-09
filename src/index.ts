// Phaser Viewer - A Storybook-like development environment for Phaser 3
export { default as PhaserViewer } from './App';
export { default as PhaserPreview } from './components/PhaserPreview';
export { default as Sidebar } from './components/Sidebar';
export { loadStoryGroups, loadStoryGroupsFromModules, setupGlobalComponents } from './utils/storyLoader';

// Types - Demo-based Meta and Demo system
export interface Meta<T extends new (...args: unknown[]) => unknown = new (...args: unknown[]) => unknown> {
  component: T;
  title: string;
  description?: string;
  tags?: string[];
  parameters?: Record<string, unknown>;
  preloadScene?: new () => Phaser.Scene;
}

// Helper type to extract component instance type from Meta
export type ComponentFromMeta<TMeta> = TMeta extends { component: infer T }
  ? T extends abstract new (...args: unknown[]) => infer Instance 
    ? Instance
    : T extends new (...args: unknown[]) => infer Instance 
      ? Instance 
      : T extends { prototype: infer P }
        ? P
        : unknown
  : never;

// Improved Demo type with full type inference support
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Demo<TMeta extends Meta<any>, TArgs = unknown> = {
  name: string;
  args: TArgs;
  create: (scene: Phaser.Scene, args: TArgs) => ComponentFromMeta<TMeta>;
  play?: (scene: Phaser.Scene, component: ComponentFromMeta<TMeta>) => void | Promise<void>;
};

// Helper function for defining demos with full type inference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineDemo<TMeta extends Meta<any>, TArgs>(
  demo: {
    name: string;
    args: TArgs;
    create: (scene: Phaser.Scene, args: TArgs) => ComponentFromMeta<TMeta>;
    play?: (scene: Phaser.Scene, component: ComponentFromMeta<TMeta>) => void | Promise<void>;
  }
): Demo<TMeta, TArgs> {
  return demo;
}

// Alternative helper function for easier type inference
export function defineMeta<T extends new (...args: unknown[]) => unknown>(meta: {
  component: T;
  title: string;
  description?: string;
  tags?: string[];
  parameters?: Record<string, unknown>;
  preloadScene?: new () => Phaser.Scene;
}): Meta<T> & { component: T } {
  return meta as Meta<T> & { component: T };
}

// Legacy DemoObj interface for backward compatibility
export interface DemoObj<TComponent = unknown, TArgs = unknown> {
  name: string;
  args: TArgs;
  create: (scene: Phaser.Scene, args: TArgs) => TComponent;
  play?: (scene: Phaser.Scene, component: TComponent) => void | Promise<void>;
}

// Legacy Story interface for backward compatibility
export interface Story {
  name: string;
  create: (scene: Phaser.Scene, args?: unknown) => unknown;
  args?: unknown;
  play?: (scene: Phaser.Scene, component?: unknown) => void | Promise<void>;
}

export interface StoryGroup {
  title: string;
  description?: string;
  tags?: string[];
  stories: Story[];
}

// Configuration interface for phaser-viewer.config.ts
export interface PhaserViewerConfig {
  filePath: string;
  port?: number;
  scene?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    displayScale?: number; // Display scaling factor (0.1 - 2.0, default: auto)
  };
  // TypeScript path alias support
  typescript?: {
    autoDetectPaths?: boolean; // Auto-detect from tsconfig.json (default: true)
    tsconfigPath?: string; // Path to tsconfig.json (default: ./tsconfig.json)
  };
  // Vite configuration passthrough
  vite?: {
    resolve?: {
      alias?: Array<{ find: string; replacement: string }> | Record<string, string>;
    };
    // Allow other Vite config options
    [key: string]: unknown;
  };
}

// Development utilities
export { GridSystem } from './utils/GridSystem';

// Test utilities re-exported for convenience
export { expect, delay, step } from './utils/expect';

// Test runner exports
export * from './test-runner';

// Main component exports (no default export to avoid confusion)