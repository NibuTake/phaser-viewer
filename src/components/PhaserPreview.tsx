import React, { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";

interface PhaserPreviewProps {
  storyCode: { fn: (scene: Phaser.Scene, args?: unknown) => unknown } | null;
  storyName?: string;
  storyArgs?: unknown;
  storyPlay?:
    | ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>)
    | null;
  onPlayLog?: (log: string) => void;
  onPlayStart?: () => void;
}

interface IconUris {
  [key: string]: string;
}

class PreviewScene extends Phaser.Scene {
  private createdComponent: any = null;

  constructor() {
    super({ key: "PreviewScene" });
  }

  preload() {
    // Add any asset loading here
  }

  create() {
    // Clear previous objects
    this.children.removeAll();

    // Add background
    this.add.rectangle(400, 300, 800, 600, 0x222222);

    // Add default text
    this.add
      .text(400, 300, "Select a story to preview", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }

  executeStoryCode(
    storyCode: string | ((scene: Phaser.Scene, args?: unknown) => unknown),
    storyArgs?: unknown,
    storyPlay?:
      | ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>)
      | null,
    onPlayLog?: (log: string) => void,
    onPlayStart?: () => void,
  ) {
    try {
      console.log("executeStoryCode called with:");
      console.log("- scene:", this);
      console.log("- storyCode type:", typeof storyCode);
      console.log("- storyArgs:", storyArgs);
      console.log("- this.add exists?", this && this.add);

      if (!this || !this.add) {
        console.error("Scene is not properly initialized:", this);
        return;
      }

      // Clear previous objects
      this.children.removeAll();

      // Add background
      this.add.rectangle(400, 300, 800, 600, 0x222222);

      let storyFunction: (scene: Phaser.Scene) => unknown;

      if (typeof storyCode === "function") {
        // 直接関数として実行
        console.log("Executing function directly, args:", storyArgs);
        console.log("Scene object:", this);
        // 常にargsを渡す（undefinedでも）
        storyFunction = (scene: Phaser.Scene) => storyCode(scene, storyArgs);
      } else if (typeof storyCode === "string") {
        // 文字列の場合は従来通り
        console.log(
          "Executing story code:",
          storyCode.substring(0, 200) + "...",
        );
        const createFunction = new Function("scene", `return ${storyCode};`);
        storyFunction = createFunction();
      } else {
        throw new Error("Invalid story code type");
      }

      if (typeof storyFunction === "function") {
        console.log(
          "Calling storyFunction with scene:",
          this,
          "Scene valid?",
          this && this.add,
        );
        const createdComponent = storyFunction(this);
        console.log("storyFunction returned:", createdComponent);
        console.log("createdComponent type:", typeof createdComponent);

        // Store the component for potential play function execution
        this.createdComponent = createdComponent;
        console.log("Component created successfully:", createdComponent);
        console.log("Play function available:", typeof storyPlay === "function");
      } else {
        console.error(
          "Story code did not return a function, got:",
          typeof storyFunction,
        );
        this.add
          .text(400, 300, "Invalid story code", {
            fontSize: "18px",
            color: "#ff0000",
          })
          .setOrigin(0.5);
      }
    } catch (error) {
      console.error("Error executing story code:", error);
      this.add
        .text(400, 300, "Error executing story", {
          fontSize: "18px",
          color: "#ff0000",
        })
        .setOrigin(0.5);
    }
  }

  executePlayFunction(storyPlay: Function, onPlayLog?: (log: string) => void, onPlayStart?: () => void) {
    if (!storyPlay || typeof storyPlay !== "function") {
      console.error("No valid play function provided");
      return;
    }

    if (!this.createdComponent) {
      console.error("No component available for play function");
      return;
    }

    console.log("Executing play function...");
    
    // Clear previous logs
    if (onPlayStart) {
      onPlayStart();
    }
    
    try {
      console.log("About to call play function");
      console.log("createdComponent:", this.createdComponent);
      console.log("createdComponent type:", typeof this.createdComponent);
      
      if (this.createdComponent && typeof this.createdComponent.getText === "function") {
        console.log("createdComponent.getText exists:", typeof this.createdComponent.getText);
      }
      
      console.log("Calling storyPlay with scene:", this);
      console.log("Calling storyPlay with component:", this.createdComponent);
      
      // Execute the play function
      storyPlay(this, this.createdComponent);
      
    } catch (error) {
      console.error("Play function error:", error);
      if (onPlayLog) {
        onPlayLog(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

export const PhaserPreview: React.FC<PhaserPreviewProps> = ({
  storyCode,
  storyName,
  storyArgs,
  storyPlay,
  onPlayLog,
  onPlayStart,
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<PreviewScene | null>(null);
  const [createdComponent, setCreatedComponent] = useState<any>(null);
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    status: 'pass' | 'fail';
    message: string;
  }>>([]);

  useEffect(() => {
    if (!gameRef.current) return;

    // Prepare icon URIs for global access
    const iconUris: IconUris = {
      "icon-16": "/icons/icon-16.png",
      "icon-32": "/icons/icon-32.png",
      "icon-64": "/icons/icon-64.png",
      "icon-128": "/icons/icon-128.png",
    };

    // Make icons globally available (for compatibility with existing demos)
    (window as { iconUris?: IconUris }).iconUris = iconUris;

    // Create Phaser game
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: "#222222",
      scene: PreviewScene,
      audio: {
        disableWebAudio: true, // オーディオエラーを回避
        noAudio: true,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    };

    gameInstanceRef.current = new Phaser.Game(config);

    // Get scene reference
    gameInstanceRef.current.events.once("ready", () => {
      sceneRef.current = gameInstanceRef.current?.scene.getScene(
        "PreviewScene",
      ) as PreviewScene;
      console.log("Phaser game ready, scene:", sceneRef.current);
    });

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    console.log("PhaserPreview useEffect triggered with:");
    console.log("- storyCode:", storyCode ? "object with fn" : "null");
    console.log("- storyArgs:", storyArgs);
    console.log("- sceneRef.current:", sceneRef.current);

    if (storyCode && sceneRef.current) {
      // 少し遅延を入れてsceneが完全に初期化されるのを待つ
      setTimeout(() => {
        if (sceneRef.current) {
          console.log("PhaserPreview received storyArgs:", storyArgs);
          console.log(
            "About to call executeStoryCode with scene:",
            sceneRef.current,
          );

          // Extract actual functions from object wrapper
          const actualStoryCode = storyCode?.fn;

          console.log("storyPlay before extraction:", storyPlay);
          console.log("storyPlay type before extraction:", typeof storyPlay);

          // storyPlay is now stored directly as a function reference
          const actualStoryPlay = storyPlay;

          console.log("actualStoryPlay after extraction:", actualStoryPlay);
          console.log(
            "actualStoryPlay type after extraction:",
            typeof actualStoryPlay,
          );

          sceneRef.current.executeStoryCode(
            actualStoryCode,
            storyArgs,
            actualStoryPlay,
            onPlayLog,
            onPlayStart,
          );
        }
      }, 100);
    }
  }, [storyCode, storyArgs, storyPlay, onPlayLog, onPlayStart]);

  // Listen for test results
  useEffect(() => {
    const handleTestResult = (event: CustomEvent) => {
      setTestResults(prev => [...prev, event.detail]);
    };

    const handleTestResultsCleared = () => {
      setTestResults([]);
    };

    window.addEventListener('testResult', handleTestResult as EventListener);
    window.addEventListener('testResultsCleared', handleTestResultsCleared);

    return () => {
      window.removeEventListener('testResult', handleTestResult as EventListener);
      window.removeEventListener('testResultsCleared', handleTestResultsCleared);
    };
  }, []);

  const handlePlayClick = () => {
    // Clear previous test results
    (window as any).clearTestResults?.();
    
    if (sceneRef.current && storyPlay) {
      // Also log to the play logs when tests start
      if (onPlayStart) {
        onPlayStart();
      }
      if (onPlayLog) {
        onPlayLog('Starting test execution...');
      }
      sceneRef.current.executePlayFunction(storyPlay, onPlayLog, onPlayStart);
    }
  };

  // Calculate test result statistics
  const testStats = testResults.reduce(
    (acc, result) => {
      if (result.status === 'pass') {
        acc.passed++;
      } else {
        acc.failed++;
      }
      acc.total++;
      return acc;
    },
    { passed: 0, failed: 0, total: 0 }
  );

  return (
    <div className="phaser-preview">
      <div className="preview-header">
        <div className="header-left">
          <h2>{storyName || "Phaser Preview"}</h2>
          {testStats.total > 0 && (
            <div className="test-badges">
              {testStats.passed > 0 && (
                <span className="test-badge success">
                  ✅ {testStats.passed} Passed
                </span>
              )}
              {testStats.failed > 0 && (
                <span className="test-badge failed">
                  ❌ {testStats.failed} Failed
                </span>
              )}
            </div>
          )}
        </div>
        {storyPlay && (
          <button 
            className="play-button" 
            onClick={handlePlayClick}
          >
            ▶ Play
          </button>
        )}
      </div>
      <div ref={gameRef} className="game-container" />
      <style>{`
        .phaser-preview {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .preview-header {
          padding: 16px;
          background: #1e1e1e;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .preview-header h2 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }
        .test-badges {
          display: flex;
          gap: 8px;
        }
        .test-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }
        .test-badge.success {
          background: #28a745;
          color: white;
        }
        .test-badge.failed {
          background: #dc3545;
          color: white;
        }
        .play-button {
          background: #007acc;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .play-button:hover {
          background: #005a9e;
        }
        .play-button:active {
          background: #004578;
        }
        .game-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #000;
        }
      `}</style>
    </div>
  );
};

export default PhaserPreview;
