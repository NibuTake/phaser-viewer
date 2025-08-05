import * as Phaser from 'phaser';
import type { Meta } from '../index';

export interface PhaserTestEnvironment {
  game: Phaser.Game;
  scene: Phaser.Scene;
  cleanup: () => Promise<void>;
}

// テスト用のシーンクラス
export class TestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestScene' });
  }

  preload() {
    // 基本的なテスト用アセット（必要に応じて）
  }

  create() {
    // テスト用の背景設定
    this.add.rectangle(400, 300, 800, 600, 0x222222);
  }
}

// UserPreloadSceneのテスト用ラッパー
export class TestPreloadSceneWrapper extends Phaser.Scene {
  private UserPreloadSceneClass: (new () => Phaser.Scene) | null = null;

  constructor() {
    super({ key: 'TestPreloadSceneWrapper' });
  }

  setUserPreloadSceneClass(PreloadSceneClass: new () => Phaser.Scene) {
    this.UserPreloadSceneClass = PreloadSceneClass;
  }

  preload() {
    if (this.UserPreloadSceneClass) {
      const userPreloadScene = new this.UserPreloadSceneClass();
      
      // プロパティを移譲
      Object.assign(userPreloadScene, {
        load: this.load,
        scene: this.scene,
        game: this.game,
        registry: this.registry,
        events: this.events,
      });

      if (typeof (userPreloadScene as Phaser.Scene & { preload?: () => void }).preload === 'function') {
        (userPreloadScene as Phaser.Scene & { preload: () => void }).preload.call(userPreloadScene);
      }
    }
  }

  create() {
    // プリロード完了後、TestSceneを開始
    this.scene.start('TestScene');
  }
}

export async function createPhaserTestEnvironment(meta: Meta): Promise<PhaserTestEnvironment> {
  // テスト用のPhaserゲーム設定
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS, // WebGLより軽量
    width: 800,
    height: 600,
    parent: document.body,
    backgroundColor: '#222222',
    scene: meta.preloadScene 
      ? [TestPreloadSceneWrapper, TestScene]
      : [TestScene],
    audio: {
      noAudio: true, // オーディオ無効
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    render: {
      pixelArt: false,
      antialias: false,
      clearBeforeRender: false, // パフォーマンス向上
    },
  };

  const game = new Phaser.Game(config);

  // ゲーム初期化完了を待機
  await new Promise<void>((resolve) => {
    game.events.once('ready', () => {
      resolve();
    });
  });

  let scene: Phaser.Scene;

  if (meta.preloadScene) {
    // PreloadSceneを設定
    const preloadWrapper = game.scene.getScene('TestPreloadSceneWrapper') as TestPreloadSceneWrapper;
    preloadWrapper.setUserPreloadSceneClass(meta.preloadScene);
    
    // アセット読み込み完了を待機
    await new Promise<void>((resolve) => {
      const testScene = game.scene.getScene('TestScene');
      if (testScene) {
        resolve();
      } else {
        game.scene.start('TestPreloadSceneWrapper');
        // TestSceneの開始を待機
        setTimeout(() => {
          resolve();
        }, 100);
      }
    });
    
    scene = game.scene.getScene('TestScene');
  } else {
    game.scene.start('TestScene');
    scene = game.scene.getScene('TestScene');
  }

  const cleanup = async () => {
    if (game) {
      game.destroy(true);
    }
  };

  return {
    game,
    scene,
    cleanup,
  };
}

export async function cleanupPhaserTestEnvironment(testEnv: PhaserTestEnvironment): Promise<void> {
  await testEnv.cleanup();
  
  // 少し待機してメモリクリーンアップ
  await new Promise(resolve => setTimeout(resolve, 50));
}