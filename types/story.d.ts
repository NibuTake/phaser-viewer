/// <reference types="phaser" />

export type StoryFunction = (scene: Phaser.Scene) => void;

export interface StoryModule {
  default: StoryFunction;
  title?: string;
  description?: string;
}