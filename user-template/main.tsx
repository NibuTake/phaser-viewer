import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PhaserViewer } from 'phaser-viewer';

// THIS is where the user's import.meta.glob runs - in the user's project!
// This is the correct Storybook approach
const userStoryModules = import.meta.glob('./examples/**/*.demo.ts', { eager: true });

console.log('🔍 User project story modules found:', Object.keys(userStoryModules));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PhaserViewer userStoryModules={userStoryModules} />
  </StrictMode>
);