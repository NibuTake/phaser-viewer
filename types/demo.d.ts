import * as Phaser from 'phaser';

export interface DemoMeta {
    component?: any;
    title: string;
    description?: string;
    tags?: string[];
    parameters?: {
        scene?: {
            width?: number;
            height?: number;
            backgroundColor?: string;
            physics?: string | Phaser.Types.Core.PhysicsConfig;
        };
        docs?: {
            description?: string;
        };
    };
}

export interface DemoStory {
    name?: string;
    args?: Record<string, any>;
    create: (scene: Phaser.Scene, args?: any) => any;
    play?: (scene: Phaser.Scene, component?: any) => Promise<void>;
    parameters?: Record<string, any>;
}

export interface DemoModule {
    default: DemoMeta;
    [key: string]: DemoStory | DemoMeta;
}