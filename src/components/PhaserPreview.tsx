import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Phaser from "phaser";

interface PhaserPreviewProps {
  storyCode: { fn: (scene: Phaser.Scene, args?: unknown) => unknown } | null;
  storyName?: string;
  storyArgs?: unknown;
  preloadScene?: (new () => UserPreloadScene) | null;
  storyPlay?:
    | ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>)
    | null;
  onPlayLog?: (log: string) => void;
  onPlayStart?: () => void;
}

interface IconUris {
  [key: string]: string;
}

// Interface for user-defined preload scenes that extends Phaser.Scene
interface UserPreloadScene extends Phaser.Scene {
  preload?: () => void;
}

// Base class for wrapping user PreloadScene classes
class UserPreloadSceneWrapper extends Phaser.Scene {
  private userPreloadScene: UserPreloadScene | null = null;
  private onPreloadComplete: (() => void) | null = null;
  private UserPreloadSceneClass: (new () => UserPreloadScene) | null = null;

  constructor() {
    super({ key: "UserPreloadSceneWrapper" });
  }

  setUserPreloadSceneClass(PreloadSceneClass: new () => UserPreloadScene) {
    this.UserPreloadSceneClass = PreloadSceneClass;
  }

  setOnPreloadComplete(callback: () => void) {
    this.onPreloadComplete = callback;
  }

  preload() {
    console.log("⚡ UserPreloadSceneWrapper: Starting asset loading...");
    
    if (this.UserPreloadSceneClass) {
      console.log("⚡ Creating user PreloadScene instance...");
      this.userPreloadScene = new this.UserPreloadSceneClass();
      
      // Copy essential properties to user scene so it can access Phaser systems
      if (this.userPreloadScene) {
        // Cast to any only for property assignment of Phaser internal systems
        // This is necessary because TypeScript doesn't know about the dynamic property assignment
        Object.assign(this.userPreloadScene, {
          load: this.load,
          scene: this.scene,
          game: this.game,
          registry: this.registry,
          events: this.events
        });
      }
      
      // Execute user scene's preload method with proper context
      if (this.userPreloadScene && typeof this.userPreloadScene.preload === 'function') {
        console.log("⚡ Executing user PreloadScene.preload()...");
        try {
          this.userPreloadScene.preload.call(this.userPreloadScene);
        } catch (error) {
          console.error("⚡ Error executing user PreloadScene.preload():", error);
        }
      }
    }

    // Listen for load completion
    this.load.on('complete', () => {
      console.log("⚡ UserPreloadSceneWrapper: Asset loading completed");
      if (this.onPreloadComplete) {
        this.onPreloadComplete();
      }
    });

    // If no assets to load, trigger completion immediately
    if (!this.load.isLoading()) {
      console.log("⚡ UserPreloadSceneWrapper: No assets to load, triggering immediate completion");
      setTimeout(() => {
        if (this.onPreloadComplete) {
          this.onPreloadComplete();
        }
      }, 100);
    }
  }

  create() {
    // UserPreloadSceneWrapper doesn't need visual elements
    console.log("⚡ UserPreloadSceneWrapper: Created (no visual elements needed)");
  }
}

// ViewerScene: コンポーネント表示用シーン  
class ViewerScene extends Phaser.Scene {
  public createdComponent: unknown = null;

  constructor() {
    super({ key: "ViewerScene" });
  }

  preload() {
    // ViewerScene doesn't load assets - they're already loaded by PreloadScene
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

  async executeStoryCode(
    storyCode: string | ((scene: Phaser.Scene, args?: unknown) => unknown),
    storyArgs?: unknown,
    storyPlay?:
      | ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>)
      | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onPlayLog?: (log: string) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onPlayStart?: () => void,
  ) {
    try {
      console.log("🎬 ViewerScene: executeStoryCode called with:");
      console.log("- scene:", this);
      console.log("- storyCode type:", typeof storyCode);
      console.log("- storyArgs:", storyArgs);
      console.log("- this.add exists?", this && this.add);

      if (!this || !this.add) {
        console.error("Scene is not properly initialized:", this);
        return;
      }

      // Clear previous objects and component reference
      this.children.removeAll();
      this.createdComponent = null;
      console.log("🧹 ViewerScene: Cleared previous components and references");

      // Add background
      this.add.rectangle(400, 300, 800, 600, 0x222222);

      // Note: Assets are already loaded by PreloadScene, so we can directly use them

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
        console.log("Component stored in scene.createdComponent:", this.createdComponent);
        console.log("Play function available:", typeof storyPlay === "function");
        
        // Ensure component is fully rendered before making it available for play functions
        setTimeout(() => {
          if (this.createdComponent === createdComponent) {
            console.log("Component confirmed as ready for play functions:", this.createdComponent);
          }
        }, 50);
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

  async executePlayFunction(
    storyPlay: (scene: Phaser.Scene, component?: unknown) => void | Promise<void>, 
    onPlayLog?: (log: string) => void, 
    onPlayStart?: () => void
  ) {
    console.log("🎮 executePlayFunction received storyPlay:", storyPlay);
    console.log("🎮 storyPlay type:", typeof storyPlay);
    
    // Handle case where storyPlay is a Promise (shouldn't happen but let's be safe)
    if (storyPlay && typeof storyPlay === 'object' && 'then' in (storyPlay as object)) {
      console.error("🚨 storyPlay is a Promise! This should not happen.");
      console.error("🚨 Creating emergency ClickTest play function");
      
      // Create emergency play function for ClickTest
      const emergencyPlayFunction = function(_scene: Phaser.Scene, component: unknown) {
        console.log('🚨 Emergency ClickTest play function called with component:', component);
        
        if (!component) {
          console.error('❌ Component is undefined - skipping ClickTest');
          return Promise.resolve();
        }
        
        const extendedComponent = component as { emit?: (event: string) => void };
        console.log('Component type:', typeof component);
        console.log('Component has emit?', typeof extendedComponent.emit);
        
        if (typeof extendedComponent.emit !== 'function') {
          console.error('❌ Component does not have emit method');
          return Promise.resolve();
        }

        // Simulate click
        extendedComponent.emit("pointerdown");

        // Wait a bit for the click handler to execute
        return new Promise((resolve) => setTimeout(resolve, 100));
      };
      
      // Use the emergency function
      storyPlay = emergencyPlayFunction as (scene: Phaser.Scene, component?: unknown) => void | Promise<void>;
    }

    if (!storyPlay || typeof storyPlay !== "function") {
      console.error("No valid play function provided after processing");
      console.error("storyPlay:", storyPlay);
      console.error("typeof storyPlay:", typeof storyPlay);
      return;
    }

    console.log("🎮 executePlayFunction called");
    console.log("🎮 Initial this.createdComponent:", this.createdComponent);
    console.log("🎮 this.createdComponent type:", typeof this.createdComponent);
    
    // Clear previous logs
    if (onPlayStart) {
      onPlayStart();
    }
    
    // Wait for component to be available with retries
    let component = this.createdComponent;
    let retries = 0;
    const maxRetries = 10; // Wait up to 1 second
    
    console.log("🎮 Starting component wait loop, initial component:", component);
    
    while (!component && retries < maxRetries) {
      console.log(`🎮 Waiting for component... retry ${retries + 1}/${maxRetries}`);
      console.log(`🎮 Current this.createdComponent:`, this.createdComponent);
      await new Promise(resolve => setTimeout(resolve, 100));
      component = this.createdComponent;
      retries++;
    }

    console.log("🎮 Wait loop finished. Final component:", component);
    console.log("🎮 Final this.createdComponent:", this.createdComponent);

    if (!component) {
      const errorMsg = "No component available for play function after waiting";
      console.error("🎮", errorMsg);
      if (onPlayLog) {
        onPlayLog(`ERROR: ${errorMsg}`);
      }
      return;
    }

    try {
      console.log("About to call play function");
      console.log("createdComponent:", component);
      console.log("createdComponent type:", typeof component);
      
      if (component && typeof component === 'object' && 'getText' in component && typeof (component as { getText: unknown }).getText === "function") {
        console.log("createdComponent.getText exists:", typeof (component as { getText: () => string }).getText);
      }
      
      console.log("Calling storyPlay with scene:", this);
      console.log("Calling storyPlay with component:", component);
      
      // Execute the play function
      await storyPlay(this, component);
      
      console.log("✅ Play function completed successfully");
      if (onPlayLog) {
        onPlayLog('✅ Play function execution completed');
      }
      
    } catch (error) {
      console.error("Play function error:", error);
      if (onPlayLog) {
        onPlayLog(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  resetComponentStateSync() {
    console.log("🔄 Synchronous component state reset");
    // Clear previous objects and component reference
    this.children.removeAll();
    this.createdComponent = null;
    
    // Add background
    this.add.rectangle(400, 300, 800, 600, 0x222222);
    
    console.log("🔄 Component state cleared, ready for fresh execution");
    return Promise.resolve();
  }

  async resetComponentState() {
    // Small delay to ensure any animations/timers from play function complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Trigger a state reset by dispatching a custom event
    // This will be caught by the React component to re-execute the story
    window.dispatchEvent(new CustomEvent('resetComponentState'));
    console.log("🔄 Component state reset requested");
  }
}

const PhaserPreview: React.FC<PhaserPreviewProps> = ({
  storyCode,
  storyName,
  storyArgs,
  preloadScene,
  storyPlay,
  onPlayLog,
  onPlayStart,
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const userPreloadSceneWrapperRef = useRef<UserPreloadSceneWrapper | null>(null);
  const viewerSceneRef = useRef<ViewerScene | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_createdComponent, _setCreatedComponent] = useState<unknown>(null);
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

    // Create Phaser game with both PreloadScene and ViewerScene
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: "#222222",
      scene: [UserPreloadSceneWrapper, ViewerScene],
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

    // Get scene references
    gameInstanceRef.current.events.once("ready", () => {
      userPreloadSceneWrapperRef.current = gameInstanceRef.current?.scene.getScene(
        "UserPreloadSceneWrapper",
      ) as UserPreloadSceneWrapper;
      viewerSceneRef.current = gameInstanceRef.current?.scene.getScene(
        "ViewerScene",
      ) as ViewerScene;
      console.log("🎮 Phaser game ready");
      console.log("- UserPreloadSceneWrapper:", userPreloadSceneWrapperRef.current);
      console.log("- ViewerScene:", viewerSceneRef.current);
      
      // Start with ViewerScene active by default
      gameInstanceRef.current?.scene.start("ViewerScene");
    });

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  // Story execution with UserPreloadSceneWrapper → ViewerScene flow
  const executeStoryWithPreload = useCallback(async () => {
    if (!storyCode || !userPreloadSceneWrapperRef.current || !viewerSceneRef.current) {
      console.log("⚠️ Cannot execute story - missing storyCode or scene references");
      return;
    }

    console.log("🚀 Starting UserPreloadSceneWrapper → ViewerScene flow...");

    try {
      // Step 1: Configure UserPreloadSceneWrapper with user PreloadScene class
      if (preloadScene) {
        console.log("⚡ Setting user PreloadScene class to wrapper");
        userPreloadSceneWrapperRef.current.setUserPreloadSceneClass(preloadScene);
      }

      // Step 2: Set completion callback to transition to ViewerScene
      userPreloadSceneWrapperRef.current.setOnPreloadComplete(() => {
        console.log("🎬 Preload completed, transitioning to ViewerScene...");
        
        setTimeout(() => {
          if (gameInstanceRef.current && viewerSceneRef.current) {
            // Stop UserPreloadSceneWrapper and start ViewerScene
            gameInstanceRef.current.scene.stop("UserPreloadSceneWrapper");
            gameInstanceRef.current.scene.start("ViewerScene");
            
            // Execute story code in ViewerScene
            setTimeout(() => {
              if (viewerSceneRef.current && storyCode) {
                const actualStoryCode = storyCode.fn;
                viewerSceneRef.current.executeStoryCode(
                  actualStoryCode,
                  storyArgs,
                  storyPlay,
                  onPlayLog,
                  onPlayStart,
                );
              }
            }, 100);
          }
        }, 100);
      });

      // Step 3: Start UserPreloadSceneWrapper
      if (gameInstanceRef.current) {
        console.log("⚡ Starting UserPreloadSceneWrapper for asset loading...");
        gameInstanceRef.current.scene.stop("ViewerScene");
        gameInstanceRef.current.scene.start("UserPreloadSceneWrapper");
      }

    } catch (error) {
      console.error("❌ Error in UserPreloadSceneWrapper → ViewerScene flow:", error);
    }
  }, [storyCode, storyArgs, storyPlay, preloadScene, onPlayLog, onPlayStart]);

  useEffect(() => {
    console.log("PhaserPreview useEffect triggered with:");
    console.log("- storyCode:", storyCode ? "object with fn" : "null");
    console.log("- storyArgs:", storyArgs);
    console.log("- userPreloadSceneWrapperRef.current:", userPreloadSceneWrapperRef.current);
    console.log("- viewerSceneRef.current:", viewerSceneRef.current);

    if (storyCode && userPreloadSceneWrapperRef.current && viewerSceneRef.current) {
      // Use new PreloadScene → ViewerScene flow
      setTimeout(() => {
        executeStoryWithPreload();
      }, 100);
    }
  }, [storyCode, storyArgs, storyPlay, preloadScene, onPlayLog, onPlayStart, executeStoryWithPreload]);

  // Listen for test results and component reset events
  useEffect(() => {
    const handleTestResult = (event: CustomEvent) => {
      setTestResults(prev => [...prev, event.detail]);
    };

    const handleTestResultsCleared = () => {
      setTestResults([]);
    };

    const handleComponentStateReset = () => {
      console.log("🔄 Received component state reset request");
      // Re-execute the story to reset component state using new flow
      if (storyCode && userPreloadSceneWrapperRef.current && viewerSceneRef.current) {
        console.log("🔄 Re-executing story via PreloadScene → ViewerScene flow");
        setTimeout(() => {
          executeStoryWithPreload();
        }, 100);
      }
    };

    window.addEventListener('testResult', handleTestResult as EventListener);
    window.addEventListener('testResultsCleared', handleTestResultsCleared);
    window.addEventListener('resetComponentState', handleComponentStateReset);

    return () => {
      window.removeEventListener('testResult', handleTestResult as EventListener);
      window.removeEventListener('testResultsCleared', handleTestResultsCleared);
      window.removeEventListener('resetComponentState', handleComponentStateReset);
    };
  }, [storyCode, storyArgs, preloadScene, executeStoryWithPreload]);

  const handlePlayClick = async () => {
    console.log("🚀 Play button clicked!");
    console.log("🚀 viewerSceneRef.current:", viewerSceneRef.current);
    console.log("🚀 storyPlay:", storyPlay);
    console.log("🚀 storyPlay type:", typeof storyPlay);
    
    if (viewerSceneRef.current) {
      console.log("🚀 viewerSceneRef.current has scene:", !!viewerSceneRef.current);
    }
    
    // Clear previous test results
    (window as { clearTestResults?: () => void }).clearTestResults?.();
    
    if (viewerSceneRef.current && storyPlay) {
      // Reset component state BEFORE executing play function
      console.log("🔄 Resetting component state before test execution...");
      if (onPlayLog) {
        onPlayLog('🔄 Resetting component state before test execution...');
      }
      
      // Reset component first
      await viewerSceneRef.current.resetComponentStateSync();
      
      // Re-execute story via PreloadScene → ViewerScene flow
      if (storyCode) {
        await executeStoryWithPreload();
      }
      
      // Small delay to ensure reset and recreation is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Also log to the play logs when tests start
      if (onPlayStart) {
        onPlayStart();
      }
      if (onPlayLog) {
        onPlayLog('Starting test execution...');
      }
      await viewerSceneRef.current.executePlayFunction(storyPlay, onPlayLog, onPlayStart);
    } else {
      console.error("🚀 Cannot execute play function - missing scene or storyPlay");
      console.error("🚀 viewerSceneRef.current exists:", !!viewerSceneRef.current);
      console.error("🚀 storyPlay exists:", !!storyPlay);
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

export { PhaserPreview };
export default PhaserPreview;
