// Phaser Viewer - A Storybook-like development environment for Phaser 3
export { default as PhaserViewer } from './App';
export { default as PhaserPreview } from './components/PhaserPreview';
export { default as Sidebar } from './components/Sidebar';
export { loadStoryGroups, setupGlobalComponents } from './utils/storyLoader';

// Types
export interface StoryGroup {
  title: string;
  description?: string;
  tags?: string[];
  stories: Story[];
}

export interface Story {
  name: string;
  create: (scene: Phaser.Scene, args?: unknown) => unknown;
  args?: unknown;
  play?: (scene: Phaser.Scene, component?: unknown) => void | Promise<void>;
}

// Main component exports (no default export to avoid confusion)