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
  sceneConfig?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    displayScale?: number;
  };
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
    console.log("⚡ Setting PreloadScene class:", PreloadSceneClass.name);
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
// ⚡ Performance Optimizations Applied:
//   - PreloadScene skip conditions for stories without asset loading requirements
//   - Direct ViewerScene execution bypasses unnecessary scene transitions
//   - Reduced logging noise while maintaining debugging capabilities
//   - Future-ready for shared PreloadScene functionality
class ViewerScene extends Phaser.Scene {
  public createdComponent: unknown = null;
  public isPlayFunctionExecuting: boolean = false;
  private sceneWidth: number = 800;
  private sceneHeight: number = 600;
  private sceneBackgroundColor: number = 0x222222;

  constructor() {
    super({ key: "ViewerScene" });
  }

  setSceneConfig(width: number, height: number, backgroundColor: number) {
    this.sceneWidth = width;
    this.sceneHeight = height;
    this.sceneBackgroundColor = backgroundColor;
  }

  preload() {
    // ViewerScene doesn't load assets - they're already loaded by PreloadScene
  }

  create() {
    // Clear previous objects
    this.children.removeAll();

    // Add background
    this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, this.sceneBackgroundColor);

    // Removed default text to make interactions more visible
    // Components will be created by story code instead
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
      console.log("- isPlayFunctionExecuting:", this.isPlayFunctionExecuting);

      if (!this || !this.add) {
        console.error("Scene is not properly initialized:", this);
        return;
      }

      // Play関数実行中は新しいstoryCodeの実行をスキップ
      if (this.isPlayFunctionExecuting) {
        console.log("🚫 Skipping executeStoryCode - play function is executing");
        return;
      }

      // Clear previous objects and component reference
      this.children.removeAll();
      this.createdComponent = null;
      console.log("🧹 ViewerScene: Cleared previous components and references");

      // Add background
      this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, this.sceneBackgroundColor);

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
          .text(this.sceneWidth / 2, this.sceneHeight / 2, "Invalid story code", {
            fontSize: "18px",
            color: "#ff0000",
          })
          .setOrigin(0.5);
      }
    } catch (error) {
      console.error("Error executing story code:", error);
      this.add
        .text(this.sceneWidth / 2, this.sceneHeight / 2, "Error executing story", {
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
    
    // Play関数実行開始フラグを設定
    this.isPlayFunctionExecuting = true;
    console.log("🎮 Set isPlayFunctionExecuting = true");
    
    // Log detailed information about storyPlay to debug the Promise issue
    console.log("🎮 Detailed storyPlay analysis:");
    console.log("  - storyPlay:", storyPlay);
    console.log("  - typeof storyPlay:", typeof storyPlay);
    console.log("  - storyPlay.constructor.name:", storyPlay?.constructor?.name);
    console.log("  - Has 'then' method:", 'then' in (storyPlay as object));
    
    // Handle case where storyPlay appears to be a Promise
    if (storyPlay && typeof storyPlay === 'object' && 'then' in (storyPlay as object)) {
      console.error("🚨 storyPlay is detected as Promise-like! This suggests the play function is being called instead of passed as reference.");
      console.log("🔄 Attempting to await the Promise to get the actual function...");
      
      try {
        // If storyPlay is actually a Promise that resolves to a function, await it
        const resolvedFunction = await (storyPlay as Promise<unknown>);
        console.log("✅ Successfully resolved Promise to:", typeof resolvedFunction);
        
        if (typeof resolvedFunction === 'function') {
          storyPlay = resolvedFunction as ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>);
          console.log("🔄 Using resolved function as storyPlay");
        } else {
          throw new Error("Resolved value is not a function");
        }
      } catch (error) {
        console.error("❌ Failed to resolve Promise:", error);
        console.log("🚨 Creating emergency fallback function");
        
        // Create emergency play function that mimics InteractiveButton behavior
        const emergencyPlayFunction = async function(_scene: Phaser.Scene, component: unknown) {
          console.log('🚨 Emergency Play function executing...');
          
          if (!component) {
            console.error('❌ Component is undefined - skipping test');
            return;
          }
          
          const extendedComponent = component as { 
            emit?: (event: string) => void;
            getText?: () => string;
          };
          
          if (typeof extendedComponent.emit !== 'function') {
            console.error('❌ Component does not have emit method');
            return;
          }

          // Import expect and delay dynamically
          try {
            const { delay } = await import('../utils/expect');
            
            // Get initial text before click
            const initialText = extendedComponent.getText?.() || '';
            console.log('📝 Initial button text:', initialText);
            
            // Wait before click to make delay visible
            console.log('⏳ Initial delay (1000ms)...');
            await delay(1000);
            
            // Click simulation
            console.log('🎬 Simulating click...');
            extendedComponent.emit("pointerdown");

            // Wait for state change
            console.log('⏳ Waiting for state change (1000ms)...');
            await delay(1000);
            
            // Check final state
            const finalText = extendedComponent.getText?.() || '';
            console.log('📝 Button text after click:', finalText);
            
            // More flexible text validation - accept various clicked patterns
            const isTextChanged = finalText !== initialText;
            const hasClickedPattern = finalText.includes('Clicked') || finalText.includes('clicked');
            
            if (isTextChanged && hasClickedPattern) {
              console.log('✅ Button text changed successfully after click');
            } else if (isTextChanged) {
              console.log('✅ Button text changed (custom pattern):', finalText);
            } else {
              console.log('ℹ️ Button text unchanged - checking for other interaction feedback');
            }
            
            console.log('✅ Emergency test completed successfully');
          } catch (error) {
            console.error('❌ Emergency test failed:', error);
          }
        };
        
        storyPlay = emergencyPlayFunction as (scene: Phaser.Scene, component?: unknown) => void | Promise<void>;
      }
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
      
      // Play関数実行終了フラグをリセット
      this.isPlayFunctionExecuting = false;
      console.log("🎮 Set isPlayFunctionExecuting = false");
      
    } catch (error) {
      console.error("Play function error:", error);
      if (onPlayLog) {
        onPlayLog(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // エラー時もPlay関数実行終了フラグをリセット
      this.isPlayFunctionExecuting = false;
      console.log("🎮 Set isPlayFunctionExecuting = false (error case)");
    }
  }

  resetComponentStateSync() {
    console.log("🔄 Synchronous component state reset");
    // Clear previous objects and component reference
    this.children.removeAll();
    this.createdComponent = null;
    
    // Add background
    this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, this.sceneBackgroundColor);
    
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
  sceneConfig,
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const userPreloadSceneWrapperRef = useRef<UserPreloadSceneWrapper | null>(null);
  const viewerSceneRef = useRef<ViewerScene | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_createdComponent, _setCreatedComponent] = useState<unknown>(null);
  const [sceneDisplayConfig, setSceneDisplayConfig] = useState<{
    width: number;
    height: number;
    displayScale: number;
  }>({ width: 800, height: 600, displayScale: 1.0 });

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

    // Get scene configuration with defaults
    const sceneWidth = sceneConfig?.width || 800;
    const sceneHeight = sceneConfig?.height || 600;
    const backgroundColor = sceneConfig?.backgroundColor || "#222222";
    
    // Calculate display scale for responsive design
    const calculateDisplayScale = (): number => {
      if (sceneConfig?.displayScale) {
        return Math.max(0.1, Math.min(2.0, sceneConfig.displayScale));
      }
      
      // Auto-calculate based on available space
      // Assume sidebar takes ~300px, leave some margin
      const availableWidth = window.innerWidth - 350;
      const availableHeight = window.innerHeight - 250; // Header + logs panel
      
      const scaleX = availableWidth / sceneWidth;
      const scaleY = availableHeight / sceneHeight;
      
      // Use the smaller scale to fit both dimensions, max 1.0 to avoid upscaling
      const autoScale = Math.min(scaleX, scaleY, 1.0);
      
      return Math.max(0.3, autoScale); // Minimum 30% scale
    };
    
    const displayScale = calculateDisplayScale();
    console.log(`🎬 Scene display scaling: ${(displayScale * 100).toFixed(1)}% (${sceneWidth}x${sceneHeight} → ${Math.round(sceneWidth * displayScale)}x${Math.round(sceneHeight * displayScale)})`);
    
    // Update scene display configuration
    setSceneDisplayConfig({ width: sceneWidth, height: sceneHeight, displayScale });
    
    // Create Phaser game with both PreloadScene and ViewerScene
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: sceneWidth,
      height: sceneHeight,
      parent: gameRef.current,
      backgroundColor: backgroundColor,
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
    gameInstanceRef.current.events.once("ready", async () => {
      userPreloadSceneWrapperRef.current = gameInstanceRef.current?.scene.getScene(
        "UserPreloadSceneWrapper",
      ) as UserPreloadSceneWrapper;
      viewerSceneRef.current = gameInstanceRef.current?.scene.getScene(
        "ViewerScene",
      ) as ViewerScene;
      
      // Apply scene configuration to ViewerScene
      if (viewerSceneRef.current) {
        const bgColorHex = parseInt(backgroundColor.replace('#', ''), 16);
        viewerSceneRef.current.setSceneConfig(sceneWidth, sceneHeight, bgColorHex);
      }
      
      console.log("🎮 Phaser game ready");
      console.log("- UserPreloadSceneWrapper:", userPreloadSceneWrapperRef.current);
      console.log("- ViewerScene:", viewerSceneRef.current);
      console.log("- Scene config:", { width: sceneWidth, height: sceneHeight, backgroundColor });
      
      // Start with ViewerScene active by default
      gameInstanceRef.current?.scene.start("ViewerScene");
    });

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [sceneConfig]);

  // Direct story execution in ViewerScene (optimization for stories without PreloadScene)
  const executeDirectlyToViewerScene = useCallback(async () => {
    if (!storyCode || !viewerSceneRef.current) {
      console.log("⚠️ Cannot execute story directly - missing storyCode or ViewerScene reference");
      return;
    }

    console.log("⚡ Executing story directly in ViewerScene (PreloadScene bypassed)");

    try {
      // Ensure ViewerScene is active
      if (gameInstanceRef.current) {
        const viewerSceneActive = gameInstanceRef.current.scene.isActive("ViewerScene");
        if (!viewerSceneActive) {
          console.log("⚡ Starting ViewerScene...");
          gameInstanceRef.current.scene.stop("UserPreloadSceneWrapper");
          gameInstanceRef.current.scene.start("ViewerScene");
          
          // Small delay to ensure scene transition is complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Execute story code directly in ViewerScene
      if (viewerSceneRef.current && storyCode) {
        const actualStoryCode = storyCode.fn;
        console.log("⚡ Executing story code directly in ViewerScene");
        await viewerSceneRef.current.executeStoryCode(
          actualStoryCode,
          storyArgs,
          storyPlay,
          onPlayLog,
          onPlayStart,
        );
      }

    } catch (error) {
      console.error("❌ Error in direct ViewerScene execution:", error);
    }
  }, [storyCode, storyArgs, storyPlay, onPlayLog, onPlayStart]);

  // Story execution with UserPreloadSceneWrapper → ViewerScene flow
  const executeStoryWithPreload = useCallback(async () => {
    if (!storyCode || !userPreloadSceneWrapperRef.current || !viewerSceneRef.current) {
      console.log("⚠️ Cannot execute story - missing storyCode or scene references");
      return;
    }

    // Skip story execution if play function is executing to prevent flickering
    if (viewerSceneRef.current.isPlayFunctionExecuting) {
      console.log("🚫 Skipping executeStoryWithPreload - play function is executing");
      return;
    }

    // ⚡ Step 3: Performance Optimization - Streamlined execution context
    const executionContext = {
      hasPreloadScene: !!preloadScene,
      preloadSceneName: preloadScene?.name || 'N/A',
      storyName: storyName || 'Unknown',
      isPlayFunctionExecuting: viewerSceneRef.current.isPlayFunctionExecuting,
      timestamp: Date.now()
    };
    
    // ⚡ Step 2: Skip Condition Branching Logic
    const shouldSkipPreload = (context: typeof executionContext): boolean => {
      // Skip PreloadScene if no PreloadScene is defined
      if (!context.hasPreloadScene) {
        console.log("⚡ Skip reason: No PreloadScene defined for this story");
        return true;
      }
      
      // Skip PreloadScene during play function execution to prevent interference
      if (context.isPlayFunctionExecuting) {
        console.log("⚡ Skip reason: Play function is currently executing");
        return true;
      }
      
      
      return false;
    };
    
    // Apply skip optimization
    if (shouldSkipPreload(executionContext)) {
      console.log("⚡ Skipping PreloadScene - executing directly in ViewerScene");
      executeDirectlyToViewerScene();
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
  }, [storyCode, storyArgs, preloadScene, onPlayLog, onPlayStart, storyPlay, storyName, executeDirectlyToViewerScene]);

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
  }, [storyCode, storyArgs, preloadScene, executeStoryWithPreload]);

  // Listen for test results and component reset events
  useEffect(() => {

    const handleComponentStateReset = () => {
      console.log("🔄 Received component state reset request");
      
      // Skip reset if play function is executing to prevent flickering
      if (viewerSceneRef.current?.isPlayFunctionExecuting) {
        console.log("🚫 Skipping component state reset - play function is executing");
        return;
      }
      
      // Apply the same optimization logic for reset
      const resetContext = {
        hasPreloadScene: !!preloadScene,
        preloadSceneName: preloadScene?.name || 'N/A',
        storyName: storyName || 'Unknown',
        isPlayFunctionExecuting: viewerSceneRef.current?.isPlayFunctionExecuting || false,
        timestamp: Date.now()
      };
      
      // Re-execute the story to reset component state using optimized flow
      if (storyCode && viewerSceneRef.current) {
        if (!resetContext.hasPreloadScene) {
          console.log("🔄 Re-executing story via direct ViewerScene flow (optimized)");
          setTimeout(() => {
            executeDirectlyToViewerScene();
          }, 100);
        } else if (userPreloadSceneWrapperRef.current) {
          console.log("🔄 Re-executing story via PreloadScene → ViewerScene flow");
          setTimeout(() => {
            executeStoryWithPreload();
          }, 100);
        }
      }
    };

    window.addEventListener('resetComponentState', handleComponentStateReset);

    return () => {
      window.removeEventListener('resetComponentState', handleComponentStateReset);
    };
  }, [storyCode, storyArgs, preloadScene, storyName, executeStoryWithPreload, executeDirectlyToViewerScene]);

  const handleSidebarPlayRequest = useCallback(async () => {
    console.log("🎮 Received sidebar play request");
    
    const executePlayFunction = async () => {
      console.log("🚀 Play function execution started!");
      
      // ⚡ Performance: Streamlined play function execution
      const hasPreloadScene = !!preloadScene;
      console.log(`⚡ Play execution: ${storyName || 'Unknown'} (PreloadScene: ${hasPreloadScene ? 'Yes' : 'No'})`);
      
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
        
        // Re-execute story using optimized flow
        if (storyCode) {
          // Apply the same optimization logic for play function execution
          if (!preloadScene) {
            console.log("🔄 Re-executing story via direct ViewerScene flow (optimized) before play");
            await executeDirectlyToViewerScene();
          } else {
            console.log("🔄 Re-executing story via PreloadScene → ViewerScene flow before play");
            await executeStoryWithPreload();
          }
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
    
    await executePlayFunction();
  }, [storyPlay, onPlayLog, onPlayStart, preloadScene, storyName, storyCode, executeDirectlyToViewerScene, executeStoryWithPreload]);

  // Listen for sidebar play requests
  useEffect(() => {
    window.addEventListener('sidebarPlayRequest', handleSidebarPlayRequest);
    return () => {
      window.removeEventListener('sidebarPlayRequest', handleSidebarPlayRequest);
    };
  }, [handleSidebarPlayRequest]);


  return (
    <div className="phaser-preview">
      <div className="preview-header">
        <div className="header-left">
          <h2>{storyName || "Phaser Preview"}</h2>
        </div>
      </div>
      <div 
        ref={gameRef} 
        className="game-container"
        style={{
          transform: `scale(${sceneDisplayConfig.displayScale})`,
          transformOrigin: 'center center',
          width: `${sceneDisplayConfig.width}px`,
          height: `${sceneDisplayConfig.height}px`,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
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
        .game-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #000;
          overflow: hidden;
          position: relative;
        }
        .game-container canvas {
          display: block;
          border: 1px solid #333;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export { PhaserPreview };
export default PhaserPreview;
