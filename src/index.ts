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
}

export interface DemoObj<TComponent = unknown, TArgs = unknown> {
  name: string;
  args: TArgs;
  create: (scene: Phaser.Scene, args: TArgs) => TComponent;
  play?: (scene: Phaser.Scene, component: TComponent) => void | Promise<void>;
}

// Helper type to extract component instance type from Meta
export type ComponentFromMeta<TMeta> = TMeta extends Meta<infer T> 
  ? T extends new (...args: unknown[]) => infer Instance 
    ? Instance 
    : T 
  : unknown;

// Simplified Demo type that combines meta and args inference
export type Demo<TMeta extends Meta<unknown>, TArgs = unknown> = DemoObj<ComponentFromMeta<TMeta>, TArgs>;

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

// Main component exports (no default export to avoid confusion)