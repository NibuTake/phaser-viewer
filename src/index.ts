// Phaser Viewer - A Storybook-like development environment for Phaser 3
export { default as PhaserViewer } from './App';
export { default as PhaserPreview } from './components/PhaserPreview';
export { default as Sidebar } from './components/Sidebar';
export { loadStoryGroups, loadStoryGroupsFromModules, setupGlobalComponents } from './utils/storyLoader';

// Types - Demo-based Meta and Demo system
export interface Meta<T = unknown> {
  component: T;
  title: string;
  description?: string;
  tags?: string[];
  parameters?: Record<string, unknown>;
  preloadScene?: new () => Phaser.Scene;
}

// Helper type to extract component instance type from Meta
export type ComponentFromMeta<TMeta> = TMeta extends { component: infer T }
  ? T extends new (...args: unknown[]) => infer Instance 
    ? Instance 
    : never
  : never;

// Improved Demo type with full type inference support
export type Demo<TMeta extends Meta<unknown>, TArgs = unknown> = {
  name: string;
  args: TArgs;
  create: (scene: Phaser.Scene, args: TArgs) => ComponentFromMeta<TMeta>;
  play?: (scene: Phaser.Scene, component: ComponentFromMeta<TMeta>) => void | Promise<void>;
};

// Helper function for defining demos with full type inference
export function defineDemo<TMeta extends Meta<unknown>, TArgs>(
  demo: {
    name: string;
    args: TArgs;
    create: (scene: Phaser.Scene, args: TArgs) => ComponentFromMeta<TMeta>;
    play?: (scene: Phaser.Scene, component: ComponentFromMeta<TMeta>) => void | Promise<void>;
  }
): Demo<TMeta, TArgs> {
  return demo;
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
}

// Test utilities re-exported for convenience
export { expect, delay, step } from './utils/expect';

// Test runner exports
export * from './test-runner';

// Main component exports (no default export to avoid confusion)